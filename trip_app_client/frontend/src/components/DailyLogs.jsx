import React from 'react'
import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material'
import ELDChart from './ELDChart'

function DailyLogs({
  logs,
  currentLocation,
  pickupLocation,
  dropoffLocation,
  currentCycleUsed
}) {
 
  return (
    <div style={{ marginTop: '1rem' }}>

      <Box sx={{ mt: 3 }}>
      <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 2 // margin bottom
    }}
  >
    <Typography variant="h5" gutterBottom>
      Daily Logs
    </Typography>
   
  </Box>
      <Card variant="outlined" sx={{ mb: 2 }}>
  
      <CardHeader title="Trip Information" />
    

   
      <CardContent>
        <Typography variant="body1" gutterBottom>
          <strong>Current Location:</strong> {currentLocation || 'N/A'}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Pickup Location:</strong> {pickupLocation || 'N/A'}
        </Typography>
        <Typography variant="body1">
          <strong>Dropoff Location:</strong> {dropoffLocation || 'N/A'}
        </Typography>
        <Typography variant="body1">
          <strong>Current Cycle Used:</strong> {currentCycleUsed || 0}
        </Typography>
      </CardContent>
    </Card>

      {logs.map((dayLog, idx) => (
        <Card key={idx} sx={{ mb: 3 }}>
          <CardHeader
            title={`Day ${dayLog.day} - ${dayLog.date}`}
            subheader={`Driving: ${dayLog.driving} hrs, On-Duty: ${dayLog.onDutyNotDriving} hrs, Off-Duty: ${dayLog.offDuty} hrs`}
          />
          <CardContent>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Total On-Duty: {dayLog.totalOnDuty} hrs, Cycle Hours Used: {dayLog.cycleHoursUsed} hrs
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <ELDChart segments={dayLog.segments} width={600} height={200} />
            </Box>

            {dayLog.statusTotals && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Duty Status Totals (hrs):</Typography>
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  <li>Off Duty: {dayLog.statusTotals.off_duty}</li>
                  <li>Sleeper: {dayLog.statusTotals.sleeper}</li>
                  <li>Driving: {dayLog.statusTotals.driving}</li>
                  <li>On Duty (Not Driving): {dayLog.statusTotals.on_duty_not_driving}</li>
                </ul>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>



    </div>
  )
}

export default DailyLogs
