import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function SignIn() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Auth logic here...
    navigate('/');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-red-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        {/* Header avec Logo et Nom */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="Un Maroc Meilleur Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <div className="mb-2">
            <div className="flex items-center justify-center space-x-1">
              <span className="font-bold text-2xl text-red-600">Un Maroc</span>
              <span className="font-bold text-2xl text-green-700">Meilleur</span>
            </div>
            <p className="text-sm text-amber-600 font-medium mt-1">
              Votre voix pour un avenir meilleur
            </p>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Connexion Admin</h2>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors" 
              required 
            />
          </div>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe" 
              className="w-full p-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors" 
              required 
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500 transition-colors"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-medium hover:from-red-700 hover:to-red-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
          >
            Se connecter
          </button>
        </form>

        {/* Retour à l'accueil */}
        <div className="mt-4 text-center">
          <Link 
            to="/" 
            className="text-sm text-green-600 hover:text-green-700 font-medium hover:underline transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignIn;