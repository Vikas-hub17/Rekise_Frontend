import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './VesselMap.css';

// Custom icons
const vesselIcon = L.icon({
  iconUrl: '/images/vessel.png',
  iconSize: [32, 80],
});

const startIcon = L.icon({
  iconUrl: '/images/red-marker.png',
  iconSize: [32, 32],
});

const endIcon = L.icon({
  iconUrl: '/images/green-marker.png',
  iconSize: [32, 32],
});

const VesselMap = () => {
  const startCoords = useMemo(() => [22.1696, 91.4996], []);
  const endCoords = useMemo(() => [22.2637, 91.7159], []);
  const speed = 20; // Speed in km/h
  const refreshRate = 2; // Refresh rate in FPS

  const [currentCoords, setCurrentCoords] = useState(startCoords);

  useEffect(() => {
    // Calculate total distance and time required to travel
    const distance = L.latLng(startCoords).distanceTo(L.latLng(endCoords)) / 1000; // in km
    const totalTime = (distance / speed) * 3600; // total time in seconds

    let elapsedTime = 0;
    const intervalTime = 1000 / refreshRate; // interval time based on refresh rate (2 FPS)

    const interval = setInterval(() => {
      elapsedTime += intervalTime / 1000; // increment time in seconds
      const progress = elapsedTime / totalTime; // calculate progress as a fraction

      if (progress >= 1) {
        clearInterval(interval);
        setCurrentCoords(endCoords);
      } else {
        const currentLat = startCoords[0] + progress * (endCoords[0] - startCoords[0]);
        const currentLng = startCoords[1] + progress * (endCoords[1] - startCoords[1]);
        setCurrentCoords([currentLat, currentLng]);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [startCoords, endCoords, speed, refreshRate]);

  return (
    <div className="map-container">
      <div className="info-box">
        <div>
          <h4>Starting</h4>
          <p>Lat: {startCoords[0]}</p>
          <p>Long: {startCoords[1]}</p>
        </div>
        <div>
          <h4>Speed:</h4>
          <p>{speed} kmph</p>
        </div>
        <div>
          <h4>Ending</h4>
          <p>Lat: {endCoords[0]}</p>
          <p>Long: {endCoords[1]}</p>
        </div>
      </div>
      <MapContainer center={startCoords} zoom={10} style={{ height: '600px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap contributors' />
        <Marker position={startCoords} icon={startIcon} />
        <Marker position={endCoords} icon={endIcon} />
        <Polyline positions={[startCoords, endCoords]} color="blue" />
        <Marker position={currentCoords} icon={vesselIcon} />
      </MapContainer>
    </div>
  );
};

export default VesselMap;
