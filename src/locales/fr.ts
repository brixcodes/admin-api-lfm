export default {
  nav: {
    dashboard: 'Tableau de bord',
    profile: 'Profil',
    users: 'Utilisateurs',
    trainings: 'Formations',
    management: 'Gestion',
    projects: 'Projets',
    files: 'Fichiers',
    infos: 'Informations',
    logout: 'Déconnexion',
    search: 'Rechercher',
    notifications: 'Notifications',
  },
  profile: {
    tabs: {
      profile: 'Profil',
      security: 'Sécurité',
      notifications: 'Notifications',
      gen_individual: 'Individuel',
      gen_ancestry: 'Ascendance',
      gen_health: 'Santé',
      gen_education: 'Éducation',
      gen_pii: 'PII',
    },
  },
  system: {
    tabs: {
      users: 'Utilisateurs',
      roles: 'Rôles',
      permissions: 'Permissions',
      journal: 'Journal',
    },
    users: {
      no_role: 'Aucun rôle',
      gender: { homme: 'Homme', femme: 'Femme', autre: 'Autre' },
      labels: {
        phone: 'Téléphone', nationality: 'Nationalité', country: 'Pays', region: 'Région', city: 'Ville', address: 'Adresse'
      },
      details: {
        details_title: 'Détails utilisateur', username: 'Nom d’utilisateur', email: 'Email', gender: 'Sexe',
        birth_date: 'Date de naissance', years_old: 'ans', status: 'Statut', created_at: 'Créé le',
        phone: 'Téléphone', nationality: 'Nationalité', country: 'Pays', region: 'Région', city: 'Ville', address: 'Adresse'
      },
      create: {
        title: 'Créer un utilisateur', subtitle: 'Renseignez les informations ci-dessous',
        first_name: 'Prénom', first_name_placeholder: 'Ex: Jean', last_name: 'Nom', last_name_placeholder: 'Ex: Dupont',
        email: 'Email', email_placeholder: 'exemple@domaine.com', gender: 'Sexe', birth_date: 'Date de naissance', birth_date_placeholder: 'AAAA-MM-JJ',
        role: 'Rôle', submit: 'Créer', password_note: 'Un mot de passe sera généré et envoyé par email.',
        phone: 'Téléphone', phone_placeholder: 'Ex: +225 01 23 45 67',
        nationality: 'Nationalité', nationality_placeholder: 'Ex: Ivoirienne',
        country: 'Pays', country_placeholder: 'Ex: Côte d’Ivoire',
        region: 'Région', region_placeholder: 'Ex: Abidjan',
        city: 'Ville', city_placeholder: 'Ex: Abobo',
        address: 'Adresse', address_placeholder: 'Ex: Cocody 2 Plateaux, Rue 12, Villa 34',
        confirm: {
          title: 'Confirmation', subtitle: 'Vérifiez les informations avant de créer', message: 'Êtes-vous sûr de vouloir créer cet utilisateur ?',
          summary: 'Récapitulatif utilisateur', create: 'Confirmer la création', password_info: 'Le mot de passe sera envoyé par email.'
        }
      },
      edit: {
        subtitle: 'Modifier les informations de cet utilisateur', first_name: 'Prénom', first_name_placeholder: 'Ex: Jean',
        last_name: 'Nom', last_name_placeholder: 'Ex: Dupont', email: 'Email', email_placeholder: 'exemple@domaine.com',
        gender: 'Sexe', birth_date: 'Date de naissance', role: 'Rôle',
        phone: 'Téléphone', nationality: 'Nationalité', country: 'Pays', region: 'Région', city: 'Ville', address: 'Adresse',
        current_role: 'Rôle actuel'
      },
      actions: {
        edit: 'Modifier', assign_permissions: 'Assigner des permissions', revoke_permissions: 'Révoquer des permissions'
      },
      status: {
        active: 'Actif', inactive: 'Inactif', suspended: 'Suspendu'
      },
      permissions_count: 'permissions'
    }
  },
  formations: {
    title: 'Formations',
    description: 'Catalogue des formations.',
    tabs: {
      catalog: 'Catalogue',
      modules: 'Modules',
      resources: 'Ressources',
      assessments: 'Évaluations',
    },
    modules: {
      title: 'Modules de formation',
      description: 'Gestion des modules par formation.',
    },
    resources: {
      title: 'Ressources',
      description: 'Documents, images, vidéos et audios liés aux formations.',
    },
    assessments: {
      title: 'Évaluations',
      description: 'Questions, propositions et résultats d\'évaluation.',
    },
  },
  gestion: {
    tabs: {
      enrollments: 'Inscriptions',
      payments: 'Paiements',
    },
  },
  projects: {
    tabs: {
      masterpieces: "Chefs-d'œuvres",
      collective: 'Collectifs',
    },
  },
  files: {
    tabs: {
      documents: 'Documents',
      images: 'Images',
      audios: 'Audios',
      videos: 'Vidéos',
    },
    documents: {
      title: 'Documents',
      description: 'Liste des documents (liés à /static/documents).',
    },
    images: {
      title: 'Images',
      description: 'Liste des images (liées à /static/images).',
    },
    audios: {
      title: 'Audios',
      description: 'Liste des audios (liés à /static/audios).',
    },
    videos: {
      title: 'Vidéos',
      description: 'Liste des vidéos (liées à /static/videos).',
    },
  },
  infos: {
    tabs: {
      news: 'Actualités',
      accreditations: 'Accréditations',
    },
  },
  login: {
    title: 'Lafaom-MAO',
    subtitle: 'Institut de formation et d\'intervention sociale dans l\'univers carcéral',
    email: 'Adresse email',
    password: 'Mot de passe',
    remember: 'Se souvenir de moi',
    forgot: 'Mot de passe oublié?',
    login: 'Se connecter',
    loading: 'Connexion en cours...',
    errorTitle: 'Erreur de connexion',
    errorMessage: '{{error}}',
    createAccount: 'Créer un compte',
    newHere: 'Nouveau sur notre plateforme?',
  },
  dashboard: {
    welcome: {
      title: 'Bienvenue sur le tableau de bord',
      message: 'Bienvenue sur la plateforme LAFAOM-MAO.',
      actionLabel: 'En savoir plus',
    },
    stats: {
      general: 'Statistiques générales',
    },
    weeklyOverview: 'Aperçu hebdomadaire',
    totalEarning: 'Gains totaux',
    salesByCountries: 'Ventes par pays',
    deposit: 'Dépôt',
    withdraw: 'Retrait',
    viewAll: 'Voir tout',
    details: 'Détails',
    submit: 'Soumettre',
    reset: 'Réinitialiser',
    rememberMe: 'Se souvenir de moi',
  },
  account: {
    details: 'Détails du compte',
    deactivate: 'Désactiver le compte',
    changePassword: 'Changer le mot de passe',
    twoFactor: 'Vérification en deux étapes',
    apiKey: 'Créer une clé API',
    apiKeyList: 'Liste des clés API et accès',
    recentDevices: 'Appareils récents',
    uploadPhoto: 'Télécharger une nouvelle photo',
    reset: 'Réinitialiser',
    saveChanges: 'Enregistrer les modifications',
    learnMore: 'En savoir plus',
    requestPermission: 'Demander la permission',
  },
  userProfile: {
    profile: 'Profil',
    settings: 'Paramètres',
    pricing: 'Tarification',
    faq: 'FAQ',
    logout: 'Déconnexion',
  },
  footer: {
    themeSelection: 'Sélection de thème',
    license: 'Licence',
    moreThemes: 'Plus de thèmes',
    documentation: 'Documentation',
    support: 'Support',
  },
  password: {
    title: 'Changer le mot de passe',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    rules: {
      minLength: 'Au moins {{minLength}} caractères',
      uppercase: 'Au moins une majuscule',
      lowercase: 'Au moins une minuscule',
      number: 'Au moins un chiffre',
      special: 'Au moins un caractère spécial',
    },
    validate: 'Valider',
    resetError: 'Erreur de réinitialisation',
    resetSuccess: 'Email envoyé avec succès!',
  },
  forgotPassword: {
    title: 'Mot de passe oublié? 🔐',
    subtitle: 'Entrez votre adresse email et nous vous enverrons les instructions pour réinitialiser votre mot de passe',
    email: 'Adresse email',
    emailPlaceholder: 'Entrez votre adresse email',
    emailRequired: 'L\'email est requis',
    emailInvalid: 'Format d\'email invalide',
    sendButton: 'Envoyer le lien de réinitialisation',
    sending: 'Envoi en cours...',
    backToLogin: 'Retour à la connexion',
    redirectMessage: 'Vous allez être redirigé vers la page de connexion dans quelques secondes...',
  },
  register: {
    title: 'Créer un compte',
    subtitle: 'Rejoignez notre plateforme de formation',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Adresse email',
    gender: 'Sexe',
    male: 'Homme',
    female: 'Femme',
    role: 'Rôle',
    roleInSystem: 'Rôle dans le système',
    student: 'Apprenant - Étudiant/apprenant',
    studentDesc: 'Accès aux formations et projets pédagogiques',
    trainer: 'Formateur - Formateur/enseignant',
    trainerDesc: 'Gestion des modules et évaluation des apprenants',
    referent: 'Référent - Formateur référent',
    referentDesc: 'Accompagnement personnalisé et suivi des parcours',
    coordinator: 'Coordonnateur - Responsable de programme',
    coordinatorDesc: 'Coordination des formations et gestion des équipes',
    admin: 'Administrateur - Administrateur du système',
    adminDesc: 'Gestion complète de la plateforme et des utilisateurs',
    register: 'Créer le compte',
    signUp: 'S\'inscrire',
    loading: 'Création en cours...',
    signingUp: 'Inscription en cours...',
    errorTitle: 'Erreur de création',
    errorMessage: '{{error}}',
    alreadyHaveAccount: 'Vous avez déjà un compte?',
    login: 'Se connecter',
    or: 'ou',
    acceptTerms: 'J\'accepte les conditions d\'utilisation et la politique de confidentialité',
    validation: {
      firstNameRequired: 'Le prénom est requis',
      firstNameMinLength: 'Le prénom doit contenir au moins 2 caractères',
      lastNameRequired: 'Le nom est requis',
      lastNameMinLength: 'Le nom doit contenir au moins 2 caractères',
      emailRequired: 'L\'email est requis',
      emailInvalid: 'Format d\'email invalide',
      genderRequired: 'Le sexe est requis',
      roleRequired: 'Le rôle est requis',
    },
  },
  pages: {
    actualites: {
      title: 'Actualités',
      description: 'Actualités et communications.',
    },
    accreditations: {
      title: 'Accréditations',
      description: 'Gestion des accréditations.',
    },
    paiements: {
      title: 'Paiements',
      description: 'Gestion des paiements et transactions.',
    },
    inscriptions: {
      title: 'Inscriptions',
      description: 'Suivi des inscriptions aux formations.',
    },
    utilisateurs: {
      title: 'Utilisateurs',
      description: 'Liste, création et gestion des utilisateurs.',
    },
    roles: {
      title: 'Rôles',
      description: 'Configuration des rôles et des permissions.',
    },
    permissions: {
      title: 'Permissions',
      description: 'Gestion des permissions.',
    },
    journal: {
      title: 'Journal',
      description: 'Historique des actions et audits.',
    },
    genetique: {
      ascendance: {
        title: 'Ascendance',
        description: 'Gestion de l\'ascendance génétique.',
      },
      education: {
        title: 'Éducation',
        description: 'Parcours éducatif lié au génotype.',
      },
      sante: {
        title: 'Santé',
        description: 'Données de santé liées au génotype.',
      },
      individuel: {
        title: 'Individuel',
        description: 'Gestion des données individuelles (génotype).',
        genotype: 'Génotype',
      },
      planIntervention: {
        title: 'Plan d\'intervention',
        description: 'Plans d\'intervention personnalisés.',
        individualized: 'individualisé',
      },
    },
    projets: {
      collectifs: {
        title: 'Collectifs',
        description: 'Groupes, missions et réalisations collectives.',
      },
      chefsOeuvre: {
        title: 'Chefs-d\'œuvres',
        description: 'Gestion des projets individuels (chefs-d\'œuvre).',
      },
    },
  },
  ui: {
    typography: {
      headlines: 'Titres',
      texts: 'Textes',
    },
    tables: {
      dessert: 'Dessert',
      calories: 'Calories',
      fat: 'Matières grasses',
      carbs: 'Glucides',
      protein: 'Protéines',
    },
    cards: {
      solid: 'Carte solide',
      navigation: 'Navigation',
      users: 'Utilisateurs',
    },
    forms: {
      firstName: 'Prénom',
      email: 'Email',
      mobile: 'Mobile',
      password: 'Mot de passe',
    },
  },
  error: {
    notFound: 'Page non trouvée ⚠️',
    notFoundMessage: 'Désolé, la page que vous recherchez n\'existe pas.',
  },
  validation: {
    required: 'Ce champ est requis',
    email: 'Format d’email invalide',
  },

  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    loading: 'Chargement...',
    noData: 'Aucune donnée',
    actions: 'Actions',
    status: 'Statut',
    date: 'Date',
    name: 'Nom',
    description: 'Description',
    type: 'Type',
    amount: 'Montant',
    currency: 'Devise',
    country: 'Pays',
    language: 'Langue',
    timezone: 'Fuseau horaire',
    phone: 'Téléphone',
    address: 'Adresse',
    state: 'État/Province',
    zipCode: 'Code postal',
  },
}

