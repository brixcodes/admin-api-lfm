// Enums alignés sur src/util/helper/enum.py (backend)
// Représentés comme unions de chaînes pour une meilleure DX côté TS

export type PermissionEnum =
  // Utilisateurs
  | 'lire_utilisateur'
  | 'modifier_utilisateur'
  | 'creer_utilisateur'
  | 'supprimer_utilisateur'
  | 'reinitialiser_mot_de_passe'
  | 'changer_mot_de_passe'
  // Permissions
  | 'lire_permission'
  | 'modifier_permission'
  | 'creer_permission'
  | 'supprimer_permission'
  // Rôles
  | 'lire_role'
  | 'modifier_role'
  | 'creer_role'
  | 'supprimer_role'
  // Formations
  | 'lire_formation'
  | 'modifier_formation'
  | 'creer_formation'
  | 'supprimer_formation'
  // Inscriptions
  | 'lire_inscription'
  | 'modifier_inscription'
  | 'creer_inscription'
  | 'supprimer_inscription'
  // Paiements
  | 'lire_paiement'
  | 'modifier_paiement'
  | 'creer_paiement'
  | 'supprimer_paiement'
  // Modules
  | 'lire_module'
  | 'modifier_module'
  | 'creer_module'
  | 'supprimer_module'
  // Ressources
  | 'lire_ressource'
  | 'modifier_ressource'
  | 'creer_ressource'
  | 'supprimer_ressource'
  // Chefs-d'oeuvre
  | 'lire_chef_d_oeuvre'
  | 'modifier_chef_d_oeuvre'
  | 'creer_chef_d_oeuvre'
  | 'supprimer_chef_d_oeuvre'
  // Projets collectifs
  | 'lire_projet_collectif'
  | 'modifier_projet_collectif'
  | 'creer_projet_collectif'
  | 'supprimer_projet_collectif'
  // Évaluations
  | 'lire_evaluation'
  | 'modifier_evaluation'
  | 'creer_evaluation'
  | 'supprimer_evaluation'
  // Questions
  | 'lire_question'
  | 'modifier_question'
  | 'creer_question'
  | 'supprimer_question'
  // Propositions
  | 'lire_proposition'
  | 'modifier_proposition'
  | 'creer_proposition'
  | 'supprimer_proposition'
  // Résultats d'évaluations
  | 'lire_resultat_evaluation'
  | 'modifier_resultat_evaluation'
  | 'creer_resultat_evaluation'
  | 'supprimer_resultat_evaluation'
  // Génotypes
  | 'lire_genotype'
  | 'modifier_genotype'
  | 'creer_genotype'
  | 'supprimer_genotype'
  // Ascendances
  | 'lire_ascendance_genotype'
  | 'modifier_ascendance_genotype'
  | 'creer_ascendance_genotype'
  | 'supprimer_ascendance_genotype'
  // Santé
  | 'lire_sante_genotype'
  | 'modifier_sante_genotype'
  | 'creer_sante_genotype'
  | 'supprimer_sante_genotype'
  // Éducation
  | 'lire_education_genotype'
  | 'modifier_education_genotype'
  | 'creer_education_genotype'
  | 'supprimer_education_genotype'
  // Plans d'intervention
  | 'lire_plan_intervention'
  | 'modifier_plan_intervention'
  | 'creer_plan_intervention'
  | 'supprimer_plan_intervention'
  // Accréditations
  | 'lire_accreditation'
  | 'modifier_accreditation'
  | 'creer_accreditation'
  | 'supprimer_accreditation'
  // Actualités
  | 'lire_actualite'
  | 'modifier_actualite'
  | 'creer_actualite'
  | 'supprimer_actualite'
  // Fichiers
  | 'lire_fichier'
  | 'televerser_fichier'
  | 'supprimer_fichier'


// Liste exploitable côté UI (autocomplete) des permissions disponibles
export const PERMISSION_VALUES: PermissionEnum[] = [
  // Utilisateurs
  'lire_utilisateur',
  'modifier_utilisateur',
  'creer_utilisateur',
  'supprimer_utilisateur',
  'reinitialiser_mot_de_passe',
  'changer_mot_de_passe',
  // Permissions
  'lire_permission',
  'modifier_permission',
  'creer_permission',
  'supprimer_permission',
  // Rôles
  'lire_role',
  'modifier_role',
  'creer_role',
  'supprimer_role',
  // Formations
  'lire_formation',
  'modifier_formation',
  'creer_formation',
  'supprimer_formation',
  // Inscriptions
  'lire_inscription',
  'modifier_inscription',
  'creer_inscription',
  'supprimer_inscription',
  // Paiements
  'lire_paiement',
  'modifier_paiement',
  'creer_paiement',
  'supprimer_paiement',
  // Modules
  'lire_module',
  'modifier_module',
  'creer_module',
  'supprimer_module',
  // Ressources
  'lire_ressource',
  'modifier_ressource',
  'creer_ressource',
  'supprimer_ressource',
  // Chefs-d'oeuvre
  'lire_chef_d_oeuvre',
  'modifier_chef_d_oeuvre',
  'creer_chef_d_oeuvre',
  'supprimer_chef_d_oeuvre',
  // Projets collectifs
  'lire_projet_collectif',
  'modifier_projet_collectif',
  'creer_projet_collectif',
  'supprimer_projet_collectif',
  // Évaluations
  'lire_evaluation',
  'modifier_evaluation',
  'creer_evaluation',
  'supprimer_evaluation',
  // Questions
  'lire_question',
  'modifier_question',
  'creer_question',
  'supprimer_question',
  // Propositions
  'lire_proposition',
  'modifier_proposition',
  'creer_proposition',
  'supprimer_proposition',
  // Résultats d'évaluations
  'lire_resultat_evaluation',
  'modifier_resultat_evaluation',
  'creer_resultat_evaluation',
  'supprimer_resultat_evaluation',
  // Génotypes
  'lire_genotype',
  'modifier_genotype',
  'creer_genotype',
  'supprimer_genotype',
  // Ascendances
  'lire_ascendance_genotype',
  'modifier_ascendance_genotype',
  'creer_ascendance_genotype',
  'supprimer_ascendance_genotype',
  // Santé
  'lire_sante_genotype',
  'modifier_sante_genotype',
  'creer_sante_genotype',
  'supprimer_sante_genotype',
  // Éducation
  'lire_education_genotype',
  'modifier_education_genotype',
  'creer_education_genotype',
  'supprimer_education_genotype',
  // Plans d'intervention
  'lire_plan_intervention',
  'modifier_plan_intervention',
  'creer_plan_intervention',
  'supprimer_plan_intervention',
  // Accréditations
  'lire_accreditation',
  'modifier_accreditation',
  'creer_accreditation',
  'supprimer_accreditation',
  // Actualités
  'lire_actualite',
  'modifier_actualite',
  'creer_actualite',
  'supprimer_actualite',
  // Fichiers
  'lire_fichier',
  'televerser_fichier',
  'supprimer_fichier',
]

export type RoleEnum = 'admin' | 'coordonnateur' | 'formateur' | 'referent' | 'apprenant'

export type SexeEnum = 'homme' | 'femme' | 'autre'

export type EvaluationTypeEnum = 'qcm' | 'ouverte' | 'pratique'

export type FileTypeEnum = 'document' | 'image' | 'audio' | 'video'

export type StatutCompteEnum = 'actif' | 'inactif' | 'supprimer'

export type StatutFormationEnum = 'En attente' | 'Planifiée' | 'En cours' | 'En pause' | 'Terminée' | 'Annulée' | 'Archivée' | 'Rejetée'

export type StatutInscriptionEnum = 'En cours' | 'termine'

export type StatutProjetCollectifEnum = 'En attente' | 'Planifiée' | 'En cours' | 'En pause' | 'Terminée' | 'Annulée' | 'Archivée'

export type StatutProjetIndividuelEnum = 'En cours' | 'termine' | 'abandon' | 'En correction'

export type MethodePaiementEnum = 'CARTE_BANCAIRE' | 'MOBILE_MONEY' | 'VIREMENT_BANCAIRE' | 'ESPECES' | 'PESUPAY'

export type StatutPaiementEnum = 'Versement partiel' | 'Aucun versement' | 'Terminé'

export type StatutPaiemmentFraisFormationEnum = 'Planifiée' | 'En cours' | 'Terminée'

export type StatutEnum = 'Planifiée' | 'En cours' | 'Terminée'

export type GenotypeTypeEnum = 'detenu' | 'proche'
