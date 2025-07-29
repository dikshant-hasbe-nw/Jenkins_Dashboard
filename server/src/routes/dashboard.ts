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
    const url = `${baseUrl}${path}/api/json?tree=jobs[name,url,color,lastBuild[number,timestamp,duration],lastSuccessfulBuild[number],lastFailedBuild[number],inQueue,buildable,_class]`;
    
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
            // This is a regular job, add it to our list
            allJobs.push(job);
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

// Helper function to calculate metrics from jobs
const calculateMetrics = (jobs: any[]) => {
  const totalJobs = jobs.length;
  const successJobs = jobs.filter(job => job.color === 'blue' || job.color === 'green').length;
  const failureJobs = jobs.filter(job => job.color === 'red').length;
  const unstableJobs = jobs.filter(job => job.color === 'yellow').length;
  const abortedJobs = jobs.filter(job => job.color === 'aborted').length;
  const notBuiltJobs = jobs.filter(job => job.color === 'grey' || job.color === 'notbuilt').length;
  
  const successRate = totalJobs > 0 ? (successJobs / totalJobs) * 100 : 0;
  const failureRate = totalJobs > 0 ? (failureJobs / totalJobs) * 100 : 0;
  const unstableRate = totalJobs > 0 ? (unstableJobs / totalJobs) * 100 : 0;
  const abortedRate = totalJobs > 0 ? (abortedJobs / totalJobs) * 100 : 0;
  
  // Calculate average build duration
  const jobsWithDuration = jobs.filter(job => job.lastBuild && job.lastBuild.duration);
  const totalDuration = jobsWithDuration.reduce((sum: number, job: any) => sum + job.lastBuild.duration, 0);
  const avgBuildDuration = jobsWithDuration.length > 0 ? Math.round(totalDuration / jobsWithDuration.length / 60000) : 0;
  
  // Count active jobs (built in last 7 days)
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const activeJobs = jobs.filter(job => job.lastBuild && job.lastBuild.timestamp > sevenDaysAgo).length;
  
  // Count disabled jobs
  const disabledJobs = jobs.filter(job => job.buildable === false).length;
  
  // Count test jobs (jobs with test-related keywords)
  const testKeywords = (process.env['TEST_JOB_KEYWORDS'] || 'test,testing,tst,demo,trial,experiment').split(',');
  const excludeWords = (process.env['TEST_JOB_EXCLUDE_WORDS'] || '').split(',');
  
  const testJobs = jobs.filter(job => {
    const jobName = job.name.toLowerCase();
    const hasTestKeyword = testKeywords.some(keyword => jobName.includes(keyword.trim()));
    const hasExcludeWord = excludeWords.some(word => jobName.includes(word.trim()));
    return hasTestKeyword && !hasExcludeWord;
  }).length;
  
  return {
    totalJobs,
    successRate: Math.round(successRate * 10) / 10,
    failureRate: Math.round(failureRate * 10) / 10,
    unstableRate: Math.round(unstableRate * 10) / 10,
    abortedRate: Math.round(abortedRate * 10) / 10,
    avgBuildDuration,
    activeJobs,
    disabledJobs,
    testJobs
  };
};

// @route   GET /api/dashboard/overview
// @desc    Get dashboard overview data
// @access  Public
router.get('/overview', async (req: any, res: any) => {
  try {
    console.log('Fetching dashboard overview from Jenkins (including all folders)...');
    
    const jenkinsUrl = process.env['JENKINS_BASE_URL'];
    const username = process.env['JENKINS_USER'];
    const token = process.env['JENKINS_TOKEN'];

    if (!jenkinsUrl || !username || !token) {
      throw new Error('Jenkins credentials not configured');
    }

    const auth = Buffer.from(`${username}:${token}`).toString('base64');
    const baseUrl = jenkinsUrl.replace(/\/$/, '');
    
    // Fetch all jobs recursively from folders
    const jobs = await fetchAllJobs(baseUrl, auth);
    
    // Calculate real metrics
    const metrics = calculateMetrics(jobs);
    
    console.log(`Calculated metrics for ${jobs.length} jobs from all folders`);
    
    res.json({
      success: true,
      data: {
        ...metrics,
        lastSyncTime: 'Just now'
      }
    });
  } catch (error: any) {
    console.error('Error fetching dashboard overview:', error);
    
    // Fallback to mock data if Jenkins is not accessible
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.response?.status === 401) {
      console.log('Falling back to mock dashboard data');
      
      res.json({
        success: true,
        data: {
          totalJobs: 856,
          successRate: 78.3,
          failureRate: 12.7,
          unstableRate: 6.8,
          abortedRate: 2.2,
          avgBuildDuration: 18.5,
          lastSyncTime: 'Mock data - check Jenkins configuration',
          activeJobs: 234,
          disabledJobs: 45,
          testJobs: 123
        },
        warning: 'Using mock data - check Jenkins configuration'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch dashboard data',
        error: error.message 
      });
    }
  }
});

// @route   GET /api/dashboard/widgets
// @desc    Get dashboard widgets
// @access  Public
router.get('/widgets', async (req: any, res: any) => {
  try {
    res.json({
      success: true,
      data: [
        { id: '1', name: 'Job Status', type: 'chart', config: {} },
        { id: '2', name: 'Build Duration', type: 'chart', config: {} }
      ]
    });
  } catch (error) {
    console.error('Widgets error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router; 