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
  MapPin,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar({ open, setOpen }) {
  const [hover, setHover] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && open) {
        // Keep mobile sidebar open if it was open
      } else if (mobile) {
        setOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [setOpen]);

  const collapsed = !open && !hover && !isMobile;
  const isExpanded = open || hover;

  const Item = ({ to, icon: Icon, label, subtitle }) => {
    const isActive = location.pathname === to || 
                     (to !== '/' && location.pathname.startsWith(to));

    return (
      <NavLink
        to={to}
        onClick={() => isMobile && setOpen(false)}
        className={`
          group flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-medium 
          transition-all duration-300 ease-out relative overflow-hidden
          ${isActive ? 
            'bg-gradient-to-r from-blue-50 to-blue-50/70 text-blue-700 shadow-sm ring-1 ring-blue-100' : 
            'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
          ${collapsed ? 'justify-center px-3' : 'justify-start'}
        `}
      >
        <div className={`flex-shrink-0 transition-all duration-300 ${
          isActive ? 'text-blue-600 scale-110' : 'text-gray-500 group-hover:text-gray-700'
        }`}>
          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        
        <div className={`
          flex flex-col min-w-0 transition-all duration-300 ease-out
          ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
        `}>
          <span className="font-semibold text-sm leading-tight truncate">
            {label}
          </span>
          {subtitle && !collapsed && (
            <span className="text-xs text-gray-400 leading-tight truncate mt-0.5">
              {subtitle}
            </span>
          )}
        </div>

        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className="absolute left-full ml-4 z-50 pointer-events-none opacity-0 group-hover:opacity-100
            transition-opacity duration-200 delay-300">
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs font-medium
              relative before:absolute before:-left-1 before:top-1/2 before:-translate-y-1/2
              before:w-2 before:h-2 before:bg-gray-900 before:rotate-45">
              <div className="font-semibold">{label}</div>
              {subtitle && (
                <div className="text-gray-300 text-xs mt-1">{subtitle}</div>
              )}
            </div>
          </div>
        )}

        {/* Active indicator */}
        {isActive && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-full shadow-sm" />
        )}
      </NavLink>
    );
  };

  const mainItems = [
    { to: "/", icon: Home, label: "Accueil", subtitle: "Vue d'ensemble" },
    { to: "/geographie", icon: Map, label: "Géographie", subtitle: "Carte interactive" },
    { to: "/stats", icon: BarChart, label: "Analytics", subtitle: "Données & Rapports" }
  ];
  
  const managementItems = [
    { to: "/complaints", icon: FileText, label: "Réclamations", subtitle: "Nouvelles & En cours" },
    { to: "/resolutions", icon: Clock, label: "Traitements", subtitle: "Suivi & Historique" }
  ];
  
  const bottomItems = [
    { to: "/settings", icon: Settings, label: "Configuration", subtitle: "Préférences" }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* Mobile toggle button */}
      {isMobile && (
        <button
          onClick={() => setOpen(!open)}
          className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-lg rounded-xl p-3 
            border border-gray-200 hover:bg-gray-50 transition-all duration-200"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}
      
      <aside
        onMouseEnter={() => !isMobile && setHover(true)}
        onMouseLeave={() => !isMobile && setHover(false)}
        className={`
          fixed md:relative h-full bg-white z-30 border-r border-gray-200/80
          transition-all duration-300 ease-out shadow-sm
          ${isMobile ? 
            `w-72 ${open ? 'translate-x-0' : '-translate-x-full'} shadow-2xl` : 
            `${isExpanded ? 'w-72' : 'w-20'}`
          }
        `}
      >
        {/* Header */}
        <div className={`
          flex items-center h-16 border-b border-gray-200/80 px-4
          ${collapsed ? 'justify-center' : 'justify-between'}
        `}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 
                rounded-xl flex items-center justify-center shadow-lg ring-1 ring-blue-500/20">
                <MapPin className="text-white" size={18} />
              </div>
            </div>
            <div className={`
              transition-all duration-300 overflow-hidden
              ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
            `}>
              <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">
                Observatoire
              </h1>
              <p className="text-xs text-gray-500 whitespace-nowrap">
                Gestion des Plaintes
              </p>
            </div>
          </div>

          {/* Desktop toggle button */}
          {!isMobile && isExpanded && (
            <button
              onClick={() => setOpen(false)}
              className="flex items-center justify-center w-8 h-8 rounded-lg 
                hover:bg-gray-100 transition-all duration-200 flex-shrink-0"
              aria-label="Réduire la barre latérale"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
          )}
        </div>

        {/* Navigation Content */}
        <div className="flex flex-col h-[calc(100%-4rem)] overflow-hidden">
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
            
            {/* Main Navigation */}
            <div className="space-y-2">
              <div className={`
                px-2 mb-4 transition-all duration-300
                ${collapsed ? 'text-center' : 'text-left'}
              `}>
                <h2 className={`
                  text-xs font-semibold text-gray-400 uppercase tracking-wider
                  transition-all duration-300
                  ${collapsed ? 'opacity-0' : 'opacity-100'}
                `}>
                  {collapsed ? '' : 'Navigation'}
                </h2>
                {collapsed && (
                  <div className="w-6 h-0.5 bg-gray-300 rounded-full mx-auto"></div>
                )}
              </div>
              {mainItems.map((item, index) => (
                <Item key={`main-${index}`} {...item} />
              ))}
            </div>
            
            {/* Management Section */}
            <div className="space-y-2">
              <div className={`
                px-2 mb-4 transition-all duration-300
                ${collapsed ? 'text-center' : 'text-left'}
              `}>
                <h2 className={`
                  text-xs font-semibold text-gray-400 uppercase tracking-wider
                  transition-all duration-300
                  ${collapsed ? 'opacity-0' : 'opacity-100'}
                `}>
                  {collapsed ? '' : 'Gestion des Cas'}
                </h2>
                {collapsed && (
                  <div className="w-6 h-0.5 bg-gray-300 rounded-full mx-auto"></div>
                )}
              </div>
              {managementItems.map((item, index) => (
                <Item key={`mgmt-${index}`} {...item} />
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-200/80 p-4">
            {bottomItems.map((item, index) => (
              <Item key={`bottom-${index}`} {...item} />
            ))}
            
            {/* User info placeholder - you can customize this */}
            <div className={`
              mt-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 
              border border-blue-100/50 transition-all duration-300
              ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}
            `}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 
                  rounded-lg flex items-center justify-center">
                  <Users size={14} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
                  <p className="text-xs text-gray-500 truncate">En ligne</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expand button for collapsed desktop state */}
        {!isMobile && collapsed && (
          <button
            onClick={() => setOpen(true)}
            className="absolute -right-3 top-20 w-6 h-12 bg-white border border-gray-200 
              rounded-r-lg shadow-md flex items-center justify-center
              hover:bg-gray-50 transition-all duration-200 z-10"
            aria-label="Étendre la barre latérale"
          >
            <ChevronRight size={14} className="text-gray-600" />
          </button>
        )}
      </aside>
    </>
  );
}