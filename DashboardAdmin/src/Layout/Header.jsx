import { useState, useEffect } from 'react';
import { Bell, User, LogOut, Search, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ toggleSidebar, isSidebarOpen }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();

  // Detect mobile screens
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Simulate fetching notifications
  useEffect(() => {
    setNotifications([
      { id: 1, text: 'Nouvelle plainte urgente dans Agdal', time: '5 min' },
      { id: 2, text: 'Taux de résolution en baisse à Hassan', time: '1h' },
      { id: 3, text: '10 nouvelles plaintes aujourd\'hui', time: '3h' }
    ]);
  }, []);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowNotifications(false);
      setShowUserMenu(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    navigate('/signin');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm z-10 sticky top-0">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 
              focus:outline-none lg:hidden transition-colors"
            aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="ml-2 flex items-center">
            <h1 className="text-xl font-semibold text-gray-800 ml-2">
              Observatoire des Plaintes
            </h1>
            {!isMobile && <span className="ml-3 text-sm text-gray-500">Admin</span>}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex relative"
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="py-2 pl-10 pr-4 w-48 lg:w-64 rounded-lg border border-gray-300 
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-sm
                bg-gray-50/50 transition-all"
            />
          </form>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 
                focus:outline-none relative transition-colors"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center 
                  justify-center rounded-full bg-blue-600 text-white font-medium">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div 
                onClick={e => e.stopPropagation()}
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg 
                  overflow-hidden z-20 border border-gray-200"
              >
                <div className="py-3 px-4 bg-gray-50 flex justify-between items-center border-b">
                  <span className="font-medium text-gray-700">Notifications</span>
                  <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    Tout marquer comme lu
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className="py-3 px-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                    >
                      <p className="text-sm text-gray-800 mb-1">{notification.text}</p>
                      <p className="text-xs text-gray-500">Il y a {notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="py-2 text-center bg-gray-50 border-t">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 
                focus:outline-none transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 
                flex items-center justify-center text-white">
                <User size={16} />
              </div>
              {!isMobile && (
                <span className="text-sm font-medium text-gray-700">Admin</span>
              )}
            </button>

            {showUserMenu && (
              <div 
                onClick={e => e.stopPropagation()}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20 
                  border border-gray-200 py-1"
              >
                <a
                  href="settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 
                    flex items-center transition-colors"
                >
                  <User size={16} className="mr-2 text-gray-500" />
                  <span>Profil</span>
                </a>
                {/* Paramètres supprimé */}
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 
                    flex items-center transition-colors"
                >
                  <LogOut size={16} className="mr-2 text-gray-500" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
