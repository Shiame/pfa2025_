import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"
});

/**
 * Récupère la liste paginée et filtrée des plaintes
 */
export const fetchComplaints = (params) =>
  api.get("/plaintes", { params }).then((r) => r.data);

/**
 * Récupère le détail complet d'une plainte, incluant les infos du citoyen
 */
export const fetchComplaintById = (id) =>
  api.get(`/plaintes/${id}`).then((r) => r.data);

/**
 * Met à jour le statut d'une plainte
 */
export const updateComplaintStatus = (id, status) =>
  api.patch(`/plaintes/${id}/status`, { status }).then((r) => r.data);

/**
 * (Optionnel) Récupère uniquement les infos du citoyen rattaché à une plainte
 */
export const fetchCitizenByComplaint = (id) =>
  api.get(`/plaintes/${id}/citoyen`).then((r) => r.data);
