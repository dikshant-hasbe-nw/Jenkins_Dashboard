import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Stop,
  Refresh,
  TrendingUp,
  Schedule,
  Build,
  Folder,
  Download,
  Info
} from '@mui/icons-material';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

interface DashboardData {
  totalJobs: number;
  successRate: number;
  failureRate: number;
  unstableRate?: number;
  abortedRate?: number;
  avgBuildDuration: number;
  lastSyncTime: string;
  activeJobs?: number;
  disabledJobs?: number;
  testJobs?: number;
}

interface JenkinsJob {
  id: string;
  name: string;
  status: string;
  lastBuild: string;
  duration: string;
  url: string;
  color: string;
}

interface FolderData {
  name: string;
  count: number;
  successCount: number;
  failureCount: number;
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [jobs, setJobs] = useState<JenkinsJob[]>([]);
  const [folderData, setFolderData] = useState<FolderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard overview
      const overviewResponse = await axios.get('/api/dashboard/overview');
      const overviewData = overviewResponse.data.data;
      setDashboardData(overviewData);
      
      // Fetch Jenkins jobs
      const jobsResponse = await axios.get('/api/jenkins/jobs');
      const jobsData = jobsResponse.data.data;
      setJobs(jobsData);
      
      // Calculate folder distribution
      const folderStats = calculateFolderDistribution(jobsData);
      setFolderData(folderStats);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateFolderDistribution = (jobs: JenkinsJob[]): FolderData[] => {
    const folderMap = new Map<string, { count: number; successCount: number; failureCount: number }>();
    
    jobs.forEach(job => {
      const folderName = job.name.includes('/') ? job.name.split('/')[0] : 'Root';
      const current = folderMap.get(folderName) || { count: 0, successCount: 0, failureCount: 0 };
      
      current.count++;
      if (job.status === 'success') current.successCount++;
      if (job.status === 'failure') current.failureCount++;
      
      folderMap.set(folderName, current);
    });
    
    return Array.from(folderMap.entries()).map(([name, stats]) => ({
      name,
      count: stats.count,
      successCount: stats.successCount,
      failureCount: stats.failureCount
    })).sort((a, b) => b.count - a.count).slice(0, 10); // Top 10 folders
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await axios.post('/api/jenkins/sync');
      await fetchDashboardData();
      setSyncDialogOpen(false);
    } catch (err) {
      console.error('Sync failed:', err);
      setError('Failed to sync data from Jenkins');
    } finally {
      setSyncing(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Status', 'Last Build', 'Duration', 'URL'];
    const csvContent = [
      headers.join(','),
      ...jobs.map(job => [
        job.name,
        job.status,
        job.lastBuild,
        job.duration,
        job.url
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jenkins-jobs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'failure': return 'error';
      case 'unstable': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle color="success" />;
      case 'failure': return <Error color="error" />;
      case 'unstable': return <Warning color="warning" />;
      default: return <Stop color="inherit" />;
    }
  };

  // Chart data
  const statusChartData = {
    labels: ['Success', 'Failure', 'Unstable', 'Aborted', 'Not Built'],
    datasets: [{
      data: [
        jobs.filter(j => j.status === 'success').length,
        jobs.filter(j => j.status === 'failure').length,
        jobs.filter(j => j.status === 'unstable').length,
        jobs.filter(j => j.status === 'aborted').length,
        jobs.filter(j => j.status === 'not_built').length
      ],
      backgroundColor: ['#4caf50', '#f44336', '#ff9800', '#9e9e9e', '#607d8b'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const folderChartData = {
    labels: folderData.map(f => f.name),
    datasets: [{
      label: 'Total Jobs',
      data: folderData.map(f => f.count),
      backgroundColor: 'rgba(54, 162, 235, 0.8)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="warning">No dashboard data available</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard Overview
        </Typography>
        <Box>
          <Tooltip title="Export to CSV">
            <IconButton onClick={exportToCSV} sx={{ mr: 1 }}>
              <Download />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sync from Jenkins">
            <IconButton onClick={() => setSyncDialogOpen(true)}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Build color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Jobs</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {dashboardData.totalJobs}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Success Rate</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {dashboardData.successRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Avg Duration</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {dashboardData.avgBuildDuration}m
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Refresh color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Last Sync</Typography>
              </Box>
              <Typography variant="h6" color="info.main">
                {dashboardData.lastSyncTime}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Visualizations */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job Status Distribution
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Jobs by Folder (Top 10)
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar 
                  data={folderChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Folder Distribution Table */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Folder Distribution
              </Typography>
              <Box sx={{ mt: 2 }}>
                {folderData.map((folder, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Folder color="primary" sx={{ mr: 1 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {folder.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {folder.successCount} success, {folder.failureCount} failed
                      </Typography>
                    </Box>
                    <Chip label={folder.count} color="primary" size="small" />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Box sx={{ mt: 2 }}>
                {jobs.slice(0, 5).map((job, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getStatusIcon(job.status)}
                    <Box sx={{ ml: 1, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {job.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {job.duration} • {job.lastBuild}
                      </Typography>
                    </Box>
                    <Chip 
                      label={job.status} 
                      color={getStatusColor(job.status) as any} 
                      size="small" 
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sync Confirmation Dialog */}
      <Dialog open={syncDialogOpen} onClose={() => setSyncDialogOpen(false)}>
        <DialogTitle>Sync Data from Jenkins</DialogTitle>
        <DialogContent>
          <Typography>
            This will fetch the latest data from Jenkins. This may take a few moments.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSyncDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSync} 
            variant="contained" 
            disabled={syncing}
            startIcon={syncing ? <CircularProgress size={16} /> : <Refresh />}
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 