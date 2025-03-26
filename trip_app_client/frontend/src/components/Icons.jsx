import L from 'leaflet';

import green from '../assets/green.svg'
import red from '../assets/red.svg'
import fuel from '../assets/fuel.svg'
import blue from '../assets/blue.svg'

// Create custom icons

const iconCurrent = L.icon({
  iconUrl: blue,   // path to your blue marker
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
})
  
  const iconPickup = L.icon({
    iconUrl: green,   // path to your blue marker
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
  
  const iconFuel = L.icon({
    iconUrl: fuel,     // path to your petrol/gas icon
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
  
  const iconDropoff = L.icon({
    iconUrl: red, // path to your destination marker
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
  
  export { iconCurrent, iconFuel, iconPickup, iconDropoff };