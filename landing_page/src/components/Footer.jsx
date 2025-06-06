import { FaTwitter, FaFacebook, FaLinkedin, FaGithub } from 'react-icons/fa';
import Logo from './Logo';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer id="footer" className="bg-red-600 text-white py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3  gap-10">
          {/* Logo and Description */}
          <div className="md:col-span-1 lg:col-span-1">
            <div className="flex items-center justify-center mb-4">
              <Logo size="md" />
              <div className="ml-3">
                <div className="flex items-baseline space-x-1">
                  <span className="text-xl font-semibold text-white">
                    Un Maroc
                  </span>
                  <span className="text-xl font-semibold text-green-300">
                    Meilleur
                  </span>
                </div>
                <div className="text-xs text-orange-200 font-medium">
                  Votre voix pour un avenir meilleur
                </div>
              </div>
            </div>
            <p className="text-red-100 mb-4 text-center">
              Plateforme publique de signalement et de suivi des anomalies pour améliorer la sécurité et la qualité de vie.
            </p>
            
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Liens rapides</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-red-100 hover:text-green-300 transition-colors">Accueil</a></li>
              <li><a href="#map" className="text-red-100 hover:text-green-300 transition-colors">Carte</a></li>
              <li><a href="#statistics" className="text-red-100 hover:text-green-300 transition-colors">Statistiques</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact</h3>
            <ul className="space-y-2 text-red-100">
              <li>Rabat, Maroc</li>
              <li>contact@unmarocmeilleur.ma</li>
              <li>+212 (0)5 22 33 44 55</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-red-400 text-center text-red-100">
          <p>© {currentYear} Un Maroc Meilleur. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;