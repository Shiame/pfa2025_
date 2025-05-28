import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

// Create the context
const LanguageContext = createContext();

// Language data
const translations = {
  fr: {
    // Common
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    ok: 'OK',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    search: 'Rechercher',
    required: 'Requis',
    optional: 'Optionnel',
    
    // App
    appName: 'Un Maroc Meilleur',
    appSlogan: 'Vos plaintes, notre priorité',
    
    // Authentication
    login: 'Connexion',
    register: 'Inscription',
    logout: 'Déconnexion',
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    forgotPassword: 'Mot de passe oublié?',
    dontHaveAccount: "Pas encore de compte?",
    alreadyHaveAccount: "Déjà un compte?",
    signIn: 'Se connecter',
    signUp: "S'inscrire",
    createAccount: 'Créer un compte',
    welcome: 'Bienvenue!',
    loginSuccess: 'Connexion réussie',
    registrationSuccess: 'Compte créé avec succès!',
    invalidCredentials: 'Email ou mot de passe invalide',
    fillAllFields: 'Veuillez remplir tous les champs',
    accountCreationFailed: 'Impossible de créer le compte',
    
    // Profile
    profile: 'Profil',
    myProfile: 'Mon Profil',
    personalInfo: 'Informations Personnelles',
    firstName: 'Prénom',
    lastName: 'Nom',
    fullName: 'Nom Complet',
    cin: 'CIN',
    editProfile: 'Modifier le profil',
    helpSupport: 'Aide et Support',
    about: 'À propos',
    settings: 'Paramètres',
    language: 'Langue',
    
    // Complaints
    complaints: 'Plaintes',
    myComplaints: 'Mes Plaintes',
    newComplaint: 'Nouvelle Plainte',
    addComplaint: 'Ajouter une plainte',
    submitComplaint: 'Soumettre une plainte',
    complaintDetails: 'Détails de la plainte',
    description: 'Description',
    location: 'Localisation',
    category: 'Catégorie',
    status: 'Statut',
    date: 'Date',
    photo: 'Photo',
    selectPhoto: 'Sélectionner une photo',
    takePhoto: 'Prendre une photo',
    gallery: 'Galerie',
    camera: 'Caméra',
    
    // Complaint statuses
    submitted: 'Soumise',
    inProgress: 'En cours',
    resolved: 'Résolue',
    
    // Form actions
    useCurrentLocation: 'Utiliser ma position',
    getCurrentLocation: 'Obtenir la position',
    locationPermissionDenied: 'Accès à la localisation refusé',
    cameraPermissionDenied: "Autorisation d'accès à la caméra requise",
    galleryPermissionDenied: "Autorisation d'accès à la galerie requise",
    locationError: "Impossible d'obtenir la localisation",
    
    // AI Features
    aiClassification: 'Classification IA',
    aiAnalyzing: 'Analyse IA en cours...',
    suggestedByAI: 'Suggérée par IA',
    aiAnalysis: 'Analyse en cours...',
    
    // Statistics
    statistics: 'Statistiques',
    total: 'Total',
    totalComplaints: 'Total Plaintes',
    resolvedComplaints: 'Plaintes Résolues',
    pendingComplaints: 'En Attente',
    
    // Messages
    noComplaints: "Vous n'avez pas encore soumis de plaintes",
    startReporting: 'Commencez par signaler les problèmes dans votre région',
    complaintSubmitted: 'Votre plainte a été enregistrée avec succès!',
    submissionError: "Impossible d'envoyer la plainte. Veuillez réessayer plus tard.",
    loadingComplaints: 'Chargement de vos plaintes...',
    failedToLoadComplaints: 'Impossible de récupérer les plaintes',
    retry: 'Réessayer',
    viewDetails: 'Voir détails',
    
    // Validation
    emailRequired: 'Email requis',
    passwordRequired: 'Mot de passe requis',
    nameRequired: 'Nom requis',
    descriptionRequired: 'Veuillez ajouter une description',
    locationRequired: 'Veuillez préciser la localisation',
    
    // Footer
    version: 'Version',
    moroccanCitizenService: 'Service aux citoyens marocains',
    officialPlatform: 'Plateforme officielle citoyenne',
    dataSecured: 'Vos données sont sécurisées',
    termsConditions: 'En créant un compte, vous acceptez nos conditions d\'utilisation',
    
    // Actions
    sendComplaint: 'Envoyer la plainte',
    addNewComplaint: 'Ajouter une plainte',
    reportProblem: 'Signaler un problème',
    sending: 'Envoi en cours...',
    
    // Categories
    selectCategory: 'Sélectionner une catégorie',
    chooseCategory: 'Choisir une catégorie',
    manualSelection: 'Sélection manuelle',
    aiSuggestion: 'Suggestion IA',
    useAiSuggestion: 'Utiliser la suggestion IA',
    
    // Predefined categories
    waste: 'Déchets',
    assault: 'Agression',
    roads: 'Voirie',
    corruption: 'Corruption',
    other: 'Autres',
    
    // Logout
    logoutConfirm: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    logoutButton: 'Se déconnecter',
  },
  
  ar: {
    // Common
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    cancel: 'إلغاء',
    ok: 'موافق',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    search: 'بحث',
    required: 'مطلوب',
    optional: 'اختياري',
    
    // App
    appName: 'مرصد الشكايات',
    appSlogan: 'شكاياتكم أولويتنا',
    
    // Authentication
    login: 'تسجيل الدخول',
    register: 'التسجيل',
    logout: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    dontHaveAccount: 'ليس لديك حساب؟',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    signIn: 'دخول',
    signUp: 'إنشاء حساب',
    createAccount: 'إنشاء حساب جديد',
    welcome: 'أهلاً وسهلاً!',
    loginSuccess: 'تم تسجيل الدخول بنجاح',
    registrationSuccess: 'تم إنشاء حسابك بنجاح!',
    invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    fillAllFields: 'يرجى ملء جميع الحقول',
    accountCreationFailed: 'تعذر إنشاء الحساب',
    
    // Profile
    profile: 'الملف الشخصي',
    myProfile: 'ملفي الشخصي',
    personalInfo: 'المعلومات الشخصية',
    firstName: 'الاسم',
    lastName: 'النسب',
    fullName: 'الاسم الكامل',
    cin: 'رقم البطاقة الوطنية',
    editProfile: 'تعديل الملف الشخصي',
    helpSupport: 'المساعدة والدعم',
    about: 'حول التطبيق',
    settings: 'الإعدادات',
    language: 'اللغة',
    
    // Complaints
    complaints: 'الشكايات',
    myComplaints: 'شكاياتي',
    newComplaint: 'شكوى جديدة',
    addComplaint: 'إضافة شكوى',
    submitComplaint: 'تقديم شكوى',
    complaintDetails: 'تفاصيل الشكوى',
    description: 'الوصف',
    location: 'الموقع',
    category: 'الفئة',
    status: 'الحالة',
    date: 'التاريخ',
    photo: 'الصورة',
    selectPhoto: 'اختيار صورة',
    takePhoto: 'التقاط صورة',
    gallery: 'المعرض',
    camera: 'الكاميرا',
    
    // Complaint statuses
    submitted: 'مقدمة',
    inProgress: 'قيد المعالجة',
    resolved: 'محلولة',
    
    // Form actions
    useCurrentLocation: 'استخدم موقعي الحالي',
    getCurrentLocation: 'الحصول على الموقع',
    locationPermissionDenied: 'تم رفض الوصول إلى الموقع',
    cameraPermissionDenied: 'يتطلب الوصول إلى الكاميرا',
    galleryPermissionDenied: 'يتطلب الوصول إلى المعرض',
    locationError: 'تعذر الحصول على الموقع',
    
    // AI Features
    aiClassification: 'التصنيف الذكي',
    aiAnalyzing: 'جاري تحليل النص بالذكاء الاصطناعي...',
    suggestedByAI: 'تم اقتراحها بواسطة الذكاء الاصطناعي',
    aiAnalysis: 'جاري التحليل...',
    
    // Statistics
    statistics: 'الإحصائيات',
    total: 'المجموع',
    totalComplaints: 'إجمالي الشكايات',
    resolvedComplaints: 'الشكايات المحلولة',
    pendingComplaints: 'في الانتظار',
    
    // Messages
    noComplaints: 'لم تقدم أي شكايات بعد',
    startReporting: 'ابدأ بالإبلاغ عن المشاكل في منطقتك',
    complaintSubmitted: 'تم تسجيل شكواك بنجاح!',
    submissionError: 'تعذر إرسال الشكوى. يرجى المحاولة مرة أخرى.',
    loadingComplaints: 'جاري تحميل شكاياتك...',
    failedToLoadComplaints: 'تعذر استرداد الشكايات',
    retry: 'المحاولة مرة أخرى',
    viewDetails: 'عرض التفاصيل',
    
    // Validation
    emailRequired: 'البريد الإلكتروني مطلوب',
    passwordRequired: 'كلمة المرور مطلوبة',
    nameRequired: 'الاسم مطلوب',
    descriptionRequired: 'يرجى إضافة وصف',
    locationRequired: 'يرجى تحديد الموقع',
    
    // Footer
    version: 'الإصدار',
    moroccanCitizenService: 'خدمة المواطنين المغاربة',
    officialPlatform: 'منصة رسمية للمواطنين المغاربة',
    dataSecured: 'معلوماتك آمنة ومحمية',
    termsConditions: 'بإنشاء حساب، فإنك توافق على الشروط والأحكام',
    
    // Actions
    sendComplaint: 'إرسال الشكوى',
    addNewComplaint: 'إضافة شكوى جديدة',
    reportProblem: 'الإبلاغ عن مشكلة',
    sending: 'جاري الإرسال...',
    
    // Categories
    selectCategory: 'اختيار فئة',
    chooseCategory: 'اختر الفئة',
    manualSelection: 'اختيار يدوي',
    aiSuggestion: 'اقتراح الذكاء الاصطناعي',
    useAiSuggestion: 'استخدم اقتراح الذكاء الاصطناعي',
    
    // Predefined categories
    waste: 'النفايات',
    assault: 'اعتداء',
    roads: 'الطرق',
    corruption: 'فساد',
    other: 'أخرى',
    
    // Logout
    logoutConfirm: 'هل أنت متأكد من تسجيل الخروج؟',
    logoutButton: 'تسجيل الخروج',
  }
};

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && translations[savedLanguage]) {
        setCurrentLanguage(savedLanguage);
        updateRTL(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
  };

  const updateRTL = (language) => {
    const rtl = language === 'ar';
    setIsRTL(rtl);
    I18nManager.forceRTL(rtl);
  };

  const changeLanguage = async (newLanguage) => {
    if (translations[newLanguage]) {
      setCurrentLanguage(newLanguage);
      updateRTL(newLanguage);
      
      try {
        await AsyncStorage.setItem('app_language', newLanguage);
      } catch (error) {
        console.error('Error saving language:', error);
      }
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  // Get bilingual text (Arabic | French)
  const getBilingualText = (frenchKey, arabicKey = frenchKey) => {
    const frenchText = t(frenchKey);
    const arabicText = translations.ar[arabicKey] || translations.ar[frenchKey];
    return currentLanguage === 'ar' ? arabicText : `${arabicText} | ${frenchText}`;
  };

  const value = {
    currentLanguage,
    isRTL,
    changeLanguage,
    t,
    getBilingualText,
    translations: translations[currentLanguage]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;