import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './VesselMap.css';

// Custom icons
const startIcon = L.icon({
  iconUrl: '/images/red-marker.png',
  iconSize: [40,40],
});

const endIcon = L.icon({
  iconUrl: '/images/green-marker.png',
  iconSize: [40,40],
});

// Calculate the angle between two coordinates in degrees
const calculateAngle = (startCoords, endCoords) => {
  const [lat1, lng1] = startCoords.map(coord => coord * Math.PI / 180); // Convert to radians
  const [lat2, lng2] = endCoords.map(coord => coord * Math.PI / 180);

  const dLng = lng2 - lng1;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  const angle = Math.atan2(y, x) * (180 / Math.PI);
  return (angle + 360) % 360; // Normalize the angle to be within 0-360 degrees
};

const VesselMap = () => {
  const startCoords = useMemo(() => [22.1696, 91.4996], []);
  const endCoords = useMemo(() => [22.2637, 91.7159], []);
  const speed = 20; // Speed in km/h
  const refreshRate = 20; // Refresh rate in FPS

  const [currentCoords, setCurrentCoords] = useState(startCoords);
  const [vesselAngle, setVesselAngle] = useState(0);

  useEffect(() => {
    // Calculate total distance and time required to travel
    const distance = L.latLng(startCoords).distanceTo(L.latLng(endCoords)) / 1000; // in km
    const totalTime = (distance / speed) * 3600; // total time in seconds

    let elapsedTime = 0;
    const intervalTime = 1000 / refreshRate; // interval time in milliseconds

    // Calculate initial angle
    setVesselAngle(calculateAngle(startCoords, endCoords));

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

  // Custom vessel icon with dynamic rotation
  const vesselIcon = L.divIcon({
    html: `<div style="transform: rotate(${vesselAngle}deg);"><img src="/images/vessel.png" style="width: 25px; height: 90px;" /></div>`,
    iconSize: [32, 80],
    className: 'vessel-icon', // Add a className for custom styling
  });

  return (
    <div className="map-container">
      <div className="info-box">
        <div>
          <h4>Starting Coordinates</h4>
          <p>Lat: {startCoords[0]}</p>
          <p>Long: {startCoords[1]}</p>
        </div>
        <div>
          <h4>Speed</h4>
          <p>{speed} km/h</p>
        </div>
        <div>
          <h4>Ending Coordinates</h4>
          <p>Lat: {endCoords[0]}</p>
          <p>Long: {endCoords[1]}</p>
        </div>
      </div>
      <MapContainer center={startCoords} zoom={10} className="map-view">
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
