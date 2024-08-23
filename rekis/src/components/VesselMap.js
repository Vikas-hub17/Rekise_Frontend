import React, { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icon paths
const vesselIcon = L.icon({
  iconUrl: '/images/vessel.png',
  iconSize: [32, 80],
  className: 'vessel-icon'
});

const startIcon = L.icon({
  iconUrl: '/images/red-marker.png',
  iconSize: [32, 32],
  className: 'start-icon'
});

const endIcon = L.icon({
  iconUrl: '/images/green-marker.png',
  iconSize: [32, 32],
  className: 'end-icon'
});

const VesselMap = () => {
  const startCoords = [22.1696, 91.4996];
  const endCoords = [22.2637, 91.7159];
  const speed = 20; // Speed in km/h
  const refreshRate = 2; // Refresh rate in FPS

  useEffect(() => {
    const distance = L.latLng(startCoords).distanceTo(L.latLng(endCoords)) / 1000; // in km
    const time = (distance / speed) * 3600; // in seconds

    const vesselMarker = L.marker(startCoords, { icon: vesselIcon }).addTo(L.map('map'));

    let currentTime = 0;
    const intervalTime = 1000 / refreshRate; // Interval time based on 2 FPS

    const interval = setInterval(() => {
      currentTime += intervalTime / 1000;
      const progress = currentTime / time;
      if (progress >= 1) {
        clearInterval(interval);
      } else {
        const currentLat = startCoords[0] + progress * (endCoords[0] - startCoords[0]);
        const currentLng = startCoords[1] + progress * (endCoords[1] - startCoords[1]);
        vesselMarker.setLatLng([currentLat, currentLng]);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [startCoords, endCoords, speed, refreshRate]);

  return (
    <MapContainer center={startCoords} zoom={10} id="map" style={{ height: '600px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap contributors' />
      <Marker position={startCoords} icon={startIcon} />
      <Marker position={endCoords} icon={endIcon} />
      <Polyline positions={[startCoords, endCoords]} color="blue" />
    </MapContainer>
  );
};

export default VesselMap;
