import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Alert
} from '@mui/material';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    dashboardTitle: 'Jenkins Dashboard',
    refreshInterval: 300,
    itemsPerPage: 50,
    inactiveThreshold: 60,
    timezone: 'UTC',
    notifications: true,
    autoSync: true
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: Implement settings save
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Dashboard Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dashboard Configuration
              </Typography>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Dashboard Title"
                  value={settings.dashboardTitle}
                  onChange={(e) => handleChange('dashboardTitle', e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Refresh Interval (seconds)"
                  type="number"
                  value={settings.refreshInterval}
                  onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Items per Page"
                  type="number"
                  value={settings.itemsPerPage}
                  onChange={(e) => handleChange('itemsPerPage', parseInt(e.target.value))}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Inactive Job Threshold (days)"
                  type="number"
                  value={settings.inactiveThreshold}
                  onChange={(e) => handleChange('inactiveThreshold', parseInt(e.target.value))}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Timezone"
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  margin="normal"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notifications & Sync
              </Typography>
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications}
                      onChange={(e) => handleChange('notifications', e.target.checked)}
                    />
                  }
                  label="Enable Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoSync}
                      onChange={(e) => handleChange('autoSync', e.target.checked)}
                    />
                  }
                  label="Auto Sync with Jenkins"
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Test Job Detection
              </Typography>
              <TextField
                fullWidth
                label="Test Keywords (comma-separated)"
                defaultValue="test,testing,tst,demo,trial,experiment"
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                fullWidth
                label="Exclude Words (comma-separated)"
                defaultValue="latest,saastest,attest,contest,detest,protest"
                margin="normal"
                multiline
                rows={2}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" color="primary" onClick={handleSave} sx={{ mr: 2 }}>
                  Save Settings
                </Button>
                <Button variant="outlined" color="secondary" sx={{ mr: 2 }}>
                  Reset to Defaults
                </Button>
                <Button variant="outlined" color="error">
                  Clear Cache
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings; 