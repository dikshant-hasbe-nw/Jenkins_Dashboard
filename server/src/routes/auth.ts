import { Router } from 'express';

const router = Router();

// @route   POST /api/auth/login
// @desc    Mock login - always succeeds
// @access  Public
router.post('/login', async (req: any, res: any) => {
  res.json({
    success: true,
    token: 'mock-token',
    user: {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN'
    }
  });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Public
router.get('/me', async (req: any, res: any) => {
  res.json({
    success: true,
    user: {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      preferences: {
        theme: 'light',
        timezone: 'UTC',
        refreshRate: 300
      }
    }
  });
});

export default router; 