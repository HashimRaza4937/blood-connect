// Distance and Location Utilities for Blood Connect (Ghotki, Sindh)

// Haversine formula to calculate distance between two coordinates in kilometers
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Rounded to 1 decimal place
};

// Estimate driving time in minutes based on distance
export const estimateTravelTime = (distanceKm) => {
  if (distanceKm === null || distanceKm === undefined) return null;
  if (distanceKm <= 0.5) return { car: '2-3 mins', bike: '2 mins', walk: '5 mins' };
  
  // Average city road speeds in Sindh: Car/Ambulance ~40 km/h, Bike ~35 km/h
  const carMinutes = Math.max(3, Math.round((distanceKm / 40) * 60));
  const bikeMinutes = Math.max(2, Math.round((distanceKm / 35) * 60));
  const walkMinutes = Math.round((distanceKm / 4.5) * 60);

  return {
    car: `${carMinutes} mins`,
    bike: `${bikeMinutes} mins`,
    walk: walkMinutes > 60 ? `${Math.round(walkMinutes / 60)} hrs` : `${walkMinutes} mins`
  };
};

// Generates Google Maps direct navigation URL
export const getGoogleMapsDirUrl = (lat, lng, originLat, originLng) => {
  if (originLat && originLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${lat},${lng}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
};

// Generates Google Maps view/search URL
export const getGoogleMapsSearchUrl = (lat, lng, name) => {
  if (name) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}+${lat},${lng}`;
  }
  return `https://maps.google.com/?q=${lat},${lng}`;
};

// Generates Google Maps Embed iframe URL (zero-config, no API key needed!)
export const getGoogleMapsEmbedUrl = (lat, lng, zoom = 15) => {
  return `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=${zoom}&output=embed`;
};

// Pre-defined landmark locations in Ghotki District for simulation/quick selection
export const GHOTKI_LANDMARKS = [
  { name: 'Civil Hospital Ghotki (Station Road)', lat: 28.0060, lng: 69.3160 },
  { name: 'Ghotki Railway Station', lat: 28.0048, lng: 69.3182 },
  { name: 'THQ Hospital Mirpur Mathelo', lat: 28.0215, lng: 69.5475 },
  { name: 'Daharki National Highway Chowk', lat: 28.0420, lng: 69.7260 },
  { name: 'Khanpur Mahar Main Bazar', lat: 27.8410, lng: 69.4105 },
  { name: 'Sukkur IBA / Civil Hospital Sukkur', lat: 27.7120, lng: 68.8470 }
];
