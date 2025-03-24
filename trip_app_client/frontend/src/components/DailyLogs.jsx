// src/components/DailyLogs.jsx

import React from 'react'
import { Card, CardContent, CardHeader, Typography, Grid, Box } from '@mui/material'
import ELDChart from './ELDChart'

function DailyLogs({ logs }) {

  console.log(logs)

  if (!logs || logs.length === 0) {
    return <Typography>No daily logs to display.</Typography>
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>Daily Logs</Typography>
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
  )
}

export default DailyLogs
