import type {
    EvaluationTypeEnum, FileTypeEnum, GenotypeTypeEnum, MethodePaiementEnum,
    PermissionEnum,
    RoleEnum, SexeEnum, StatutCompteEnum,
    StatutFormationEnum,
    StatutPaiementEnum
} from './enums';

// Light interfaces
export interface PermissionMinLight { id: number; nom: PermissionEnum }
export interface PermissionLight { id: number; nom: PermissionEnum; roles: RoleLight[] }
export interface RoleLight { id: number; nom: RoleEnum; permissions?: PermissionMinLight[] }
export interface UtilisateurLight { id: number; nom: string; prenom?: string | null; sexe: SexeEnum; email: string; statut: StatutCompteEnum; est_actif: boolean; date_naissance?: string | null; created_at: string; updated_at: string; role?: RoleLight | null; permissions: PermissionLight[] }

export interface UtilisateurMinLight { id: number; nom: string; prenom?: string | null; sexe: SexeEnum; email: string }

export interface FormationLight { id: number; titre: string }
export interface ModuleLight { id: number; titre: string }
export interface RessourceLight { id: number; titre: string; type: FileTypeEnum }
export interface EvaluationLight { id: number; titre: string }
export interface QuestionLight { id: number; type: EvaluationTypeEnum }
export interface PropositionLight { id: number; texte: string; est_correcte: boolean }
export interface ResultatEvaluationLight { id: number; note?: number | null }
export interface InscriptionFormationLight { id: number }
export interface ChefDOeuvreLight { id: number; titre?: string }
export interface ProjetCollectifLight { id: number; titre?: string }
export interface GenotypeIndividuelLight { id: number; type: GenotypeTypeEnum }
export interface PlanInterventionIndividualiseLight { id: number }
export interface AccreditationLight { id: number; titre?: string }
export interface ActualiteLight { id: number; titre?: string }
export interface PaiementLight { id: number; montant: number; methode: MethodePaiementEnum; statut: StatutPaiementEnum }

// Full interfaces (extraits principaux)
export interface Utilisateur {
  id: number
  nom: string
  prenom?: string | null
  sexe: SexeEnum
  email: string
  password?: string
  statut: StatutCompteEnum
  est_actif: boolean
  last_password_change?: string | null
  date_naissance?: string | null
  created_at: string
  updated_at: string
  role?: RoleLight | null
  permissions: PermissionLight[]
  inscriptions: InscriptionFormationLight[]
  genotypes: GenotypeIndividuelLight[]
  plans_intervention: PlanInterventionIndividualiseLight[]
  actualites: ActualiteLight[]
  accreditations: AccreditationLight[]
}

export interface UtilisateurCreate {
  nom: string
  prenom?: string | null
  sexe: SexeEnum
  email: string
  role_name: RoleEnum
}
export interface UtilisateurUpdate {
  nom?: string
  prenom?: string | null
  sexe?: SexeEnum
  email?: string
  password?: string
  role_id?: number
  est_actif?: boolean
  statut?: StatutCompteEnum
  date_naissance?: string | null
  permission_ids?: number[]
}

export interface Permission { id: number; nom: PermissionEnum; description?: string }
export interface PermissionCreate { nom: PermissionEnum }
export interface PermissionUpdate { nom?: PermissionEnum }

export interface Role { id: number; nom: RoleEnum; permissions: PermissionMinLight[]; user_count?: number }
export interface RoleCreate { nom: RoleEnum; permission_ids?: number[] }
export interface RoleUpdate { nom?: RoleEnum; permission_ids?: number[] }

export interface Formation {
  id: number
  titre: string
  photo_couverture: string
  description?: string | null
  specialite: string
  duree_mois: number
  statut: StatutFormationEnum
  frais: number
  date_debut: string
  date_fin: string
  created_at: string
  updated_at: string
  modules: ModuleLight[]
  inscriptions: InscriptionFormationLight[]
  projets_collectifs: ProjetCollectifLight[]
  accreditations: AccreditationLight[]
}
export interface FormationCreate {
  titre: string
  photo_couverture: string
  description?: string | null
  specialite: string
  duree_mois: number
  statut: StatutFormationEnum
  frais: number
  date_debut: string
  date_fin: string
}
export interface FormationUpdate extends Partial<FormationCreate> {}

export interface Module {
  id: number
  titre: string
  photo_couverture: string
  description?: string | null
  ordre: number
  formation: FormationLight
  ressources: RessourceLight[]
  evaluations: EvaluationLight[]
  chefs_d_oeuvre: ChefDOeuvreLight[]
}
export interface ModuleCreate {
  titre: string
  photo_couverture: string
  description?: string | null
  formation_id: number
}
export interface ModuleUpdate extends Partial<ModuleCreate> { ordre?: number }

export interface Ressource {
  id: number
  titre: string
  type: FileTypeEnum
  contenu?: string | null
  lien?: string | null
  ordre: number
  module: ModuleLight
}
export interface RessourceCreate {
  titre: string
  type: FileTypeEnum
  contenu?: string | null
  lien?: string | null
  ordre?: number
  module_id: number
}
export interface RessourceUpdate extends Partial<RessourceCreate> {}

export interface Evaluation { id: number; titre: string; module: ModuleLight }
export interface EvaluationCreate { titre: string; module_id: number }
export interface EvaluationUpdate extends Partial<EvaluationCreate> {}

export interface Question { id: number; type: EvaluationTypeEnum; contenu: string; evaluation: EvaluationLight }
export interface QuestionCreate { type: EvaluationTypeEnum; contenu: string; evaluation_id: number }
export interface QuestionUpdate extends Partial<QuestionCreate> {}

export interface Proposition { id: number; texte: string; est_correcte: boolean; question: QuestionLight }
export interface PropositionCreate { texte: string; est_correcte?: boolean; question_id: number }
export interface PropositionUpdate extends Partial<PropositionCreate> {}

export interface ResultatEvaluation {
  id: number
  utilisateur: UtilisateurLight
  evaluation: EvaluationLight
  note?: number | null
  date_soumission?: string | null
  commentaires?: string | null
}
export interface ResultatEvaluationCreate { utilisateur_id: number; evaluation_id: number; note?: number | null }
export interface ResultatEvaluationUpdate extends Partial<ResultatEvaluationCreate> {}

export interface GenotypeIndividuel {
  id: number
  type: GenotypeTypeEnum
  utilisateur_id: number
  nom: string
  prenom?: string | null
  age?: number | null
  sexe?: SexeEnum | null
  motif_detention?: string | null
  date_debut_detention?: string | null
  duree_detention?: string | null
  pays_detention?: string | null
  maison_detention?: string | null
}
export interface GenotypeIndividuelCreate extends Omit<GenotypeIndividuel, 'id'> {}
export interface GenotypeIndividuelUpdate extends Partial<GenotypeIndividuelCreate> {}

export interface AscendanceGenotype { id: number; utilisateur_id: number; parents?: string | null }
export interface AscendanceGenotypeCreate extends Omit<AscendanceGenotype, 'id'> {}
export interface AscendanceGenotypeUpdate extends Partial<AscendanceGenotypeCreate> {}

export interface SanteGenotype { id: number; utilisateur_id: number; resume?: string | null }
export interface SanteGenotypeCreate extends Omit<SanteGenotype, 'id'> {}
export interface SanteGenotypeUpdate extends Partial<SanteGenotypeCreate> {}

export interface EducationGenotype { id: number; utilisateur_id: number; niveau?: string | null }
export interface EducationGenotypeCreate extends Omit<EducationGenotype, 'id'> {}
export interface EducationGenotypeUpdate extends Partial<EducationGenotypeCreate> {}

export interface PlanInterventionIndividualise { id: number; utilisateur_id: number; contenu?: string | null }
export interface PlanInterventionIndividualiseCreate extends Omit<PlanInterventionIndividualise, 'id'> {}
export interface PlanInterventionIndividualiseUpdate extends Partial<PlanInterventionIndividualiseCreate> {}

export interface Accreditation { id: number; titre: string; description?: string | null }
export interface AccreditationCreate { titre: string; description?: string | null }
export interface AccreditationUpdate extends Partial<AccreditationCreate> {}

export interface Actualite { id: number; titre: string; contenu?: string | null }
export interface ActualiteCreate { titre: string; contenu?: string | null }
export interface ActualiteUpdate extends Partial<ActualiteCreate> {}

export interface InscriptionFormation { id: number; utilisateur: UtilisateurLight; formation: FormationLight }
export interface InscriptionFormationCreate { utilisateur_id: number; formation_id: number }
export interface InscriptionFormationUpdate extends Partial<InscriptionFormationCreate> {}

export interface Paiement {
  id: number
  utilisateur: UtilisateurMinLight
  formation: FormationLight
  montant: number
  methode: MethodePaiementEnum
  statut: StatutPaiementEnum
}
export interface PaiementCreate { utilisateur_id: number; formation_id: number; montant: number; methode: MethodePaiementEnum }
export interface PaiementUpdate extends Partial<PaiementCreate> { statut?: StatutPaiementEnum }

