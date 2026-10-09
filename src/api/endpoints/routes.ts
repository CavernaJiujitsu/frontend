export const API_PREFIX = "/api/v1";

export const routes = {
  practitioners: `${API_PREFIX}/practitioners`,
  belts: `${API_PREFIX}/belts`,
  certificatesUpload: `${API_PREFIX}/certificates/upload`,
  beltValidations: `${API_PREFIX}/belt-validations`,
  caves: `${API_PREFIX}/caves`,
  classes: `${API_PREFIX}/classes`,
} as const;
