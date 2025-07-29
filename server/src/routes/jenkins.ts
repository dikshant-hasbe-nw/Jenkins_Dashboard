import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Helper function to fetch Jenkins data
const fetchJenkinsData = async (endpoint: string) => {
  const jenkinsUrl = process.env['JENKINS_BASE_URL'];
  const username = process.env['JENKINS_USER'];
  const token = process.env['JENKINS_TOKEN'];

  if (!jenkinsUrl || !username || !token) {
    throw new Error('Jenkins credentials not configured');
  }

  const auth = Buffer.from(`${username}:${token}`).toString('base64');
  const url = `${jenkinsUrl.replace(/\/$/, '')}${endpoint}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      },
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    console.error(`Jenkins API error for ${endpoint}:`, error);
    throw error;
  }
};

// Helper function to recursively fetch all jobs from folders
const fetchAllJobs = async (baseUrl: string, auth: string): Promise<any[]> => {
  const allJobs: any[] = [];
  
  const fetchJobsFromPath = async (path: string = ''): Promise<void> => {
    // Enhanced API call to get more detailed information including build duration
    const url = `${baseUrl}${path}/api/json?tree=jobs[name,url,_class,lastBuild[result,url,timestamp,duration],lastSuccessfulBuild[timestamp,duration],lastFailedBuild[timestamp,duration],builds[timestamp,result,duration],property[parameterDefinitions[name,defaultParameterValue[value]]],buildable,color]`;
    
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        },
        timeout: 30000
      });
      
      const data = response.data;
      if (data.jobs) {
        for (const job of data.jobs) {
          if (job._class === 'com.cloudbees.hudson.plugins.folder.Folder') {
            // This is a folder, recursively fetch jobs from it
            const folderPath = path + '/job/' + job.name;
            await fetchJobsFromPath(folderPath);
          } else {
            // This is a regular job, process it
            const processedJob = processJobData(job, baseUrl);
            if (processedJob) {
              allJobs.push(processedJob);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching jobs from ${path}:`, error);
    }
  };
  
  await fetchJobsFromPath();
  return allJobs;
};

// Helper function to extract folder from URL
const extractFolderFromUrl = (url: string): string => {
  try {
    const path = url.split("/job/").slice(1);
    const folderPath = path.slice(0, -1).join("/");
    return folderPath ? decodeURIComponent(folderPath) : "/";
  } catch (error) {
    return "/";
  }
};

// Helper function to detect test jobs
const isTestJob = (jobName: string): boolean => {
  if (!jobName) return false;
  
  const jobNameLower = jobName.toLowerCase();
  const testKeywords = (process.env['TEST_JOB_KEYWORDS'] || 'test,testing,tst,demo,trial,experiment').split(',');
  const excludeWords = (process.env['TEST_JOB_EXCLUDE_WORDS'] || '').split(',');
  
  // Check if job name contains any excluded words
  for (const word of excludeWords) {
    if (word.trim() && jobNameLower.includes(word.trim())) {
      return false;
    }
  }
  
  // Check if job name contains any test keywords
  for (const keyword of testKeywords) {
    if (keyword.trim() && jobNameLower.includes(keyword.trim())) {
      return true;
    }
  }
  
  return false;
};

// Helper function to process job data with detailed statistics
const processJobData = (job: any, baseUrl: string) => {
  const jobUrl = job.url || `${baseUrl}/job/${job.name}`;
  const lastBuild = job.lastBuild;
  const lastSuccessful = job.lastSuccessfulBuild;
  const lastFailed = job.lastFailedBuild;
  const builds = job.builds || [];
  
  // Determine if job is disabled (not buildable)
  const isDisabled = !job.buildable;
  
  // Get last build info
  let status = 'Not Built';
  let lastBuildUrl = '';
  let lastBuildDate = null;
  let lastBuildDuration = 0;
  
  if (lastBuild) {
    status = lastBuild.result || 'IN_PROGRESS';
    lastBuildUrl = lastBuild.url || '';
    if (lastBuild.timestamp) {
      lastBuildDate = new Date(lastBuild.timestamp);
    }
    lastBuildDuration = lastBuild.duration || 0;
  }
  
  // Get last successful build info
  let lastSuccessfulDate = null;
  let lastSuccessfulDuration = 0;
  if (lastSuccessful && lastSuccessful.timestamp) {
    lastSuccessfulDate = new Date(lastSuccessful.timestamp);
    lastSuccessfulDuration = lastSuccessful.duration || 0;
  }
  
  // Get last failed build info
  let lastFailedDate = null;
  let lastFailedDuration = 0;
  if (lastFailed && lastFailed.timestamp) {
    lastFailedDate = new Date(lastFailed.timestamp);
    lastFailedDuration = lastFailed.duration || 0;
  }
  
  // Calculate days since last build
  let daysSinceLastBuild = null;
  if (lastBuildDate) {
    daysSinceLastBuild = Math.floor((Date.now() - lastBuildDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  // Calculate success/failure rates and duration statistics from build history
  const totalBuilds = builds.length;
  let successCount = 0;
  let failureCount = 0;
  let successRate = 0.0;
  const buildDurations: number[] = [];
  const successfulDurations: number[] = [];
  const failedDurations: number[] = [];
  
  if (builds.length > 0) {
    for (const build of builds) {
      const buildResult = build.result;
      const buildDuration = build.duration || 0;
      
      if (buildDuration > 0) {
        buildDurations.push(buildDuration);
        
        if (buildResult === 'SUCCESS') {
          successCount++;
          successfulDurations.push(buildDuration);
        } else if (['FAILURE', 'UNSTABLE', 'ABORTED'].includes(buildResult)) {
          failureCount++;
          failedDurations.push(buildDuration);
        }
      }
    }
    
    if (totalBuilds > 0) {
      successRate = (successCount / totalBuilds) * 100;
    }
  }
  
  // Calculate duration statistics
  const avgBuildDuration = buildDurations.length > 0 ? buildDurations.reduce((a, b) => a + b, 0) / buildDurations.length : 0;
  const avgSuccessfulDuration = successfulDurations.length > 0 ? successfulDurations.reduce((a, b) => a + b, 0) / successfulDurations.length : 0;
  const avgFailedDuration = failedDurations.length > 0 ? failedDurations.reduce((a, b) => a + b, 0) / failedDurations.length : 0;
  const minBuildDuration = buildDurations.length > 0 ? Math.min(...buildDurations) : 0;
  const maxBuildDuration = buildDurations.length > 0 ? Math.max(...buildDurations) : 0;
  
  // Test job detection
  const isTestJobResult = isTestJob(job.name);
  
  return {
    id: job.name,
    name: job.name,
    url: jobUrl,
    type: job._class,
    lastBuildStatus: status,
    lastBuildUrl: lastBuildUrl,
    folder: extractFolderFromUrl(jobUrl),
    isDisabled: isDisabled,
    lastBuildDate: lastBuildDate,
    lastSuccessfulDate: lastSuccessfulDate,
    lastFailedDate: lastFailedDate,
    daysSinceLastBuild: daysSinceLastBuild,
    totalBuilds: totalBuilds,
    successCount: successCount,
    failureCount: failureCount,
    successRate: Math.round(successRate * 10) / 10,
    isTestJob: isTestJobResult,
    // Duration data
    lastBuildDuration: lastBuildDuration,
    lastSuccessfulDuration: lastSuccessfulDuration,
    lastFailedDuration: lastFailedDuration,
    avgBuildDuration: Math.round(avgBuildDuration),
    avgSuccessfulDuration: Math.round(avgSuccessfulDuration),
    avgFailedDuration: Math.round(avgFailedDuration),
    minBuildDuration: minBuildDuration,
    maxBuildDuration: maxBuildDuration,
    totalBuildDuration: buildDurations.reduce((a, b) => a + b, 0),
    // Legacy fields for compatibility
    status: status,
    lastBuild: lastBuildDate ? formatTimeAgo(lastBuildDate.getTime()) : 'Never built',
    duration: lastBuildDuration ? formatDuration(lastBuildDuration) : 'N/A',
    color: job.color || 'grey',
    lastBuildNumber: lastBuild?.number || 0,
    lastSuccessfulBuild: lastSuccessful?.number || null,
    lastFailedBuild: lastFailed?.number || null,
    inQueue: job.inQueue || false,
    buildable: job.buildable !== false
  };
};

// Helper function to format duration
const formatDuration = (durationMs: number) => {
  if (!durationMs) return 'N/A';
  
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
};

// Helper function to format time ago
const formatTimeAgo = (timestamp: number) => {
  if (!timestamp) return 'Never built';
  
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

// @route   GET /api/jenkins/jobs
// @desc    Get all Jenkins jobs
// @access  Public
router.get('/jobs', async (req: any, res: any) => {
  try {
    console.log('Fetching all jobs from Jenkins (including folders)...');
    
    const jenkinsUrl = process.env['JENKINS_BASE_URL'];
    const username = process.env['JENKINS_USER'];
    const token = process.env['JENKINS_TOKEN'];

    if (!jenkinsUrl || !username || !token) {
      throw new Error('Jenkins credentials not configured');
    }

    const auth = Buffer.from(`${username}:${token}`).toString('base64');
    const baseUrl = jenkinsUrl.replace(/\/$/, '');
    
    // Fetch all jobs recursively from folders
    const allJobs = await fetchAllJobs(baseUrl, auth);
    
    // Jobs are already processed by processJobData function
    const jobs = allJobs;
    
    console.log(`Fetched ${jobs.length} real jobs from Jenkins (including all folders)`);
    
    res.json({
      success: true,
      data: jobs,
      message: `Retrieved ${jobs.length} Jenkins jobs from all folders`,
      total: jobs.length,
      lastSync: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching Jenkins jobs:', error);
    
    // Fallback to mock data if Jenkins is not accessible
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.response?.status === 401) {
      console.log('Falling back to mock data due to Jenkins connection issues');
      
      // Generate mock data as fallback
      const mockJobs = [];
      const statuses = ['success', 'failure', 'unstable', 'aborted', 'not_built'];
      const jobTypes = ['build', 'test', 'deploy', 'integration', 'release', 'hotfix', 'feature'];
      const prefixes = ['frontend', 'backend', 'api', 'mobile', 'web', 'service', 'microservice', 'database', 'infrastructure'];
      
      for (let i = 1; i <= 856; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const jobName = `${prefix}-${jobType}-${i}`;
        
        const durationMinutes = Math.floor(Math.random() * 30) + 1;
        const durationSeconds = Math.floor(Math.random() * 60);
        const duration = `${durationMinutes}m ${durationSeconds}s`;
        
        const timeAgoOptions = [
          '1 minute ago', '2 minutes ago', '5 minutes ago', '10 minutes ago',
          '15 minutes ago', '30 minutes ago', '1 hour ago', '2 hours ago',
          '3 hours ago', '6 hours ago', '12 hours ago', '1 day ago'
        ];
        const lastBuild = timeAgoOptions[Math.floor(Math.random() * timeAgoOptions.length)];
        
        mockJobs.push({
          id: i.toString(),
          name: jobName,
          status: status,
          lastBuild: lastBuild,
          duration: duration,
          url: `https://jenkins.example.com/job/${jobName}`,
          color: status === 'success' ? 'blue' : status === 'failure' ? 'red' : status === 'unstable' ? 'yellow' : 'grey'
        });
      }
      
      res.json({
        success: true,
        data: mockJobs,
        message: `Mock data: ${mockJobs.length} Jenkins jobs (Jenkins connection failed)`,
        total: mockJobs.length,
        lastSync: new Date().toISOString(),
        warning: 'Using mock data - check Jenkins configuration'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch Jenkins data',
        error: error.message 
      });
    }
  }
});

// @route   POST /api/jenkins/sync
// @desc    Sync data from Jenkins
// @access  Public
router.post('/sync', async (req: any, res: any) => {
  try {
    console.log('Syncing all jobs from Jenkins (including folders)...');
    
    const jenkinsUrl = process.env['JENKINS_BASE_URL'];
    const username = process.env['JENKINS_USER'];
    const token = process.env['JENKINS_TOKEN'];

    if (!jenkinsUrl || !username || !token) {
      throw new Error('Jenkins credentials not configured');
    }

    const auth = Buffer.from(`${username}:${token}`).toString('base64');
    const baseUrl = jenkinsUrl.replace(/\/$/, '');
    
    // Fetch all jobs recursively from folders
    const allJobs = await fetchAllJobs(baseUrl, auth);
    
    // Jobs are already processed by processJobData function
    const jobs = allJobs;
    
    console.log(`Synced ${jobs.length} jobs from Jenkins (including all folders)`);
    
    res.json({
      success: true,
      message: `Successfully synced ${jobs.length} jobs from Jenkins (including all folders)`,
      total: jobs.length,
      lastSync: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to sync from Jenkins',
      error: error.message 
    });
  }
});

export default router; 