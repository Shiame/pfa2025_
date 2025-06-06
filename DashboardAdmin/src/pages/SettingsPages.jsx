import { useState, useEffect } from "react";
import { User, Home } from "lucide-react";
import axios from "axios";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profil");
  const [profil, setProfil] = useState({ nom: "", prenom: "", email: "" });
  const [landing, setLanding] = useState({ siteTitle: "", siteDescription: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Charger le profil admin au démarrage
  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8080/utilisateurs/admin')
      .then(res => {
        setProfil({
          nom: res.data.nom || "",
          prenom: res.data.prenom || "",
          email: res.data.email || ""
        });
      })
      .catch(() => setMsg("Erreur lors du chargement du profil admin"))
      .finally(() => setLoading(false));

    // Charger le contenu du landing page (si besoin)
    axios.get("/api/settings")
      .then(res => {
        setLanding({
          siteTitle: res.data.siteTitle || "",
          siteDescription: res.data.siteDescription || ""
        });
      })
      .catch(() => setMsg("Erreur lors du chargement du landing page"));
  }, []);

  // Enregistrer les modifications
  const handleSave = (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    // Si profil admin actif
    if (activeTab === "profil") {
      axios.put('http://localhost:8080/utilisateurs/admin', profil)
        .then(() => setMsg("Profil administrateur enregistré avec succès !"))
        .catch(() => setMsg("Erreur lors de l'enregistrement du profil admin"))
        .finally(() => setLoading(false));
    }

    // Si landing page actif
    if (activeTab === "landing") {
      axios.post("/api/settings", landing)
        .then(() => setMsg("Landing page enregistrée avec succès !"))
        .catch(() => setMsg("Erreur lors de l'enregistrement du landing page"))
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-sm rounded-xl m-4 flex flex-col p-2">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 px-3 mt-2">Paramètres</h1>
        <nav className="flex flex-col gap-2">
          <button
            className={`flex items-center gap-2 px-4 py-3 rounded-md text-left text-sm font-medium transition ${
              activeTab === "profil"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("profil")}
          >
            <User size={18} /> Profil admin
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-3 rounded-md text-left text-sm font-medium transition ${
              activeTab === "landing"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("landing")}
          >
            <Home size={18} /> Landing page
          </button>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-800">
            {activeTab === "profil" ? "Profil administrateur" : "Contenu de la page d’accueil"}
          </h2>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-2 rounded-md transition ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <span>Enregistrer les modifications</span>
          </button>
        </div>
        <form
          className="bg-white rounded-xl shadow-sm p-8 max-w-2xl space-y-6"
          onSubmit={handleSave}
        >
          {activeTab === "profil" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={profil.nom}
                  onChange={e => setProfil({ ...profil, nom: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prénom</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={profil.prenom}
                  onChange={e => setProfil({ ...profil, prenom: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-md"
                  value={profil.email}
                  onChange={e => setProfil({ ...profil, email: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
          )}
          {activeTab === "landing" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre du site</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={landing.siteTitle}
                  onChange={e => setLanding({ ...landing, siteTitle: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description du site</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  value={landing.siteDescription}
                  onChange={e => setLanding({ ...landing, siteDescription: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
          )}
          {msg && (
            <div className={`text-sm font-medium mt-4 ${msg.startsWith("Erreur") ? "text-red-600" : "text-green-600"}`}>
              {msg}
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
