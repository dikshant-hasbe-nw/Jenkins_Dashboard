import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  InputAdornment,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Stop,
  Refresh,
  Search,
  Download,
  OpenInNew,
  Schedule,
  Build,
  ExpandMore,
  FilterList,
  Folder
} from '@mui/icons-material';
import axios from 'axios';

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

const Pipelines: React.FC = () => {
  const [jobs, setJobs] = useState<JenkinsJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JenkinsJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [folderFilter, setFolderFilter] = useState<string>('all');
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/jenkins/jobs');
      const jobsData = response.data.data;
      setJobs(jobsData);
      setFilteredJobs(jobsData);
      
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load pipeline data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Get unique folders
  const getFolders = () => {
    const folders = new Set<string>();
    jobs.forEach(job => {
      const folderName = job.name.includes('/') ? job.name.split('/')[0] : 'Root';
      folders.add(folderName);
    });
    return Array.from(folders).sort();
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = jobs;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Apply folder filter
    if (folderFilter !== 'all') {
      filtered = filtered.filter(job => {
        const jobFolder = job.name.includes('/') ? job.name.split('/')[0] : 'Root';
        return jobFolder === folderFilter;
      });
    }

    // Apply multiple folder filter
    if (selectedFolders.length > 0) {
      filtered = filtered.filter(job => {
        const jobFolder = job.name.includes('/') ? job.name.split('/')[0] : 'Root';
        return selectedFolders.includes(jobFolder);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof JenkinsJob];
      let bValue: any = b[sortBy as keyof JenkinsJob];

      // Handle special cases
      if (sortBy === 'duration') {
        aValue = parseDurationToMinutes(aValue);
        bValue = parseDurationToMinutes(bValue);
      } else if (sortBy === 'lastBuild') {
        aValue = parseTimeAgoToMinutes(aValue);
        bValue = parseTimeAgoToMinutes(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredJobs(filtered);
    setPage(0); // Reset to first page when filters change
  }, [jobs, searchTerm, statusFilter, folderFilter, selectedFolders, sortBy, sortOrder]);

  const parseDurationToMinutes = (duration: string): number => {
    const match = duration.match(/(\d+)m\s*(\d+)s/);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    return 0;
  };

  const parseTimeAgoToMinutes = (timeAgo: string): number => {
    const match = timeAgo.match(/(\d+)\s*(minute|hour|day)/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      switch (unit) {
        case 'minute': return value;
        case 'hour': return value * 60;
        case 'day': return value * 24 * 60;
        default: return 0;
      }
    }
    return 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'failure': return 'error';
      case 'unstable': return 'warning';
      case 'aborted': return 'default';
      case 'not_built': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle color="success" />;
      case 'failure': return <Error color="error" />;
      case 'unstable': return <Warning color="warning" />;
      case 'aborted': return <Stop color="inherit" />;
      case 'not_built': return <Stop color="inherit" />;
      default: return <Stop color="inherit" />;
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleFolderToggle = (folder: string) => {
    setSelectedFolders(prev => 
      prev.includes(folder) 
        ? prev.filter(f => f !== folder)
        : [...prev, folder]
    );
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Status', 'Last Build', 'Duration', 'URL'];
    const csvContent = [
      headers.join(','),
      ...filteredJobs.map(job => [
        `"${job.name}"`,
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
    a.download = `jenkins-pipelines-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusCounts = () => {
    const counts = jobs.reduce((acc: any, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});
    return counts;
  };

  const statusCounts = getStatusCounts();
  const folders = getFolders();

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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Jenkins Pipelines
        </Typography>
        <Box>
          <Tooltip title="Export to CSV">
            <IconButton onClick={exportToCSV} sx={{ mr: 1 }}>
              <Download />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchJobs}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Build color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Pipelines</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {jobs.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Success</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {statusCounts.success || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Error color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Failed</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {statusCounts.failure || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Folder color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Folders</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {folders.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Pipelines"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="failure">Failure</MenuItem>
                <MenuItem value="unstable">Unstable</MenuItem>
                <MenuItem value="aborted">Aborted</MenuItem>
                <MenuItem value="not_built">Not Built</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="status">Status</MenuItem>
                <MenuItem value="duration">Duration</MenuItem>
                <MenuItem value="lastBuild">Last Build</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              Advanced
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Download />}
              onClick={exportToCSV}
            >
              Export CSV
            </Button>
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Folder Filters
            </Typography>
            <Grid container spacing={1}>
              {folders.map((folder) => (
                <Grid item xs={6} sm={4} md={3} key={folder}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedFolders.includes(folder)}
                        onChange={() => handleFolderToggle(folder)}
                        size="small"
                      />
                    }
                    label={`${folder} (${jobs.filter(job => {
                      const jobFolder = job.name.includes('/') ? job.name.split('/')[0] : 'Root';
                      return jobFolder === folder;
                    }).length})`}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Results Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredJobs.length} of {jobs.length} pipelines
          {searchTerm && ` matching "${searchTerm}"`}
          {statusFilter !== 'all' && ` with status "${statusFilter}"`}
          {selectedFolders.length > 0 && ` in folders: ${selectedFolders.join(', ')}`}
        </Typography>
      </Box>

      {/* Pipeline Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell 
                  onClick={() => handleSort('name')}
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  Pipeline Name
                  {sortBy === 'name' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </TableCell>
                <TableCell>Folder</TableCell>
                <TableCell 
                  onClick={() => handleSort('status')}
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  Status
                  {sortBy === 'status' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('duration')}
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  Duration
                  {sortBy === 'duration' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('lastBuild')}
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  Last Build
                  {sortBy === 'lastBuild' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredJobs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((job) => {
                  const jobFolder = job.name.includes('/') ? job.name.split('/')[0] : 'Root';
                  return (
                    <TableRow key={job.id} hover>
                      <TableCell>
                        {getStatusIcon(job.status)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {job.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={jobFolder} 
                          size="small" 
                          variant="outlined"
                          icon={<Folder />}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={job.status} 
                          color={getStatusColor(job.status) as any} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Schedule sx={{ mr: 1, fontSize: 'small' }} />
                          {job.duration}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {job.lastBuild}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Open in Jenkins">
                          <IconButton 
                            size="small" 
                            onClick={() => window.open(job.url, '_blank')}
                          >
                            <OpenInNew />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredJobs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default Pipelines; 