// Services génériques pour consommer n'importe quel endpoint REST (GET, POST, PUT, PATCH, DELETE)
// Fournit aussi des helpers paginés (skip/limit) et des méthodes CRUD typées

import type { Query } from '../apiClient';
import apiClient from '../apiClient';
import type {
  AccreditationCreate,
  Accreditation as AccreditationT,
  AccreditationUpdate,
  ActualiteCreate,
  Actualite as ActualiteT,
  ActualiteUpdate,
  AscendanceGenotypeCreate, AscendanceGenotypeUpdate,
  AscendanceGenotype as AscendanceT,
  ChefDOeuvreLight,
  EducationGenotypeCreate, EducationGenotypeUpdate,
  EducationGenotype as EducationT,
  EvaluationCreate,
  Evaluation as EvaluationT,
  EvaluationUpdate,
  Formation, FormationCreate, FormationUpdate,
  GenotypeIndividuelCreate, GenotypeIndividuelUpdate,
  GenotypeIndividuel as GenotypeT,
  InscriptionFormationCreate, InscriptionFormationUpdate,
  InscriptionFormation as InscriptionT,
  ModuleCreate,
  Module as ModuleT,
  ModuleUpdate,
  PaiementCreate,
  Paiement as PaiementT,
  PaiementUpdate,
  Permission, PermissionCreate, PermissionUpdate,
  PlanInterventionIndividualiseCreate, PlanInterventionIndividualiseUpdate,
  PlanInterventionIndividualise as PlanT,
  ProjetCollectifLight as ProjetT,
  PropositionCreate,
  Proposition as PropositionT,
  PropositionUpdate,
  QuestionCreate,
  Question as QuestionT,
  QuestionUpdate,
  RessourceCreate,
  Ressource as RessourceT,
  RessourceUpdate,
  ResultatEvaluationCreate, ResultatEvaluationUpdate,
  ResultatEvaluation as ResultatT,
  Role, RoleCreate, RoleUpdate,
  SanteGenotypeCreate, SanteGenotypeUpdate,
  SanteGenotype as SanteT,
  Utilisateur, UtilisateurCreate, UtilisateurUpdate
} from '../types/models';

export interface PageQuery extends Query { skip?: number; limit?: number }

export function createRestService<T, TCreate = Partial<T>, TUpdate = Partial<T>>(base: string) {
  return {
    list: (query?: PageQuery) => apiClient.get<T[]>(base, query),
    get: (id: string | number, query?: Query) => apiClient.get<T>(`${base}/${id}`, query),
    create: (payload: TCreate, query?: Query) => apiClient.post<T, TCreate>(base, payload, query),
    update: (id: string | number, payload: TUpdate, query?: Query) => apiClient.put<T, TUpdate>(`${base}/${id}`, payload, query),
    patch: (id: string | number, payload: Partial<TUpdate>, query?: Query) => apiClient.patch<T, Partial<TUpdate>>(`${base}/${id}`, payload, query),
    remove: (id: string | number, query?: Query) => apiClient.delete<{ success: boolean }>(`${base}/${id}`, query),
  }
}

// ---------------------- Services typés alignés au backend ----------------------
export const UsersApi = {
  ...createRestService<Utilisateur, UtilisateurCreate, UtilisateurUpdate>('/users'),
  changeStatus: (userId: number, statut: string) => apiClient.put<Utilisateur>(`/users/${userId}/status`, undefined, { statut }),
  assignPermissions: (userId: number, permission_ids: number[]) => apiClient.post<string, { permission_ids: number[] }>(`/users/${userId}/assign-permissions`, { permission_ids }),
  revokePermissions: (userId: number, permission_ids: number[]) => apiClient.post<string, { permission_ids: number[] }>(`/users/${userId}/revoke-permissions`, { permission_ids }),
  me: (token: string) => apiClient.get<Utilisateur>(`/users/me`, { token }),
}

export const RolesApi = {
  ...createRestService<Role, RoleCreate, RoleUpdate>('/roles'),
  assignPermissions: (roleId: number, permission_ids: number[]) => apiClient.post<string, { permission_ids: number[] }>(`/roles/${roleId}/assign-permissions`, { permission_ids }),
  revokePermissions: (roleId: number, permission_ids: number[]) => apiClient.post<string, { permission_ids: number[] }>(`/roles/${roleId}/revoke-permissions`, { permission_ids }),
}

export const PermissionsApi = {
  ...createRestService<Permission, PermissionCreate, PermissionUpdate>('/permissions'),
  initAll: () => apiClient.post<string, Record<string, never>>('/permissions/init-all', {}),
}

export const FormationsApi = {
  ...createRestService<Formation, FormationCreate, FormationUpdate>('/formations'),
  modules: (formationId: number, query?: PageQuery) => apiClient.get<ModuleT[]>(`/formations/${formationId}/modules`, query),
}

export const ModulesApi = createRestService<ModuleT, ModuleCreate, ModuleUpdate>('/modules')
export const RessourcesApi = createRestService<RessourceT, RessourceCreate, RessourceUpdate>('/ressources')
export const EvaluationsApi = createRestService<EvaluationT, EvaluationCreate, EvaluationUpdate>('/evaluations')
export const QuestionsApi = createRestService<QuestionT, QuestionCreate, QuestionUpdate>('/questions')
export const PropositionsApi = createRestService<PropositionT, PropositionCreate, PropositionUpdate>('/propositions')
export const ResultatsApi = createRestService<ResultatT, ResultatEvaluationCreate, ResultatEvaluationUpdate>('/resultats-evaluations')
export const InscriptionsApi = createRestService<InscriptionT, InscriptionFormationCreate, InscriptionFormationUpdate>('/inscriptions')
export const PaiementsApi = createRestService<PaiementT, PaiementCreate, PaiementUpdate>('/paiements')
export const ChefsDoeuvreApi = createRestService<ChefDOeuvreLight, any, any>('/chefs-d-oeuvre')
export const ProjetsCollectifsApi = createRestService<ProjetT, Partial<ProjetT>, Partial<ProjetT>>('/projets-collectifs')
export const GenotypesApi = createRestService<GenotypeT, GenotypeIndividuelCreate, GenotypeIndividuelUpdate>('/genotypes')
export const AscendancesApi = createRestService<AscendanceT, AscendanceGenotypeCreate, AscendanceGenotypeUpdate>('/ascendances-genotypes')
export const SanteGenotypeApi = createRestService<SanteT, SanteGenotypeCreate, SanteGenotypeUpdate>('/santes-genotypes')
export const EducationGenotypeApi = createRestService<EducationT, EducationGenotypeCreate, EducationGenotypeUpdate>('/educations-genotypes')
export const PlansInterventionApi = createRestService<PlanT, PlanInterventionIndividualiseCreate, PlanInterventionIndividualiseUpdate>('/plans-intervention')
export const AccreditationsApi = createRestService<AccreditationT, AccreditationCreate, AccreditationUpdate>('/accreditations')
export const ActualitesApi = createRestService<ActualiteT, ActualiteCreate, ActualiteUpdate>('/actualites')

// ---------------------- Auth endpoints ----------------------
export const AuthApi = {
  login: (body: { email: string; password: string }) => apiClient.post<{ access_token: string; token_type: string }, typeof body>('/login', body),
  changePassword: (body: { email: string; old_password: string; new_password: string }) => apiClient.post<{ message: string }, typeof body>('/users/change-password', body),
  resetPasswordRequest: (body: { email: string }) => apiClient.post<{ message: string }, typeof body>('/reset-password-request', body),
  resetPasswordConfirm: (query: { token: string; new_password: string }) => apiClient.get<{ message: string }>('/reset-password-confirm', query),
}

