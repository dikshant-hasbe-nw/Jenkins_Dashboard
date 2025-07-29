import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress
} from '@mui/material';

const Analytics: React.FC = () => {
  const mockData = {
    buildDurations: {
      avg: 12.5,
      min: 2.3,
      max: 45.2,
      trend: 'increasing'
    },
    successRates: {
      current: 87.5,
      previous: 85.2,
      trend: 'improving'
    },
    failureTrends: {
      current: 8.2,
      previous: 10.1,
      trend: 'decreasing'
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Analytics & Performance
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Build Duration Analysis
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Average Duration</Typography>
                  <Typography variant="body2" color="primary">
                    {mockData.buildDurations.avg} minutes
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={70} 
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Minimum Duration</Typography>
                  <Typography variant="body2" color="success.main">
                    {mockData.buildDurations.min} minutes
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={30} 
                  color="success"
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Maximum Duration</Typography>
                  <Typography variant="body2" color="warning.main">
                    {mockData.buildDurations.max} minutes
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={90} 
                  color="warning"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Success Rate Trends
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Current Success Rate</Typography>
                  <Typography variant="body2" color="success.main">
                    {mockData.successRates.current}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={mockData.successRates.current} 
                  color="success"
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Previous Period</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {mockData.successRates.previous}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={mockData.successRates.previous} 
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" color="success.main">
                  Trend: {mockData.successRates.trend} 📈
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Failure Analysis
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Current Failure Rate</Typography>
                  <Typography variant="body2" color="error.main">
                    {mockData.failureTrends.current}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={mockData.failureTrends.current} 
                  color="error"
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Previous Period</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {mockData.failureTrends.previous}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={mockData.failureTrends.previous} 
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" color="success.main">
                  Trend: {mockData.failureTrends.trend} 📉
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics; 