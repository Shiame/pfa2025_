import { useState, useEffect } from 'react';
import { FaGlobe, FaUserShield } from 'react-icons/fa';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import Logo from './Logo';

function Navbar({ language, onLanguageChange }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md py-2' 
          : 'bg-white shadow-md py-2'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo et Nom */}
          <div className="flex items-center">
            <Logo size="md" />
            <div className="ml-3">
              <div className="flex items-baseline space-x-1">
                <span className={`font-bold text-lg md:text-xl ${
                  isScrolled ? 'text-red-600' : 'text-red-600'
                }`}>
                  Un Maroc
                </span>
                <span className={`font-bold text-lg md:text-xl ${
                  isScrolled ? 'text-green-700' : 'text-green-700'
                }`}>
                  Meilleur
                </span>
              </div>
              <div className="text-xs text-amber-600 font-medium hidden md:block">
                Votre voix pour un avenir meilleur
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#map" 
              className={`font-medium transition-colors ${
                isScrolled ? 'text-green-700 hover:text-red-600' : 'text-green-800 hover:text-red-500'
              }`}
            >
              Carte des plaintes
            </a>
            <a 
              href="#statistics" 
              className={`font-medium transition-colors ${
                isScrolled ? 'text-green-700 hover:text-red-600' : 'text-green-800 hover:text-red-500'
              }`}
            >
              Statut global des actions
            </a>
            <a 
              href="#apppromo" 
              className={`font-medium transition-colors ${
                isScrolled ? 'text-green-700 hover:text-red-600' : 'text-green-800 hover:text-red-500'
              }`}
            >
              Télécharger l'application mobile
            </a>
            <a 
              href="#footer" 
              className={`font-medium transition-colors ${
                isScrolled ? 'text-green-700 hover:text-red-600' : 'text-green-800 hover:text-red-500'
              }`}
            >
              A propos
            </a>
          </div>

          {/* Right Section: Language and Admin */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-green-700 hover:text-red-600 transition-colors">
                <FaGlobe className="text-lg" />
                <span className="uppercase text-sm font-medium">{language === 'fr' ? 'FR' : 'AR'}</span>
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  <button 
                    className={`block w-full text-left px-4 py-2 text-sm ${language === 'fr' ? 'bg-red-50 text-red-700' : 'text-green-700 hover:bg-green-100'}`}
                    onClick={() => onLanguageChange('fr')}
                  >
                    Français
                  </button>
                  <button 
                    className={`block w-full text-left px-4 py-2 text-sm ${language === 'ar' ? 'bg-red-50 text-red-700' : 'text-green-700 hover:bg-green-100'}`}
                    onClick={() => onLanguageChange('ar')}
                  >
                    العربية
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Login */}
            <a 
              href="/signin" 
              className={`flex items-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors ${
                isScrolled 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              <FaUserShield />
              <span>Admin</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className={`text-2xl ${isScrolled ? 'text-red-800' : 'text-red-800'}`}
            >
              {mobileMenuOpen ? <RiCloseLine /> : <RiMenu3Line />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-4 py-5 space-y-5">
            <div className="space-y-3">
              <a 
                href="#map" 
                className="block font-medium text-green-800 hover:text-red-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Carte
              </a>
              <a 
                href="#statistics" 
                className="block font-medium text-green-800 hover:text-red-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Statistiques
              </a>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
              {/* Language Selector */}
              <div className="flex space-x-3">
                <button 
                  className={`px-3 py-1 rounded ${language === 'fr' ? 'bg-red-100 text-red-700' : 'text-green-600'}`}
                  onClick={() => {
                    onLanguageChange('fr');
                    setMobileMenuOpen(false);
                  }}
                >
                  FR
                </button>
                <button 
                  className={`px-3 py-1 rounded ${language === 'ar' ? 'bg-red-100 text-red-700' : 'text-green-600'}`}
                  onClick={() => {
                    onLanguageChange('ar');
                    setMobileMenuOpen(false);
                  }}
                >
                  الع
                </button>
              </div>

              {/* Admin Login */}
              <a 
                href="/signin" 
                className="flex items-center space-x-2 py-2 px-4 rounded-md font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaUserShield />
                <span>Admin</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;