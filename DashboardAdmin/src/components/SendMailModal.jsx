import React, { useState, useEffect } from "react";
import { Mail, X, Send, AlertCircle, CheckCircle, User, Building, Minus, Maximize2 } from "lucide-react";

export default function SendMailModal({ 
  open, 
  onClose, 
  plainteId = "12345", 
  defaultSubject = "", 
  defaultMessage = "",
  plainteDetails = {
    dateCreation: "2025-06-01",
    nomPlaignant: "Mohammed Alami",
    emailPlaignant: "m.alami@email.com",
    telephonePlaignant: "06 12 34 56 78",
    adressePlaignant: "123 Rue Hassan II, Casablanca",
    categorie: "Voirie et transport",
    description: "Nid de poule dangereux sur la route principale qui cause des dommages aux véhicules",
    priorite: "Haute",
    statut: "En attente",
    commentaires: "Situation urgente nécessitant une intervention rapide"
  }
}) {
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [toCommune, setToCommune] = useState(true);
  const [toMinistere, setToMinistere] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const emailCommune = "commune@ville.ma";
  const emailMinistere = "ministere@interieur.gov.ma";

  // Génère un message professionnel et détaillé à partir des données de la plainte
  useEffect(() => {
    if (plainteDetails) {
      const detailsMessage = 
`Madame, Monsieur,

Veuillez trouver ci-dessous les informations relatives à la plainte à traiter :

Numéro de plainte : ${plainteId}
Date de soumission : ${plainteDetails.dateCreation || 'Non spécifiée'}
Nom du plaignant : ${plainteDetails.nomPlaignant || 'Non spécifié'}
CIN : ${plainteDetails.cinPlaignant || 'Non spécifié'}
Email : ${plainteDetails.emailPlaignant || 'Non spécifié'}
Adresse : ${plainteDetails.adressePlaignant || 'Non spécifiée'}

Catégorie : ${plainteDetails.categorie || 'Non spécifiée'}
Description : 
${plainteDetails.description || 'Aucune description fournie'}

Priorité : ${plainteDetails.priorite || 'Normale'}
Statut actuel : ${plainteDetails.statut || 'En attente'}

${plainteDetails.commentaires ? `Commentaires additionnels :\n${plainteDetails.commentaires}\n` : ''}

Nous vous prions de bien vouloir prendre les mesures nécessaires pour traiter cette plainte dans les meilleurs délais.

Cordialement,
Service de Gestion des Plaintes
`;

      setMessage(detailsMessage);
    }
  }, [plainteDetails, plainteId, defaultMessage]);

  const handleSend = async () => {
    if (!toCommune && !toMinistere) {
      alert("Veuillez sélectionner au moins un destinataire !");
      return;
    }
    
    if (!subject.trim() || !message.trim()) {
      alert("Veuillez remplir le sujet et le message !");
      return;
    }

    setSending(true);
    try {
      // Simulation d'envoi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (e) {
      alert("Erreur lors de l'envoi");
    }
    setSending(false);
  };

  const handleClose = () => {
    if (!sending) {
      onClose();
      setSuccess(false);
    }
  };

  if (!open) return null;

  const getDestinataireText = () => {
    const destinations = [];
    if (toCommune) destinations.push("commune@ville.ma");
    if (toMinistere) destinations.push("ministere@interieur.gov.ma");
    return destinations.join(", ");
  };

  return (
    <>
      {/* Modal Container - Style Gmail en bas à droite */}
      <div 
        style={{
          position: 'fixed',
          bottom: '0',
          right: '40px',
          width: isMaximized ? '90vw' : '500px',
          height: isMinimized ? '40px' : (isMaximized ? '90vh' : '600px'),
          backgroundColor: 'white',
          borderRadius: isMaximized ? '8px' : '8px 8px 0 0',
          boxShadow: '0 -2px 25px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.1)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          maxWidth: isMaximized ? 'none' : '500px',
          left: isMaximized ? '5vw' : 'auto'
        }}
      >
        {/* Header Gmail Style */}
        <div style={{
          backgroundColor: '#404040',
          color: 'white',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '14px',
          flexShrink: 0,
          cursor: isMinimized ? 'pointer' : 'default'
        }}
        onClick={isMinimized ? () => setIsMinimized(false) : undefined}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: '500' }}>
              {isMinimized ? 'Nouveau message' : 'Nouveau message'}
            </span>
            {!isMinimized && (
              <span style={{ fontSize: '12px', color: '#ccc' }}>
                - Plainte #{plainteId}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Minus size={16} />
            </button>
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Maximize2 size={14} />
            </button>
            <button
              onClick={handleClose}
              disabled={sending}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                opacity: sending ? 0.5 : 1
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content - Hidden when minimized */}
        {!isMinimized && (
          <>
            {/* Success Message */}
            {success && (
              <div style={{
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '12px 16px',
                borderBottom: '1px solid #c3e6cb',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={16} />
                <span style={{ fontSize: '14px' }}>Mail envoyé avec succès !</span>
              </div>
            )}

            {/* Form Content */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Recipients Field */}
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e5e5e5',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ 
                  minWidth: '50px', 
                  fontSize: '14px', 
                  color: '#666',
                  fontWeight: '500'
                }}>
                  À
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    {toCommune && (
                      <span style={{
                        backgroundColor: '#f1f3f4',
                        padding: '4px 8px',
                        borderRadius: '16px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Building size={12} />
                        {emailCommune}
                        <button
                          onClick={() => setToCommune(false)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '0',
                            marginLeft: '4px',
                            cursor: 'pointer',
                            color: '#666'
                          }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {toMinistere && (
                      <span style={{
                        backgroundColor: '#f1f3f4',
                        padding: '4px 8px',
                        borderRadius: '16px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <User size={12} />
                        {emailMinistere}
                        <button
                          onClick={() => setToMinistere(false)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '0',
                            marginLeft: '4px',
                            cursor: 'pointer',
                            color: '#666'
                          }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!toCommune && (
                      <button
                        onClick={() => setToCommune(true)}
                        style={{
                          backgroundColor: '#e8f0fe',
                          color: '#1a73e8',
                          border: '1px solid #dadce0',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Building size={12} />
                        Commune
                      </button>
                    )}
                    {!toMinistere && (
                      <button
                        onClick={() => setToMinistere(true)}
                        style={{
                          backgroundColor: '#e8f0fe',
                          color: '#1a73e8',
                          border: '1px solid #dadce0',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <User size={12} />
                        Ministère
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Subject Field */}
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e5e5e5',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ 
                  minWidth: '50px', 
                  fontSize: '14px', 
                  color: '#666',
                  fontWeight: '500'
                }}>
                  Objet
                </span>
                <input
                  type="text"
                  placeholder="Objet"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  disabled={sending}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    padding: '0'
                  }}
                />
              </div>

              {/* Message Field */}
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                minHeight: 0
              }}>
                <textarea
                  placeholder="Rédigez votre message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  disabled={sending}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    padding: '16px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'none',
                    minHeight: '200px'
                  }}
                />
              </div>

              {/* Warning */}
              {(!toCommune && !toMinistere) && (
                <div style={{
                  backgroundColor: '#fef7e0',
                  borderLeft: '3px solid #f59e0b',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle style={{ color: '#d97706' }} size={16} />
                  <span style={{ color: '#92400e', fontSize: '14px' }}>
                    Sélectionnez au moins un destinataire
                  </span>
                </div>
              )}

              {/* Footer */}
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #e5e5e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f9f9f9'
              }}>
                <button
                  onClick={handleSend}
                  disabled={sending || (!toCommune && !toMinistere) || !subject.trim() || !message.trim()}
                  style={{
                    backgroundColor: '#1a73e8',
                    color: 'white',
                    border: 'none',
                    padding: '8px 24px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: (sending || (!toCommune && !toMinistere) || !subject.trim() || !message.trim()) ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!e.target.disabled) e.target.style.backgroundColor = '#1557b0'
                  }}
                  onMouseLeave={(e) => {
                    if (!e.target.disabled) e.target.style.backgroundColor = '#1a73e8'
                  }}
                >
                  {sending ? (
                    <>
                      <div style={{
                        width: '14px',
                        height: '14px',
                        border: '2px solid white',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Envoyer
                    </>
                  )}
                </button>

                <div style={{ fontSize: '12px', color: '#666' }}>
                  {message.length}/2000 caractères
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}