// src/components/TripForm.jsx (snippet)
import React, { useState } from 'react'
import { TextField, Button, Stack } from '@mui/material'
import axios from 'axios'

function TripForm({ onResults, onLoading, loading }) {
  const [currentLocation, setCurrentLocation] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropoffLocation, setDropoffLocation] = useState('')
  const [currentCycleUsed, setCurrentCycleUsed] = useState(0)

  // New state to track if the user has attempted to submit
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const baseUrl = import.meta.env.VITE_API_URL

  const handleSubmit = async (e) => {
    e.preventDefault()
    setHasSubmitted(true) // user tried to submit
    // If any required fields are empty, we might bail out
    if (!currentLocation || !pickupLocation || !dropoffLocation) {
      return
    }

    // show spinner
    if (onLoading) onLoading(true)

    // proceed with API call
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
    setHasSubmitted(false) // reset error display
    onResults(null)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Current Location *"
          variant="outlined"
          value={currentLocation}
          onChange={(e) => setCurrentLocation(e.target.value)}
          error={hasSubmitted && !currentLocation}
          helperText={
            hasSubmitted && !currentLocation ? "Please enter current location" : ""
          }
          placeholder='eg. Paris'
        />
        <TextField
          label="Pickup Location *"
          variant="outlined"
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}        
          error={hasSubmitted && !pickupLocation}
          helperText={
            hasSubmitted && !pickupLocation ? "Please enter pickup location" : ""
          }
          placeholder='eg. London'
        />
        <TextField
          label="Dropoff Location *"
          variant="outlined"
          value={dropoffLocation}
          onChange={(e) => setDropoffLocation(e.target.value)}
          error={hasSubmitted && !dropoffLocation}
          helperText={
            hasSubmitted && !dropoffLocation ? "Please enter dropoff location" : ""
          }
          placeholder='eg. Milan'
        />
        <TextField
          label="Current Cycle Used (hrs)"
          type="number"
          slotProps={{ step: '0.1' }}
          variant="outlined"
          value={currentCycleUsed}
          onChange={(e) => setCurrentCycleUsed(e.target.value)}
        />

        <Stack direction="row" spacing={2}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading ? true : false}
          >
            Plan Trip
          </Button>
          <Button
            type="button"
            variant="outlined"
            color="secondary"
            onClick={handleReset}
          >
            Reset
          </Button>
        </Stack>
      </Stack>
    </form>
  )
}

export default TripForm
