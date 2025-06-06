import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

function SignIn() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8080/auth/login",
        {
          email: form.email,
          password: form.password,
        }
      );
      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/");
      } else {
        setError("Échec de connexion");
      }
    } catch (err) {
      setError("Identifiants invalides ou erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="w-full max-w-md shadow-xl bg-white/95 rounded-2xl border border-blue-100 px-8 py-10">
        {/* Logo et titre */}
        <div className="flex flex-col items-center mb-7">
          <img
            src="../public/adapted_logo.png"
            alt="Logo Observatoire"
            className="mb-4"
            style={{
              width: "90px",
              height: "90px",
              objectFit: "contain",
              display: "block",
              borderRadius: "50%",
              boxShadow: "0 2px 12px 0 rgba(37,99,235,0.10)",
              background: "linear-gradient(135deg,#2563eb22 50%,#1d4ed822 100%)"
            }}
          />
          <h1 className="text-2xl font-extrabold text-blue-700 mb-1 tracking-tight text-center">
            Observatoire National
          </h1>
          <p className="text-sm text-blue-400 font-medium text-center mb-2">
            Service des Plaintes • Administration
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              name="email"
              autoFocus
              autoComplete="username"
              placeholder="Email"
              className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 bg-blue-50/50"
              required
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mot de passe"
              autoComplete="current-password"
              className="w-full px-4 py-3 pr-12 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 bg-blue-50/50"
              required
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 font-medium">
              {error}
            </div>
          )}
          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-semibold shadow transition-all duration-150
              ${loading
                ? "bg-blue-200 text-blue-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-md hover:scale-[1.02]"
              }`}
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
