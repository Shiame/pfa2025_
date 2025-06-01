import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"
});

/**
 * Enhanced fetchComplaintById that handles the new response format
 * with full AnalyseIA data from the database
 */
export const fetchComplaintById = (id) =>
  api.get(`/plaintes/${id}`).then((r) => {
    const responseData = r.data;
    
    // Handle the enhanced response format from the backend
    if (responseData && responseData.plainte) {
      const complaint = responseData.plainte;
      const aiAnalysis = responseData.analyse_ia;
      
      // Merge AI analysis data into the complaint object for easier access
      if (aiAnalysis) {
        complaint.aiAnalysis = {
          id: aiAnalysis.id,
          categorie: aiAnalysis.categorie,
          niveau_urgence: aiAnalysis.niveau_urgence,
          priorite: aiAnalysis.priorite,
          scores: aiAnalysis.scores,
          details_calcul: aiAnalysis.details_calcul,
          full_response: aiAnalysis.full_response,
          // Backward compatibility
          analyseIA: aiAnalysis
        };
        complaint.has_ai_analysis = responseData.has_ai_analysis || true;
      }
      
      // Include contextual data if available
      if (responseData.zone_context) {
        complaint.zone_context = responseData.zone_context;
      }
      
      return complaint;
    }
    
    // Fallback to original format
    return responseData;
  });

/**
 * Récupère la liste paginée et filtrée des plaintes
 */
export const fetchComplaints = (params) =>
  api.get("/plaintes", { params }).then((r) => r.data);

/**
 * Met à jour le statut d'une plainte
 */
export const updateComplaintStatus = (id, status) =>
  api.patch(`/plaintes/${id}/status`, { status }).then((r) => r.data);

/**
 * Récupère uniquement les infos du citoyen rattaché à une plainte
 */
export const fetchCitizenByComplaint = (id) =>
  api.get(`/plaintes/${id}/citoyen`).then((r) => r.data);

/**
 * NEW: Fetch detailed AI analysis for a complaint
 */
export const fetchComplaintAIAnalysis = (id) =>
  api.get(`/plaintes/${id}/ai-analysis`).then((r) => r.data);

/**
 * NEW: Refresh AI analysis for a complaint (re-classify)
 */
export const refreshComplaintAIAnalysis = (id) =>
  api.post(`/plaintes/${id}/refresh-ai-analysis`).then((r) => r.data);

/**
 * NEW: Get AI analysis statistics for the dashboard
 */
export const fetchAIAnalysisStats = (hours = 24) =>
  api.get(`/plaintes/ai-stats`, { params: { hours } }).then((r) => r.data);