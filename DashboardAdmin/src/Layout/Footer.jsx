export default function Footer() {
    return (
      <footer className="bg-white py-3 px-6 border-t">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div>
            <p>© 2025 Observatoire pour la Gestion des Plaintes</p>
          </div>
          <div className="flex space-x-4">
            <a href="#support" className="hover:text-gray-700">Support</a>
            <a href="#privacy" className="hover:text-gray-700">Confidentialité</a>
            <a href="#terms" className="hover:text-gray-700">Conditions</a>
          </div>
        </div>
      </footer>
    );
  }