import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button
} from '@mui/material';
import {
  Delete,
  Warning,
  Info
} from '@mui/icons-material';

const Cleanup: React.FC = () => {
  const mockData = {
    testJobs: [
      { name: 'test-frontend', lastBuild: '15 days ago', recommendation: 'Safe to delete' },
      { name: 'integration-test', lastBuild: '8 days ago', recommendation: 'Review before deletion' },
      { name: 'demo-pipeline', lastBuild: '3 days ago', recommendation: 'Keep for demo purposes' }
    ],
    inactiveJobs: [
      { name: 'old-deployment', lastBuild: '75 days ago', recommendation: 'Safe to delete' },
      { name: 'legacy-build', lastBuild: '120 days ago', recommendation: 'Archive and delete' },
      { name: 'experimental-feature', lastBuild: '90 days ago', recommendation: 'Review with team' }
    ],
    disabledJobs: [
      { name: 'deprecated-pipeline', disabled: '30 days ago', recommendation: 'Safe to delete' },
      { name: 'broken-build', disabled: '15 days ago', recommendation: 'Fix or delete' },
      { name: 'temporary-job', disabled: '5 days ago', recommendation: 'Review purpose' }
    ]
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation.includes('Safe')) return 'success';
    if (recommendation.includes('Review')) return 'warning';
    if (recommendation.includes('Keep')) return 'info';
    return 'default';
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Cleanup Insights
      </Typography>

      <Grid container spacing={3}>
        {/* Test Jobs */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Info color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Test Jobs</Typography>
                <Chip label={mockData.testJobs.length} color="info" size="small" sx={{ ml: 'auto' }} />
              </Box>
              <List dense>
                {mockData.testJobs.map((job, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Info color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary={job.name}
                      secondary={`Last build: ${job.lastBuild}`}
                    />
                    <Chip 
                      label={job.recommendation} 
                      color={getRecommendationColor(job.recommendation) as any}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Inactive Jobs */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Inactive Jobs</Typography>
                <Chip label={mockData.inactiveJobs.length} color="warning" size="small" sx={{ ml: 'auto' }} />
              </Box>
              <List dense>
                {mockData.inactiveJobs.map((job, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={job.name}
                      secondary={`Last build: ${job.lastBuild}`}
                    />
                    <Chip 
                      label={job.recommendation} 
                      color={getRecommendationColor(job.recommendation) as any}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Disabled Jobs */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Delete color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Disabled Jobs</Typography>
                <Chip label={mockData.disabledJobs.length} color="error" size="small" sx={{ ml: 'auto' }} />
              </Box>
              <List dense>
                {mockData.disabledJobs.map((job, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Delete color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={job.name}
                      secondary={`Disabled: ${job.disabled}`}
                    />
                    <Chip 
                      label={job.recommendation} 
                      color={getRecommendationColor(job.recommendation) as any}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cleanup Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {mockData.testJobs.length + mockData.inactiveJobs.length + mockData.disabledJobs.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Jobs for Review
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {mockData.inactiveJobs.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Inactive Jobs
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">
                      {mockData.disabledJobs.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Disabled Jobs
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button variant="contained" color="primary" sx={{ mr: 2 }}>
                  Generate Cleanup Report
                </Button>
                <Button variant="outlined" color="secondary">
                  Export Recommendations
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Cleanup; 