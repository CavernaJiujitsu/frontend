export const API_PREFIX = "/api/v1";

export const routes = {
  mobileLogin: `${API_PREFIX}/mobile/auth/login`,
  passwordRecoveryRequest: `${API_PREFIX}/auth/password-recovery/request`,
  passwordRecoveryReset: `${API_PREFIX}/auth/password-recovery/reset`,
  practitioners: `${API_PREFIX}/practitioners`,
  profileReadonlyMe: `${API_PREFIX}/profile-readonly/me`,
  profileReadonlyHome: `${API_PREFIX}/profile-readonly/home`,
  profileReadonlyTrail: `${API_PREFIX}/profile-readonly/trail`,
  profileMe: `${API_PREFIX}/profiles/me`,
  profilePhoto: `${API_PREFIX}/profiles/me/photo`,
  practitioner: (practitionerId: string) =>
    `${API_PREFIX}/practitioners/${practitionerId}`,
  belts: `${API_PREFIX}/belts`,
  certificatesUpload: `${API_PREFIX}/certificates/upload`,
  beltValidations: `${API_PREFIX}/belt-validations`,
  caves: `${API_PREFIX}/caves`,
  classes: `${API_PREFIX}/classes`,
  teachers: `${API_PREFIX}/teachers`,
} as const;
