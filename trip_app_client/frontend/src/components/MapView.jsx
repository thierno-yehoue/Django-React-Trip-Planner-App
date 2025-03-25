import React from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapView({ routeGeometry }) {
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

  return (
    <MapContainer center={center} zoom={5} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {latlngs1.length > 1 && (
        <Polyline positions={latlngs1} pathOptions={{ color: 'blue' }} />
      )}
      {latlngs2.length > 1 && (
        <Polyline positions={latlngs2} pathOptions={{ color: 'red' }} />
      )}
    </MapContainer>
  );
}

export default MapView;
