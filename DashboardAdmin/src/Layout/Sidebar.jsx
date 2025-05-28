import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Map, 
  BarChart, 
  FileText, 
  Clock, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  MapPin 
} from 'lucide-react';

export default function Sidebar({ open, setOpen }) {
  const [hover, setHover] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setOpen(false);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [setOpen]);

  const collapsed = !open && !hover && !isMobile;

  const Item = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to || 
                     (to !== '/' && location.pathname.startsWith(to));

    return (
      <NavLink
        to={to}
        className={({ isActive }) => `
          group flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium 
          transition-all duration-200 relative overflow-hidden
          ${isActive ? 
            'bg-blue-100/90 text-blue-600 shadow-sm' : 
            'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
          ${collapsed ? 'justify-center px-3' : 'pl-4'}
        `}
      >
        <div className={`transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
          <Icon size={22} strokeWidth={isActive ? 2.3 : 2} />
        </div>
        {!collapsed && (
          <span className={`truncate transition-opacity ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
            {label}

        
          </span>
        )}
        {collapsed && (
          <div className="absolute left-full ml-3 z-50 hidden group-hover:flex
            bg-gray-900 text-gray-100 px-3 py-2 rounded-lg shadow-xl
            before:absolute before:-left-1 before:top-1/2 before:-translate-y-1/2
            before:w-2 before:h-2 before:bg-gray-900 before:rotate-45">
            <span className="whitespace-nowrap text-sm font-medium">{label}</span>
          </div>
        )}
        {isActive && (
          <div className="absolute right-0 inset-y-0 w-1 bg-blue-500 rounded-l-full" />
        )}
      </NavLink>
    );
  };

  const mainItems = [
    { to: "/", icon: Home, label: "Tableau de bord" },
    { to: "/geographie", icon: Map, label: "Carte" },
    { to: "/stats", icon: BarChart, label: "Statistiques" }
  ];
  
  const managementItems = [
    { to: "/complaints", icon: FileText, label: "Plaintes" },
    { to: "/resolutions", icon: Clock, label: "Résolutions" },
    { to: "/users", icon: Users, label: "Utilisateurs" }
  ];
  
  const bottomItems = [
    { to: "/settings", icon: Settings, label: "Paramètres" }
  ];

  return (
    <>
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/30 z-20 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
      
      <aside
        onMouseEnter={() => !isMobile && setHover(true)}
        onMouseLeave={() => !isMobile && setHover(false)}
        className={`fixed md:relative h-full bg-white z-30 border-r transition-all duration-300
          ${open ? (isMobile ? 'left-0' : 'w-64') : (isMobile ? '-left-64' : 'w-20')}
          ${isMobile ? 'w-64 shadow-xl' : 'shadow-sm'}`}
      >
        {/* Logo Area */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} 
          h-16 border-b ${!collapsed ? 'px-6' : 'px-0'}`}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg
                flex items-center justify-center shadow-sm">
                <MapPin className="text-white" size={20} />
              </div>
            </div>
            {!collapsed && (
              <div className="text-lg font-semibold text-gray-800 tracking-tight">
                Observatoire
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col h-[calc(100%-4rem)] pt-4 pb-4 overflow-y-auto">
          <button
            onClick={() => setOpen(!open)}
            className={`hidden md:flex items-center justify-center w-8 h-8 mx-auto mb-4
              rounded-lg hover:bg-gray-100 transition-all duration-300
              ${collapsed ? 'rotate-180' : ''}`}
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {open ? (
              <ChevronLeft size={20} className="text-gray-600" />
            ) : (
              <ChevronRight size={20} className="text-gray-600" />
            )}
          </button>
          
          {/* Main Navigation */}
          <div className="px-2.5 space-y-1.5 mb-6">
            <div className={`${!collapsed ? 'mb-3 px-4' : 'mb-2 px-1'}`}>
              <p className={`text-xs font-medium text-gray-400/90 uppercase tracking-wider
                ${collapsed ? 'text-center' : ''}`}>
                {!collapsed ? 'Navigation' : '•••'}
              </p>
            </div>
            {mainItems.map((item, index) => (
              <Item key={index} {...item} />
            ))}
          </div>
          
          {/* Management Section */}
          <div className="px-2.5 space-y-1.5 mb-6">
            <div className={`${!collapsed ? 'mb-3 px-4' : 'mb-2 px-1'}`}>
              <p className={`text-xs font-medium text-gray-400/90 uppercase tracking-wider
                ${collapsed ? 'text-center' : ''}`}>
                {!collapsed ? 'Gestion' : '•••'}
              </p>
            </div>
            {managementItems.map((item, index) => (
              <Item key={index} {...item} />
            ))}
          </div>

          {/* Bottom Section */}
          <div className="mt-auto px-2.5 pt-4 border-t">
            {bottomItems.map((item, index) => (
              <Item key={index} {...item} />
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}