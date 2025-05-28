import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout/Layout';
import Dashboard from './pages/Dashboard';
import ComplaintsPage from './pages/ComplaintsPage';
import ComplaintDetail from './pages/ComplaintsDetail';
import ResolutionsPage from './pages/ResolutionPage';
import SettingsPage from './pages/SettingsPages';
import GeographyPage   from './pages/GeographyPage';
import StatsPage  from './pages/StatsPage';







function App() {
  return (
    
      <Router>
        <Routes>
          
          <Route path="/" element={
            
              <Layout />
           
          }>
            <Route index element={<Dashboard />} />
            <Route path="geographie" element={<GeographyPage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
            <Route path="complaints/:id" element={<ComplaintDetail />} />
            <Route path="resolutions" element={<ResolutionsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="stats"  element={<StatsPage />} />

            
           
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    
  );
}

export default App;