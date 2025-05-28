// intelligentApi.js - API Integration for NLP and Intelligent Analysis Features

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const NLP_SERVICE_URL = import.meta.env.VITE_NLP_URL || 'http://localhost:8000';


// Generic API request handler
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// ==========================================
// NLP Service Status and Health
// ==========================================


export async function fetchNLPServiceHealth() {
  return apiRequest(`${NLP_SERVICE_URL}/health`);
}

// 1. Get Intelligent Summaries (DASHBOARD)
//    /plaintes/intelligent-summary?hours=168&zone=Inconnu
export async function fetchIntelligentSummaries(hours, zone) {
  const params = new URLSearchParams({ hours });
  if (zone) params.append('zone', zone);
  return apiRequest(`${API_BASE_URL}/plaintes/intelligent-summary?${params}`);
}

// 2. Get Comprehensive Analysis (DASHBOARD/ANALYSIS PAGE)
//    /plaintes/comprehensive-analysis?hours=168
export async function fetchComprehensiveAnalysis(hours) {
  const params = new URLSearchParams({ hours });
  return apiRequest(`${API_BASE_URL}/plaintes/comprehensive-analysis?${params}`);
}

// 3. Get Trend Analysis
//    /plaintes/trend-analysis?currentHours=168&comparisonHours=336
export async function fetchTrendAnalysis(currentHours, comparisonHours) {
  const params = new URLSearchParams({
    currentHours,
    comparisonHours
  });
  return apiRequest(`${API_BASE_URL}/plaintes/trend-analysis?${params}`);
}

// 4. NLP Service Status
//    /plaintes/nlp-status
export async function fetchNLPStatus() {
  return apiRequest(`${API_BASE_URL}/plaintes/nlp-status`);
}

// 5. Complaint Details with IA analysis
//    /plaintes/{id}
export async function fetchComplaintNLPAnalysis(complaintId) {
  return apiRequest(`${API_BASE_URL}/plaintes/${complaintId}`);
}

// 6. Patch status of complaint (if used in your React)
//    /plaintes/{id}/status (PATCH)
export async function patchComplaintStatus(complaintId, status) {
  return apiRequest(`${API_BASE_URL}/plaintes/${complaintId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ==========================================
// Individual Complaint NLP Analysis
// ==========================================

export async function classifyComplaint(description, localisation = "Inconnue") {
  return apiRequest(`${NLP_SERVICE_URL}/classify`, {
    method: 'POST',
    body: JSON.stringify({
      description,
      localisation,
      date_incident: new Date().toISOString()
    }),
  });
}





export async function fetchSentimentAnalysis(fromDate, toDate) {
  const params = new URLSearchParams({
    from: fromDate.toISOString(),
    to: toDate.toISOString()
  });
  return apiRequest(`${API_BASE_URL}/stats/sentiment?${params}`);
}

export async function fetchPatternAnalysis(fromDate, toDate) {
  const params = new URLSearchParams({
    from: fromDate.toISOString(),
    to: toDate.toISOString()
  });
  return apiRequest(`${API_BASE_URL}/stats/patterns?${params}`);
}

// ==========================================
// Advanced Analytics & Insights
// ==========================================

export async function fetchModelPerformanceMetrics(fromDate, toDate) {
  // You might want to add params for the range, if your API supports it
  const params = new URLSearchParams({
    from: fromDate.toISOString(),
    to: toDate.toISOString()
  });
  return apiRequest(`${API_BASE_URL}/stats/model-performance?${params}`);
}

export async function fetchRealTimeInsights() {
  return apiRequest(`${API_BASE_URL}/stats/insights/realtime`);
}

export async function fetchAnomalyDetection(fromDate, toDate) {
  const params = new URLSearchParams({
    from: fromDate.toISOString(),
    to: toDate.toISOString()
  });
  return apiRequest(`${API_BASE_URL}/stats/anomalies?${params}`);
}

export async function fetchTextAnalytics(fromDate, toDate) {
  const params = new URLSearchParams({
    from: fromDate.toISOString(),
    to: toDate.toISOString()
  });
  return apiRequest(`${API_BASE_URL}/stats/text-analytics?${params}`);
}

// ==========================================
// Geospatial & Temporal Analysis
// ==========================================

export async function fetchGeospatialClusters(fromDate, toDate) {
  const params = new URLSearchParams({
    from: fromDate.toISOString(),
    to: toDate.toISOString()
  });
  return apiRequest(`${API_BASE_URL}/stats/geospatial-clusters?${params}`);
}

export async function fetchTemporalPatterns(fromDate, toDate) {
  const params = new URLSearchParams({
    from: fromDate.toISOString(),
    to: toDate.toISOString()
  });
  return apiRequest(`${API_BASE_URL}/stats/temporal-patterns?${params}`);
}

// ==========================================
// Prediction & Forecasting
// ==========================================

export async function fetchComplaintPredictions(hoursAhead = 24) {
  return apiRequest(`${API_BASE_URL}/stats/predictions?hours=${hoursAhead}`);
}

export async function fetchTrendForecasting(fromDate, toDate, forecastDays = 7) {
  const params = new URLSearchParams({
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
    forecast_days: forecastDays
  });
  return apiRequest(`${API_BASE_URL}/stats/forecast?${params}`);
}

// ==========================================
// Smart Recommendations
// ==========================================

export async function fetchSmartRecommendations(complaintId) {
  return apiRequest(`${API_BASE_URL}/complaints/${complaintId}/recommendations`);
}

export async function fetchSimilarComplaints(complaintId, limit = 5) {
  return apiRequest(`${API_BASE_URL}/complaints/${complaintId}/similar?limit=${limit}`);
}

export async function fetchActionPrioritization() {
  return apiRequest(`${API_BASE_URL}/stats/action-prioritization`);
}

// ==========================================
// Quality & Confidence Metrics
// ==========================================

export async function fetchDataQualityMetrics(fromDate, toDate) {
  const params = new URLSearchParams({
    from: fromDate.toISOString(),
    to: toDate.toISOString()
  });
  return apiRequest(`${API_BASE_URL}/stats/data-quality?${params}`);
}

export async function fetchConfidenceDistribution(fromDate, toDate) {
  const params = new URLSearchParams({
    from: fromDate.toISOString(),
    to: toDate.toISOString()
  });
  return apiRequest(`${API_BASE_URL}/stats/confidence-distribution?${params}`);
}

// ==========================================
// Export & Reporting
// ==========================================

export async function exportIntelligentReport(fromDate, toDate, format = 'pdf') {
  const params = new URLSearchParams({
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
    format
  });
  const response = await fetch(`${API_BASE_URL}/reports/intelligent?${params}`, {
    method: 'GET',
    headers: {
      'Accept': format === 'pdf' ? 'application/pdf' : 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`Export failed: ${response.status}`);
  }
  return response.blob();
}

export async function exportNLPAnalysis(complaintId, format = 'json') {
  const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}/nlp-export?format=${format}`, {
    method: 'GET',
    headers: {
      'Accept': format === 'pdf' ? 'application/pdf' : 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`Export failed: ${response.status}`);
  }
  return response.blob();
}

// ==========================================
// Utility Functions
// ==========================================

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

// ==========================================
// Error Handling
// ==========================================

export class IntelligentAPIError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.name = 'IntelligentAPIError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function safeApiCall(apiFunction, defaultValue = null) {
  try {
    return await apiFunction();
  } catch (error) {
    console.error('Safe API call failed:', error);
    return defaultValue;
  }
}

// ==========================================
// Real-time Updates (WebSocket)
// ==========================================

export class IntelligentUpdatesSocket {
  constructor(onMessage) {
    this.ws = null;
    this.onMessage = onMessage;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    try {
      const wsUrl = API_BASE_URL.replace('http', 'ws') + '/ws/intelligent-updates';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Intelligent updates WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Intelligent updates WebSocket disconnected');
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, 5000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}

// Default export (optional)
export default {
  fetchNLPStatus,
  fetchNLPServiceHealth,
  classifyComplaint,
  fetchComplaintNLPAnalysis,
  fetchIntelligentSummaries,
  fetchComprehensiveAnalysis,
  fetchTrendAnalysis,
  fetchSentimentAnalysis,
  fetchPatternAnalysis,
  fetchModelPerformanceMetrics,
  fetchRealTimeInsights,
  fetchAnomalyDetection,
  fetchTextAnalytics,
  fetchGeospatialClusters,
  fetchTemporalPatterns,
  fetchComplaintPredictions,
  fetchTrendForecasting,
  fetchSmartRecommendations,
  fetchSimilarComplaints,
  fetchActionPrioritization,
  fetchDataQualityMetrics,
  fetchConfidenceDistribution,
  exportIntelligentReport,
  exportNLPAnalysis,
  formatConfidence,
  formatSentiment,
  calculatePriorityLevel,
  safeApiCall,
  IntelligentUpdatesSocket,
  IntelligentAPIError
};
