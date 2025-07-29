import { Router } from 'express';

const router = Router();

// @route   GET /api/analytics/performance
// @desc    Get performance analytics
// @access  Public
router.get('/performance', async (req: any, res: any) => {
  try {
    res.json({
      success: true,
      data: {
        buildDurations: [5.2, 12.4, 8.1, 15.3, 6.7],
        successRates: [85, 87, 89, 86, 88],
        failureTrends: [12, 10, 8, 11, 9]
      }
    });
  } catch (error) {
    console.error('Performance analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/analytics/cleanup
// @desc    Get cleanup insights
// @access  Public
router.get('/cleanup', async (req: any, res: any) => {
  try {
    // Generate more realistic cleanup data for 800+ jobs
    const testJobs = [];
    const inactiveJobs = [];
    const disabledJobs = [];
    
    // Generate test jobs
    for (let i = 1; i <= 45; i++) {
      const daysAgo = Math.floor(Math.random() * 60) + 7; // 7-67 days ago
      testJobs.push({
        name: `test-job-${i}`,
        lastBuild: `${daysAgo} days ago`,
        recommendation: daysAgo > 30 ? 'Safe to delete' : 'Review before deletion'
      });
    }
    
    // Generate inactive jobs
    for (let i = 1; i <= 67; i++) {
      const daysAgo = Math.floor(Math.random() * 180) + 60; // 60-240 days ago
      inactiveJobs.push({
        name: `inactive-job-${i}`,
        lastBuild: `${daysAgo} days ago`,
        recommendation: daysAgo > 120 ? 'Archive and delete' : 'Safe to delete'
      });
    }
    
    // Generate disabled jobs
    for (let i = 1; i <= 23; i++) {
      const daysAgo = Math.floor(Math.random() * 90) + 15; // 15-105 days ago
      disabledJobs.push({
        name: `disabled-job-${i}`,
        disabled: `${daysAgo} days ago`,
        recommendation: daysAgo > 45 ? 'Safe to delete' : 'Review before deletion'
      });
    }
    
    res.json({
      success: true,
      data: {
        testJobs: testJobs.slice(0, 20), // Show first 20 for UI
        inactiveJobs: inactiveJobs.slice(0, 20),
        disabledJobs: disabledJobs.slice(0, 20),
        summary: {
          totalTestJobs: testJobs.length,
          totalInactiveJobs: inactiveJobs.length,
          totalDisabledJobs: disabledJobs.length,
          potentialSavings: `${Math.floor((testJobs.length + inactiveJobs.length + disabledJobs.length) * 0.5)} jobs`
        }
      }
    });
  } catch (error) {
    console.error('Cleanup analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router; 