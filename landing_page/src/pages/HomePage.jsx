import { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import StatisticsPanel from '../components/StatisticsPanel';
import AppPromo from '../components/AppPromo';
import Footer from '../components/Footer';
import CommuneMap   from '../components/CommuneMap';

function HomePage() {
  const [language, setLanguage] = useState('fr');
  
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar language={language} onLanguageChange={handleLanguageChange} />
      <Hero />
      <CommuneMap />
      <StatisticsPanel />
      <AppPromo />
      <Footer />
    </div>
  );
}

export default HomePage;