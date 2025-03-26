/* eslint-disable no-unused-vars */
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { iconDestination, iconFuel, iconPickup } from './Icons';

function MapView({
  routeGeometry,
   latLonCurrent,
  latLonPickup,
  latLonDropoff,
  fuelingStops,
  mapTripData

}) {
  if (!routeGeometry || routeGeometry.length === 0) {
    return <p>No route data.</p>;
  }

    // routeGeometry  
  // Each geometry has a "coordinates" array with [lon, lat].

    // Convert each [lon, lat] -> [lat, lon] for Leaflet
  let coords1 = routeGeometry[0]?.coordinates || [];
  // Convert each [lon, lat] -> [lat, lon] for Leaflet
  let latlngs1 = coords1.map(([lon, lat]) => [lat, lon]);

  // Optionally combine with the second geometry
  let coords2 = routeGeometry[1]?.coordinates || [];
  let latlngs2 = coords2.map(([lon, lat]) => [lat, lon]);

  // Center map on the first coordinate if available
  let center = [0, 0];
  if (latlngs1.length > 0) {
    center = latlngs1[0];
  }

  let tripData = mapTripData?mapTripData : {};

  return (
    <MapContainer center={center} zoom={5} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      {/* Polylines for routes */}
      {latlngs1.length > 1 && (
        <Polyline positions={latlngs1} pathOptions={{ color: 'blue' }} />
      )}
      {latlngs2.length > 1 && (
        <Polyline positions={latlngs2} pathOptions={{ color: 'red' }} />
      )}

      {/* Markers for current/pickup/dropoff */}
      {latLonCurrent && (
        <Marker position={[latLonCurrent[0], latLonCurrent[1]]}>
          <Popup>Current Location: {mapTripData.currentLocation}</Popup>
        </Marker>
      )}

      {latLonPickup && (
        <Marker position={[latLonPickup[0], latLonPickup[1]]}
        icon={ iconPickup }
        >
          <Popup>Pickup Location: {mapTripData.pickupLocation}</Popup>
        </Marker>
      )}

      {latLonDropoff && (
        <Marker position={[latLonDropoff[0], latLonDropoff[1]]}
        icon={ iconDestination }
        >
          <Popup>Dropoff Location: {mapTripData.dropoffLocation}</Popup>
        </Marker>
      )}

      {/* Fueling stops markers */}
       {fuelingStops && fuelingStops.map((fs, i) => (
        <Marker key={i} position={[fs[1], fs[0]]} 
        icon={ iconFuel }
        >       
          <Popup>Fueling Stop #{i+1}</Popup>
        </Marker>

      ))}

    </MapContainer>
  );
}

export default MapView;
