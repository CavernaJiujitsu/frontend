export const API_PREFIX = "/api/v1";

export const routes = {
  login: `${API_PREFIX}/auth/login`,
  passwordRecoveryRequest: `${API_PREFIX}/auth/password-recovery/request`,
  practitioners: `${API_PREFIX}/practitioners`,
  practitionerTrail: `${API_PREFIX}/practitioners/me/trail`,
  profileMe: `${API_PREFIX}/profiles/me`,
  profilePhoto: `${API_PREFIX}/profiles/me/photo`,
  practitioner: (practitionerId: string) =>
    `${API_PREFIX}/practitioners/${practitionerId}`,
  practitionerOrigin: (practitionerId: string) =>
    `${API_PREFIX}/practitioners/${practitionerId}/origin`,
  belts: `${API_PREFIX}/belts`,
  certificatesUpload: `${API_PREFIX}/certificates/upload`,
  certificates: `${API_PREFIX}/certificates`,
  beltValidations: `${API_PREFIX}/belt-validations`,
  caves: `${API_PREFIX}/caves`,
  classes: `${API_PREFIX}/classes`,
  practitionerHome: (practitionerId: string) =>
    `${API_PREFIX}/practitioners/${practitionerId}/home`,
  authLogin: `${API_PREFIX}/auth/login`,
} as const;
