import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080',
});

export const fetchDashboard = (date) =>
  api.get('/stats/dashboard', { params: { referenceDate: date } })
     .then(r => r.data);

// Updated to handle from/to date parameters
export const fetchTrend = (fromIso, toIso) =>
  api.get('/stats/trends', { 
    params: { 
      from: fromIso,
      to: toIso 
    } 
  })
  .then(r => r.data)
  .catch(err => {
    console.error("Error fetching trends:", err);
    throw err;
  });

export const fetchCommunes = (sinceIso) =>
  api.get('/stats/communes', { params: { since: sinceIso } })
     .then(r => r.data.communes || []);   

export const fetchTopCommunes = (dateIso) =>
  api.get('/stats/TopCommunes', { params: { referenceDate: dateIso } })
     .then(r => r.data);  
                            
export const fetchResolution = (fromIso, toIso) =>
  api.get('/stats/resolution', { params: { from: fromIso, to: toIso } })
     .then(r => r.data);

export const fetchHourly = (fromIso, toIso) =>
  api.get('/stats/horaire', { params: { from: fromIso, to: toIso } })
     .then(r => r.data);