// src/components/TripForm.jsx (snippet)
import React, { useState } from 'react'
import { TextField, Button, Stack } from '@mui/material'
import axios from 'axios'

function TripForm({ onResults, onLoading }) {
  const [currentLocation, setCurrentLocation] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropoffLocation, setDropoffLocation] = useState('')
  const [currentCycleUsed, setCurrentCycleUsed] = useState(0)

  const baseUrl = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (onLoading) onLoading(true)
    try {
      const response = await axios.post(`${baseUrl}/api/trip/`, {
        currentLocation,
        pickupLocation,
        dropoffLocation,
        currentCycleUsed
      })
      onResults(response.data)
    } catch (err) {
      console.error(err)
      onResults({ error: 'Something went wrong' })
    } finally {
      if (onLoading) onLoading(false)
    }
  }

  const handleReset = () => {
    setCurrentLocation('')
    setPickupLocation('')
    setDropoffLocation('')
    setCurrentCycleUsed(0)
    onResults(null) // if you want to clear the results as well
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Current Location"
          variant="outlined"
          value={currentLocation}
          onChange={(e) => setCurrentLocation(e.target.value)}
          required
          placeholder='eg. Paris'
        />
        <TextField
          label="Pickup Location"
          variant="outlined"
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          required
          placeholder='eg. London'
        />
        <TextField
          label="Dropoff Location"
          variant="outlined"
          value={dropoffLocation}
          onChange={(e) => setDropoffLocation(e.target.value)}
          required
          placeholder='eg. Milan'
        />
        <TextField
          label="Current Cycle Used (hrs)"
          type="number"
          inputProps={{ step: '0.1' }}
          variant="outlined"
          value={currentCycleUsed}
          onChange={(e) => setCurrentCycleUsed(e.target.value)}
        />
        <Stack direction="row" spacing={2}>
          <Button type="submit" variant="contained" color="primary">
            Plan Trip
          </Button>
          <Button type="button" variant="outlined" color="secondary" onClick={handleReset}>
            Reset
          </Button>
        </Stack>
      </Stack>
    </form>
  )
}

export default TripForm
