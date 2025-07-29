import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  // Simplified auth for now - just pass through
  req.user = { id: '1', email: 'admin@example.com', role: 'ADMIN' };
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }

    next();
  };
}; 