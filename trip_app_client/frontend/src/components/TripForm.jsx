// src/components/TripForm.jsx

import React, { useState } from 'react'
import axios from 'axios'
import { TextField, Button, Box, Stack } from '@mui/material'

function TripForm({ onResults, onLoading }) {
  const [currentLocation, setCurrentLocation] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropoffLocation, setDropoffLocation] = useState('')
  const [currentCycleUsed, setCurrentCycleUsed] = useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      onLoading(true)  // show spinner
      const response = await axios.post('http://127.0.0.1:8000/api/trip/', {
        currentLocation,
        pickupLocation,
        dropoffLocation,
        currentCycleUsed
      })
      onResults(response.data)
    } catch (error) {
      console.error('Error:', error)
      onResults({ error: 'Something went wrong' })
    } finally {
      onLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      <Stack spacing={2}>
        <TextField
          label="Current Location"
          variant="outlined"
          value={currentLocation}
          onChange={(e) => setCurrentLocation(e.target.value)}
          required
        />
        <TextField
          label="Pickup Location"
          variant="outlined"
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          required
        />
        <TextField
          label="Dropoff Location"
          variant="outlined"
          value={dropoffLocation}
          onChange={(e) => setDropoffLocation(e.target.value)}
          required
        />
        <TextField
          label="Current Cycle Used (hrs)"
          type="number"
          inputProps={{ step: '0.1' }}
          variant="outlined"
          value={currentCycleUsed}
          onChange={(e) => setCurrentCycleUsed(e.target.value)}
        />
        <Button variant="contained" color="primary" type="submit">
          Plan Trip
        </Button>
      </Stack>
    </Box>
  )
}

export default TripForm
