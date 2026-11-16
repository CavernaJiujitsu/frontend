export const API_PREFIX = "/api/v1";

export const routes = {
  mobileLogin: `${API_PREFIX}/mobile/auth/login`,
  passwordRecoveryRequest: `${API_PREFIX}/auth/password-recovery/request`,
  passwordRecoveryReset: `${API_PREFIX}/auth/password-recovery/reset`,
  practitioners: `${API_PREFIX}/practitioners`,
  profileReadonlyMe: `${API_PREFIX}/profile-readonly/me`,
  profileReadonlyHome: `${API_PREFIX}/profile-readonly/home`,
  profileReadonlyGraduations: `${API_PREFIX}/profile-readonly/graduations`,
  profileReadonlyTrail: `${API_PREFIX}/profile-readonly/trail`,
  profileReadonlyDashboard: `${API_PREFIX}/profile-readonly/dashboard`,
  profileMe: `${API_PREFIX}/profiles/me`,
  profilePhoto: `${API_PREFIX}/profiles/me/photo`,
  practitioner: (practitionerId: string) =>
    `${API_PREFIX}/practitioners/${practitionerId}`,
  belts: `${API_PREFIX}/belts`,
  certificatesUpload: `${API_PREFIX}/certificates/upload`,
  graduationCertificates: `${API_PREFIX}/graduations/certificates`,
  beltValidations: `${API_PREFIX}/belt-validations`,
  graduationBeltValidations: `${API_PREFIX}/graduations/belt-validations`,
  graduationClasses: `${API_PREFIX}/graduations/classes/graduation`,
  trainingSchedules: `${API_PREFIX}/training/schedules`,
  workouts: `${API_PREFIX}/mobile/workouts`,
  caves: `${API_PREFIX}/caves`,
  classes: `${API_PREFIX}/classes`,
} as const;
