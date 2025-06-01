// intelligentApi.js - API pour l'analyse intelligente IA

import { fetchComplaintById } from './ComplaintsApi';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
const NLP_SERVICE_URL = import.meta.env.VITE_NLP_URL || 'http://localhost:8000';

// ========== Analyse IA existante sur la plainte ==========

export async function fetchComplaintNLPAnalysis(complaintId) {
  // On récupère la plainte complète
  const complaint = await fetchComplaintById(complaintId);
  // On renvoie le champ analyseIA ou analyse_ia si dispo
  return complaint.analyseIA || complaint.analyse_ia || null;
}

// ========== (Optionnel) Appel en temps réel du service NLP ==========

export async function classifyComplaint(description, localisation = "Inconnue") {
  // Appel direct au service FastAPI pour classifier le texte
  const resp = await fetch(`${NLP_SERVICE_URL}/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description,
      localisation,
      date_incident: new Date().toISOString()
    })
  });
  if (!resp.ok) throw new Error(`Erreur NLP: ${resp.status}`);
  return await resp.json();
}

// ========== Recommandations IA ==========

export async function fetchSmartRecommendations(complaintId) {
  const resp = await fetch(`${API_BASE_URL}/plaintes/${complaintId}/recommandations`);
  if (!resp.ok) return [];
  return await resp.json();
}

// ========== Plaintes similaires ==========

export async function fetchSimilarComplaints(complaintId, limit = 5) {
  const resp = await fetch(`${API_BASE_URL}/plaintes/${complaintId}/similaires?limit=${limit}`);
  if (!resp.ok) return [];
  return await resp.json();
}

// ========== Utils UI pour le front ==========

export function formatConfidence(confidence) {
  if (confidence >= 90) return { level: 'high', color: 'green' };
  if (confidence >= 70) return { level: 'medium', color: 'yellow' };
  return { level: 'low', color: 'red' };
}

export function formatSentiment(sentiment) {
  const sentimentMap = {
    'positive': { label: 'Positif', color: 'green' },
    'negative': { label: 'Négatif', color: 'red' },
    'neutral': { label: 'Neutre', color: 'gray' }
  };
  return sentimentMap[sentiment] || sentimentMap['neutral'];
}

export function calculatePriorityLevel(score) {
  if (score >= 8) return { level: 'high', label: 'Élevée', color: 'red' };
  if (score >= 6) return { level: 'medium', label: 'Moyenne', color: 'yellow' };
  return { level: 'low', label: 'Faible', color: 'green' };
}

// ========== Wrapper safeApiCall ==========

export async function safeApiCall(apiFunction, defaultValue = null) {
  try {
    return await apiFunction();
  } catch (error) {
    console.error('Safe API call failed:', error);
    return defaultValue;
  }
}
// Appelle /generate-summary de ton FastAPI avec les plaintes à résumer
export async function generateSummaryFromBackend(complaintsArr) {
  const resp = await fetch(import.meta.env.VITE_NLP_URL + "/generate-summary", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ complaints: complaintsArr })
  });
  if (!resp.ok) return null;
  return await resp.json();
}
