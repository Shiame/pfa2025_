import { useState } from 'react';
import { Save, Mail, Bell, Shield, Lock, Globe, Database, Server } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Observatoire des Plaintes',
    siteDescription: 'Plateforme de gestion des plaintes citoyennes',
    contactEmail: 'contact@observatoire.ma',
    language: 'fr',
    timezone: 'Africa/Casablanca',
    enablePublicStats: true
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    dailyDigest: false,
    notifyNewComplaints: true,
    notifyStatusChange: true,
    notifyAssignment: true,
    notifyComments: false
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    requireTwoFactor: false,
    sessionTimeout: 30,
    loginAttempts: 5,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumbers: true,
    passwordExpiryDays: 90
  });
  
  const [systemSettings, setSystemSettings] = useState({
    apiUrl: 'http://localhost:8081',
    maxFileSize: 5,
    enableMaintenance: false,
    maintenanceMessage: 'Le site est actuellement en maintenance. Veuillez réessayer plus tard.',
    dbBackupFrequency: 'daily',
    logLevel: 'warning',
    enableDebugMode: false
  });
  
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  
  const handleSave = () => {
    setSaving(true);
    setSavedMessage('');
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSavedMessage('Paramètres enregistrés avec succès');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSavedMessage('');
      }, 3000);
    }, 800);
  };
  
  const tabs = [
    { id: 'general', label: 'Général', icon: <Globe size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Sécurité', icon: <Shield size={18} /> },
    { id: 'system', label: 'Système', icon: <Server size={18} /> }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Paramètres</h1>
        
        <div className="flex items-center gap-4">
          {savedMessage && (
            <span className="text-sm text-green-600">{savedMessage}</span>
          )}
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={16} />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow-sm p-1">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Content */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 pb-2 border-b">Paramètres Généraux</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">Nom du site</label>
                  <input
                    type="text"
                    id="siteName"
                    className="w-full px-3 py-2 border rounded-md"
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                  />
                </div>
                
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
                  <input
                    type="email"
                    id="contactEmail"
                    className="w-full px-3 py-2 border rounded-md"
                    value={generalSettings.contactEmail}
                    onChange={(e) => setGeneralSettings({...generalSettings, contactEmail: e.target.value})}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">Description du site</label>
                  <textarea
                    id="siteDescription"
                    rows="3"
                    className="w-full px-3 py-2 border rounded-md"
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                  <select
                    id="language"
                    className="w-full px-3 py-2 border rounded-md"
                    value={generalSettings.language}
                    onChange={(e) => setGeneralSettings({...generalSettings, language: e.target.value})}
                  >
                    <option value="fr">Français</option>
                    <option value="ar">Arabe</option>
                    <option value="en">Anglais</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">Fuseau horaire</label>
                  <select
                    id="timezone"
                    className="w-full px-3 py-2 border rounded-md"
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                  >
                    <option value="Africa/Casablanca">Casablanca (GMT+1)</option>
                    <option value="Europe/Paris">Paris (GMT+2)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enablePublicStats"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={generalSettings.enablePublicStats}
                      onChange={(e) => setGeneralSettings({...generalSettings, enablePublicStats: e.target.checked})}
                    />
                    <label htmlFor="enablePublicStats" className="ml-2 block text-sm text-gray-700">
                      Activer les statistiques publiques
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Les statistiques générales seront visibles publiquement sur le site web
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 pb-2 border-b">Paramètres de Notification</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                      />
                      <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                        Activer les notifications par email
                      </label>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="pushNotifications"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={notificationSettings.pushNotifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, pushNotifications: e.target.checked})}
                      />
                      <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-700">
                        Activer les notifications push
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="dailyDigest"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={notificationSettings.dailyDigest}
                        onChange={(e) => setNotificationSettings({...notificationSettings, dailyDigest: e.target.checked})}
                      />
                      <label htmlFor="dailyDigest" className="ml-2 block text-sm text-gray-700">
                        Envoyer un résumé quotidien
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Événements à notifier</h3>
                    
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="notifyNewComplaints"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={notificationSettings.notifyNewComplaints}
                        onChange={(e) => setNotificationSettings({...notificationSettings, notifyNewComplaints: e.target.checked})}
                      />
                      <label htmlFor="notifyNewComplaints" className="ml-2 block text-sm text-gray-700">
                        Nouvelles plaintes
                      </label>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="notifyStatusChange"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={notificationSettings.notifyStatusChange}
                        onChange={(e) => setNotificationSettings({...notificationSettings, notifyStatusChange: e.target.checked})}
                      />
                      <label htmlFor="notifyStatusChange" className="ml-2 block text-sm text-gray-700">
                        Changements de statut
                      </label>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="notifyAssignment"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={notificationSettings.notifyAssignment}
                        onChange={(e) => setNotificationSettings({...notificationSettings, notifyAssignment: e.target.checked})}
                      />
                      <label htmlFor="notifyAssignment" className="ml-2 block text-sm text-gray-700">
                        Assignations de plaintes
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="notifyComments"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={notificationSettings.notifyComments}
                        onChange={(e) => setNotificationSettings({...notificationSettings, notifyComments: e.target.checked})}
                      />
                      <label htmlFor="notifyComments" className="ml-2 block text-sm text-gray-700">
                        Nouveaux commentaires
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-md">
                  <div className="flex">
                    <Mail className="h-5 w-5 text-blue-400 mr-2" />
                    <p className="text-sm text-blue-700">
                      Les notifications par email utiliseront l'adresse configurée dans les paramètres généraux
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 pb-2 border-b">Paramètres de Sécurité</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="requireTwoFactor"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={securitySettings.requireTwoFactor}
                      onChange={(e) => setSecuritySettings({...securitySettings, requireTwoFactor: e.target.checked})}
                    />
                    <label htmlFor="requireTwoFactor" className="ml-2 block text-sm text-gray-700">
                      Exiger l'authentification à deux facteurs
                    </label>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-1">
                      Délai d'expiration de session (minutes)
                    </label>
                    <input
                      type="number"
                      id="sessionTimeout"
                      min="5"
                      max="240"
                      className="w-full px-3 py-2 border rounded-md"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="loginAttempts" className="block text-sm font-medium text-gray-700 mb-1">
                      Tentatives de connexion avant blocage
                    </label>
                    <input
                      type="number"
                      id="loginAttempts"
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border rounded-md"
                      value={securitySettings.loginAttempts}
                      onChange={(e) => setSecuritySettings({...securitySettings, loginAttempts: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Politique de mot de passe</h3>
                  
                  <div className="mb-4">
                    <label htmlFor="passwordMinLength" className="block text-sm font-medium text-gray-700 mb-1">
                      Longueur minimale
                    </label>
                    <input
                      type="number"
                      id="passwordMinLength"
                      min="6"
                      max="16"
                      className="w-full px-3 py-2 border rounded-md"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings({...securitySettings, passwordMinLength: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="passwordRequireSpecial"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={securitySettings.passwordRequireSpecial}
                      onChange={(e) => setSecuritySettings({...securitySettings, passwordRequireSpecial: e.target.checked})}
                    />
                    <label htmlFor="passwordRequireSpecial" className="ml-2 block text-sm text-gray-700">
                      Exiger des caractères spéciaux
                    </label>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="passwordRequireNumbers"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={securitySettings.passwordRequireNumbers}
                      onChange={(e) => setSecuritySettings({...securitySettings, passwordRequireNumbers: e.target.checked})}
                    />
                    <label htmlFor="passwordRequireNumbers" className="ml-2 block text-sm text-gray-700">
                      Exiger des chiffres
                    </label>
                  </div>
                  
                  <div>
                    <label htmlFor="passwordExpiryDays" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration du mot de passe (jours)
                    </label>
                    <input
                      type="number"
                      id="passwordExpiryDays"
                      min="0"
                      max="365"
                      className="w-full px-3 py-2 border rounded-md"
                      value={securitySettings.passwordExpiryDays}
                      onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiryDays: parseInt(e.target.value)})}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      0 = pas d'expiration
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-md">
                <div className="flex">
                  <Lock className="h-5 w-5 text-yellow-400 mr-2" />
                  <p className="text-sm text-yellow-700">
                    Les changements de politique de sécurité seront appliqués à tous les utilisateurs lors de leur prochaine connexion
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 pb-2 border-b">Paramètres Système</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-1">URL de l'API</label>
                  <input
                    type="text"
                    id="apiUrl"
                    className="w-full px-3 py-2 border rounded-md"
                    value={systemSettings.apiUrl}
                    onChange={(e) => setSystemSettings({...systemSettings, apiUrl: e.target.value})}
                  />
                </div>
                
                <div>
                  <label htmlFor="maxFileSize" className="block text-sm font-medium text-gray-700 mb-1">
                    Taille maximale des fichiers (MB)
                  </label>
                  <input
                    type="number"
                    id="maxFileSize"
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border rounded-md"
                    value={systemSettings.maxFileSize}
                    onChange={(e) => setSystemSettings({...systemSettings, maxFileSize: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="enableMaintenance"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={systemSettings.enableMaintenance}
                    onChange={(e) => setSystemSettings({...systemSettings, enableMaintenance: e.target.checked})}
                  />
                  <label htmlFor="enableMaintenance" className="ml-2 block text-sm text-gray-700">
                    Activer le mode maintenance
                  </label>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="maintenanceMessage" className="block text-sm font-medium text-gray-700 mb-1">
                    Message de maintenance
                  </label>
                  <textarea
                    id="maintenanceMessage"
                    rows="2"
                    className="w-full px-3 py-2 border rounded-md"
                    value={systemSettings.maintenanceMessage}
                    onChange={(e) => setSystemSettings({...systemSettings, maintenanceMessage: e.target.value})}
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="dbBackupFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                    Fréquence de sauvegarde de la base de données
                  </label>
                  <select
                    id="dbBackupFrequency"
                    className="w-full px-3 py-2 border rounded-md"
                    value={systemSettings.dbBackupFrequency}
                    onChange={(e) => setSystemSettings({...systemSettings, dbBackupFrequency: e.target.value})}
                  >
                    <option value="hourly">Toutes les heures</option>
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="manual">Manuelle uniquement</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="logLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    Niveau de journalisation
                  </label>
                  <select
                    id="logLevel"
                    className="w-full px-3 py-2 border rounded-md"
                    value={systemSettings.logLevel}
                    onChange={(e) => setSystemSettings({...systemSettings, logLevel: e.target.value})}
                  >
                    <option value="error">Erreurs uniquement</option>
                    <option value="warning">Avertissements et erreurs</option>
                    <option value="info">Informatif</option>
                    <option value="debug">Débogage</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableDebugMode"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={systemSettings.enableDebugMode}
                      onChange={(e) => setSystemSettings({...systemSettings, enableDebugMode: e.target.checked})}
                    />
                    <label htmlFor="enableDebugMode" className="ml-2 block text-sm text-gray-700">
                      Activer le mode débogage
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Le mode débogage affiche des informations supplémentaires lors des erreurs et ralentit les performances
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex">
                  <Database className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Informations système</p>
                    <p className="text-xs text-gray-600">Version: 1.0.0</p>
                    <p className="text-xs text-gray-600">Dernière sauvegarde: 08/05/2025 02:30</p>
                    <p className="text-xs text-gray-600">Espace disque: 1.2 GB / 10 GB</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button className="px-4 py-2 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50">
                  Télécharger les journaux du système
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}