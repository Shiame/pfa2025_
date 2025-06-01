// Mock data for statistics panel
export const globalStatistics = [
  {
    id: 1,
    title: "Plaintes traitées",
    value: 80,
    unit: "%",
    description: "des plaintes traitées cette année",
    trend: "up",
    trendValue: 12,
    icon: "chart"
  },
  {
    id: 2,
    title: "Augmentation des signalements",
    value: 25,
    unit: "%",
    description: "des signalements cette semaine",
    trend: "up",
    trendValue: 25,
    icon: "trend"
  },
  {
    id: 3,
    title: "Temps de réponse moyen",
    value: 48,
    unit: "h",
    description: "pour une première intervention",
    trend: "down",
    trendValue: 15,
    icon: "clock"
  },
  {
    id: 4,
    title: "Satisfaction utilisateurs",
    value: 87,
    unit: "%",
    description: "de satisfaction pour le traitement des plaintes",
    trend: "up",
    trendValue: 5,
    icon: "user"
  }
];

export const alertMessages = [
  "Intervention prioritaire recommandée dans les zones à forte densité",
  "Augmentation significative des signalements d'agressions cette semaine",
  "Amélioration du temps de traitement des plaintes d'hygiène de 22%"
];

// Monthly data trends for possible charts
export const monthlyData = [
  { month: 'Jan', complaints: 120, resolved: 95 },
  { month: 'Feb', complaints: 145, resolved: 110 },
  { month: 'Mar', complaints: 162, resolved: 128 },
  { month: 'Apr', complaints: 175, resolved: 140 },
  { month: 'May', complaints: 183, resolved: 152 },
  { month: 'Jun', complaints: 201, resolved: 165 }
];