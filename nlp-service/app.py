from fastapi import FastAPI, Request, HTTPException, Body
import spacy
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import logging
from datetime import datetime
from fastapi.responses import JSONResponse
import requests
from typing import List, Dict, Optional
import json



#charger notre modèle entrainé
try :
    nlp = spacy.load("model_spacy_plaintes")
except Exception as e :
    raise RuntimeError(f"Erreur de chargement de  modèle NLP: {str(e)} ")


#config de logging : 
logging.basicConfig(
    filename='nlp_service.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
try:
    nlp = spacy.load("model_spacy_plaintes")
except Exception as e:
    raise RuntimeError(f"Erreur de chargement de modèle NLP: {str(e)}")

app = FastAPI(
    title="Service NLP pour gestion de Plaintes - Enhanced",
    description="API de classification, priorisation ET génération de résumés intelligents",
    version="2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


#le schéma des requetes avec Pydantic 
class PlainteIn(BaseModel):
    description: str
    localisation: str = "Inconnue"
    date_indcident: datetime = datetime.now()

class PlainteOut(BaseModel):
    categorie: str
    scores: dict
    priorite: int
    niveau_urgence: str
    details_calcul: dict 

class SummaryRequest(BaseModel):
    complaints: List[Dict]  
    hours_back: int = 7
    zone_filter: Optional[str] = None

class SummaryResponse(BaseModel):
    natural_language_summary: str
    trends: Dict
    recommendations: List[str]
    anomalies_detected: bool
    severity_level: str

class TrendAnalysisRequest(BaseModel):
    current_period_data: List[Dict]
    previous_period_data: List[Dict]
    analysis_type: str = "percentage_change"
#----------------------------------------
CATEGORY_SEMANTIC_GROUPS = {
    "AGRESSION": "Violences et Sécurité",
    "HARCELEMENT": "Violences et Sécurité", 
    "VOL": "Violences et Sécurité",
    "DECHETS": "Problèmes Environnementaux",
    "POLLUTION": "Problèmes Environnementaux",
    "CORRUPTION": "Infractions Administratives",
    "VOIRIE": "Infrastructure et Transport",
    "AUTRES": "Autres Problèmes"
}

TIME_PHRASES = {
    (0, 6): "cette nuit",
    (6, 12): "ce matin", 
    (12, 18): "cet après-midi",
    (18, 24): "ce soir"
}

# Middleware de logging:
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    response = await call_next(request)
    duration = (datetime.now() - start_time).total_seconds()

    logging.info(
        f"Method={request.method} "
        f"Path={request.url.path} "
        f"Duration={duration:.2f}s "
    )
    return response



# EndPoints 

@app.get("/",
         tags=["Monitoring"],
         summary="Vérifie la santé du service",
         responses={200: {"description": "Service en bonne santé"}})
async def root_check():
    return {
        "status": "OK",
        "version": "2.0",
        "model_loaded": "spaCy/" + nlp.meta["name"],
        "timestamp": datetime.now().isoformat()
        }

@app.post("/classify",
        response_model=PlainteOut,
        summary="Classifie une plainte et calcule sa priorité",
        responses = {
            200: {"description": "Classification réussie"},
            500: {"description": "Erreur interne du modèle NLP"}
    })
async def classify_plainte(input: PlainteIn):
    try :
        #Traitement NLP
        doc = nlp(input.description)
        #la catégorie avec le score le plus élévé
        categorie = max(doc.cats, key=doc.cats.get)

        # Calcul de priorité 
        priorite_details = calculer_priorite_avancee(doc, input.localisation)
        return{
            "categorie": categorie, 
            "scores": doc.cats,
            "priorite": priorite_details["score"],
            "niveau_urgence": priorite_details["niveau_urgence"],
            "details_calcul": priorite_details["details"]
        }
    except Exception as e :
        logging.error(f"Erreur de classification : {str(e)}")
        raise HTTPException(status_code=500, detail="Echech de la classification")
    
@app.post("/generate-summary", response_model=SummaryResponse, tags=["Summary Generation"])
async def generate_summary(request: SummaryRequest):
    """Generate intelligent summary from multiple complaints"""
    try:
        # Filter by zone if specified
        complaints_data = request.complaints
        if request.zone_filter:
            complaints_data = [c for c in complaints_data if c.get('zone') == request.zone_filter]
        
        # Generate natural language summary
        natural_summary = generate_natural_summary(complaints_data, request.zone_filter)
        
        # Detect trends (you'll need to call this with previous period data)
        trends = {"current_count": len(complaints_data), "percentage_change": 0.0, "is_anomaly": False}
        
        # Generate recommendations
        recommendations = generate_recommendations(complaints_data, trends)
        
        # Determine severity
        total_high_priority = sum(1 for c in complaints_data if c.get('priority', 0) > 15)
        if total_high_priority >= 5:
            severity = "CRITICAL"
        elif total_high_priority >= 3:
            severity = "HIGH"  
        elif len(complaints_data) >= 10:
            severity = "MEDIUM"
        else:
            severity = "LOW"
        
        return SummaryResponse(
            natural_language_summary=natural_summary,
            trends=trends,
            recommendations=recommendations,
            anomalies_detected=trends.get("is_anomaly", False),
            severity_level=severity
        )
        
    except Exception as e:
        logging.error(f"Erreur génération résumé : {str(e)}")
        raise HTTPException(status_code=500, detail="Échec génération résumé")

@app.post("/analyze-trends", tags=["Trend Analysis"])
async def analyze_trends(request: TrendAnalysisRequest):
    """Analyze trends between two periods"""
    try:
        trends = detect_trends(request.current_period_data, request.previous_period_data)
        
        # Generate trend message
        percentage = trends["percentage_change"]
        if abs(percentage) < 5:
            trend_message = "Situation stable, pas de changement significatif"
        elif percentage > 0:
            trend_message = f"Augmentation de {percentage}% des signalements"
        else:
            trend_message = f"Diminution de {abs(percentage)}% des signalements"
        
        return {
            "trends": trends,
            "trend_message": trend_message,
            "recommendations": generate_recommendations(request.current_period_data, trends)
        }
        
    except Exception as e:
        logging.error(f"Erreur analyse tendances : {str(e)}")
        raise HTTPException(status_code=500, detail="Échec analyse tendances")
    

@app.post("/generate-recommendations", tags=["Recommandations"])
async def generate_recommendations_api(request: SummaryRequest = Body(...)):
    """
    Génère UNIQUEMENT des recommandations IA à partir d'une ou plusieurs plaintes.
    """
    try:
        complaints_data = request.complaints
        # Optionnel : tu peux passer des trends custom, sinon laisse vide
        recommandations = generate_recommendations(complaints_data, {})
        return {"recommendations": recommandations}
    except Exception as e:
        logging.error(f"Erreur recommendations : {str(e)}")
        raise HTTPException(status_code=500, detail="Echec recommendations")

# ma fonction ( logique métier )

def calculer_priorite_avancee(doc, localisation:str) -> dict :

    # config des règles de priorisation
    REGLES = {
        "BASE_SCORES": {
            "AGRESSION": 15,
            "CORRUPTION": 12,
            "VOIRIE": 10,
            "DECHETS": 8,
            "AUTRES": 2
        },
        "LOCALISATIONS_SENSIBLES": {
            "mots": ["école", "lycée", "hôpital", "mosquée"],
            "bonus": 5
        },
        "MOTS_URGENTS": {
            "mots": ["urgence", "urgent", "danger", "blessé", "armé", "cris"],
            "points_par_mot": 3
        },
        "CATEGORIES_SPECIFIQUES": {
            "AGRESSION": {
                "mots_cles": ["attaque", "violence", "casse", "arme"],
                "points_par_mot": 2
            },
            "DECHETS": {
                "types": ["medical", "médicaux"],
                "points_par_mot": 10
            }
        }
    }

    details = {
        "base": 0,
        "mots_urgences": 0,
        "localisation": 0,
        "specifique_categorie": 0
    }
    categorie = max(doc.cats, key=doc.cats.get)
    details["base"] = REGLES["BASE_SCORES"].get(categorie, 0)

    # vérification des mots urgents
    texte_lower = doc.text.lower()
    mots_trouves = [mot for mot in REGLES["MOTS_URGENTS"]["mots"]
                    if mot in texte_lower]
    details["mots_urgences"] = len(mots_trouves)*REGLES["MOTS_URGENTS"]["points_par_mot"]
   
    # localisations sensibles 
    localisation_lower = localisation.lower()
    if any(mot in localisation_lower for mot in REGLES["LOCALISATIONS_SENSIBLES"]["mots"]):
        details["localisation"] = REGLES["LOCALISATIONS_SENSIBLES"]["bonus"]



   # sous - catégorie
    if categorie in REGLES["CATEGORIES_SPECIFIQUES"]:
        regles = REGLES["CATEGORIES_SPECIFIQUES"][categorie]
        # pour les agressions
        if "mots_cles" in regles :
            mots_cat = [mot for mot in regles["mots_cles"] if mot in texte_lower]
            details["specifique_categorie"] += len(mots_cat)*regles["points_par_mot"]

        # pour les déchets : vérif type
        if "types" in regles:
            mots_cat = [mot for mot in regles["types"] if mot in texte_lower]
            details["specifique_categorie"] += regles["points_par_mot"] 


    score_total = sum(details.values())
    if score_total > 20: niveau = "critical"
    elif score_total > 15: niveau = "high"
    elif score_total > 8: niveau = "medium"
    else: niveau = "low"

    return {
        "score": score_total,
        "niveau_urgence": niveau,
        "details": details,

        }        



def get_time_phrase(hour: int) -> str:
    """Convert hour to natural language time phrase"""
    for (start, end), phrase in TIME_PHRASES.items():
        if start <= hour < end:
            return phrase
    return "récemment"

def generate_natural_summary(complaints_data: List[Dict], zone: str = None) -> str:
    """Generate natural language summary from complaints data"""
    if not complaints_data:
        return "Aucune plainte signalée pour cette période."
    
    # Group by category
    category_counts = {}
    for complaint in complaints_data:
        cat = complaint.get('category', 'AUTRES')
        semantic_cat = CATEGORY_SEMANTIC_GROUPS.get(cat, cat)
        category_counts[semantic_cat] = category_counts.get(semantic_cat, 0) + 1
    
    # Generate summary parts
    total_complaints = sum(category_counts.values())
    current_hour = datetime.now().hour
    time_phrase = get_time_phrase(current_hour)
    
    # Main summary
    if zone:
        base_summary = f"{time_phrase.capitalize()} à {zone}, {total_complaints} plaintes ont été signalées"
    else:
        base_summary = f"{time_phrase.capitalize()}, {total_complaints} plaintes ont été signalées"
    
    # Category breakdown
    if len(category_counts) == 1:
        category, count = next(iter(category_counts.items()))
        return f"{base_summary} concernant {category.lower()}."
    else:
        # Multiple categories
        category_parts = []
        for category, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
            if count == 1:
                category_parts.append(f"{count} cas de {category.lower()}")
            else:
                category_parts.append(f"{count} cas de {category.lower()}")
        
        if len(category_parts) > 2:
            categories_text = ", ".join(category_parts[:-1]) + f" et {category_parts[-1]}"
        else:
            categories_text = " et ".join(category_parts)
            
        return f"{base_summary} : {categories_text}."

def detect_trends(current_data: List[Dict], previous_data: List[Dict]) -> Dict:
    """Detect trends between current and previous periods"""
    current_count = len(current_data)
    previous_count = len(previous_data)
    
    if previous_count == 0:
        percentage_change = 100.0 if current_count > 0 else 0.0
    else:
        percentage_change = ((current_count - previous_count) / previous_count) * 100
    
    return {
        "current_count": current_count,
        "previous_count": previous_count,
        "percentage_change": round(percentage_change, 1),
        "trend_direction": "increase" if percentage_change > 0 else "decrease" if percentage_change < 0 else "stable",
        "is_anomaly": abs(percentage_change) >= 50.0
    }

def generate_recommendations(complaints_data: List[Dict], trends: Dict) -> List[str]:
    """Generate actionable recommendations based on complaints and trends"""
    recommendations = []
    
    # Category-based recommendations
    category_counts = {}
    zones_affected = set()
    
    for complaint in complaints_data:
        cat = complaint.get('category', 'AUTRES')
        zone = complaint.get('zone', 'Zone inconnue')
        category_counts[cat] = category_counts.get(cat, 0) + 1
        zones_affected.add(zone)
    
    # High-priority categories
    if category_counts.get('AGRESSION', 0) >= 3:
        recommendations.append("Intervention immédiate des forces de l'ordre requise")
    elif category_counts.get('AGRESSION', 0) > 0:
        recommendations.append("Surveillance renforcée recommandée")
        
    if category_counts.get('DECHETS', 0) >= 5:
        recommendations.append("Intervention d'urgence des services de nettoyage")
    elif category_counts.get('DECHETS', 0) > 0:
        recommendations.append("Planifier une intervention de nettoyage")
        
    if category_counts.get('CORRUPTION', 0) > 0:
        recommendations.append("Enquête administrative et contrôle des services concernés")
    
    # Trend-based recommendations
    if trends.get('is_anomaly', False):
        if trends.get('trend_direction') == 'increase':
            recommendations.append(f"Augmentation anormale détectée (+{trends.get('percentage_change', 0)}%) - Investigation requise")
    
    # Zone-based recommendations
    if len(zones_affected) == 1:
        zone = next(iter(zones_affected))
        recommendations.append(f"Concentrer les efforts sur la zone {zone}")
    elif len(zones_affected) > 3:
        recommendations.append("Déploiement coordonné nécessaire sur plusieurs zones")
    
    return recommendations if recommendations else ["Surveillance continue recommandée"]

@app.post("/comprehensive-analysis", tags=["Comprehensive Analysis"])
async def comprehensive_analysis(complaints: List[Dict]):
    """Comprehensive analysis combining classification, trends, and summaries"""
    try:
        results = {
            "individual_classifications": [],
            "aggregate_summary": None,
            "trends": None,
            "recommendations": []
        }
        
        # Classify each complaint individually
        for complaint in complaints:
            if complaint.get('description'):
                doc = nlp(complaint['description'])
                categorie = max(doc.cats, key=doc.cats.get)
                priorite_details = calculer_priorite_avancee(doc, complaint.get('localisation', ''))
                
                results["individual_classifications"].append({
                    "complaint_id": complaint.get('id'),
                    "categorie": categorie,
                    "priorite": priorite_details["score"],
                    "niveau_urgence": priorite_details["niveau_urgence"]
                })
        
        # Generate aggregate summary
        results["aggregate_summary"] = generate_natural_summary(complaints)
        
        # Generate recommendations
        results["recommendations"] = generate_recommendations(complaints, {})
        
        return results
        
    except Exception as e:
        logging.error(f"Erreur analyse complète : {str(e)}")
        raise HTTPException(status_code=500, detail="Échec analyse complète")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, port=8000)