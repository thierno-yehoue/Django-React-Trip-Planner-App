// src/App.jsx

import React, { useState } from 'react'
import { Container, AppBar, Toolbar, Typography, CircularProgress, Box, Grid2, Card, CardHeader, CardContent } from '@mui/material'
import TripForm from './components/TripForm'
import MapView from './components/MapView'
import DailyLogs from './components/DailyLogs'

function App() {
  const [tripData, setTripData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleResults = (data) => {
    // Called by TripForm after a successful API response
    setTripData(data)
    setLoading(false)
    console.log(data)
  }

  const handleLoading = (isLoading) => {
    // Called by TripForm to indicate request is in progress
    setLoading(isLoading)
  }

  return (
    <>
      {/* Top AppBar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            Trip Planner
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Plan Your Trip
        </Typography>

        {/* The form */}
        <TripForm onResults={handleResults} onLoading={handleLoading} />

        {/* Show loading spinner if the request is in progress */}
        {loading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        )}

        {/* Once we have data and not loading, show results */}
        {tripData && !tripData.error && !loading && (
      
       <>
                  
    <Box sx={{ mt: 4 }}>
            <Card >
              <CardHeader title="Route Map" />
              <Typography variant="h6" gutterBottom>
              Total Distance: {tripData.distanceMiles} miles
            </Typography>
              <CardContent>
                <MapView routeGeometry={tripData.routeGeometry} />
              </CardContent>
            </Card>

            </Box>
 
            <DailyLogs 
              logs={tripData.dailyLogs} 
              currentLocation={tripData.currentLocation}
              pickupLocation={tripData.pickupLocation}
              dropoffLocation={tripData.dropoffLocation}
              currentCycleUsed={tripData.currentCycleUsed}
            />

      </>
        )}

        {/* Error display */}
        {tripData && tripData.error && !loading && (
          <Typography variant="body1" color="error">
            Error: {tripData.error}
          </Typography>
        )}
      </Container>
    </>
  )
}

export default App
