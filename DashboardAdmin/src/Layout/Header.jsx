import { useState, useEffect } from 'react';
import { Bell, User, LogOut, Search, Menu, X } from 'lucide-react';

export default function Header({ toggleSidebar, isSidebarOpen }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

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
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm z-10 sticky top-0">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none lg:hidden"
            aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="ml-2 flex items-center">
            <h1 className="text-xl font-semibold text-gray-800 ml-2">
              Observatoire des Plaintes
            </h1>
            {!isMobile && <span className="ml-2 text-sm text-gray-500">|</span>}
            {!isMobile && <span className="ml-2 text-sm text-gray-500">Admin</span>}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search Bar - Hidden on small screens */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex relative rounded-md"
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="py-1.5 pl-10 pr-4 w-48 lg:w-64 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm"
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
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none relative"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 text-xs flex items-center justify-center rounded-full bg-red-500 text-white">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div 
                onClick={e => e.stopPropagation()}
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-20 border border-gray-200"
              >
                <div className="py-2 px-3 bg-gray-50 flex justify-between items-center border-b">
                  <span className="font-medium text-gray-700">Notifications</span>
                  <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    Tout marquer comme lu
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className="py-2 px-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                    >
                      <p className="text-sm text-gray-800">{notification.text}</p>
                      <p className="text-xs text-gray-500 mt-1">Il y a {notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="py-2 text-center bg-gray-50 border-t border-gray-100">
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
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
                <User size={16} />
              </div>
              {!isMobile && (
                <span className="text-sm font-medium text-gray-700 mr-1">Admin</span>
              )}
            </button>

            {showUserMenu && (
              <div 
                onClick={e => e.stopPropagation()}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20 border border-gray-200 py-1"
              >
                <a
                  href="#profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <User size={16} className="mr-2 text-gray-500" />
                  <span>Profil</span>
                </a>
                <a
                  href="#settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Paramètres</span>
                </a>
                <div className="border-t border-gray-100 my-1"></div>
                <a
                  href="/login"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <LogOut size={16} className="mr-2 text-gray-500" />
                  <span>Déconnexion</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}