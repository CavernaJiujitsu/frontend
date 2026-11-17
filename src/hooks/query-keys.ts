// Query keys of the student area. Every personal key starts with the
// practitioner id, so a cached answer of one account is never served to the
// next account that logs in on the same device.

type Id = string | null;

export const studentKeys = {
  all: (practitionerId: Id) => ["student", practitionerId] as const,
  profile: (practitionerId: Id) => ["student", practitionerId, "profile-me"] as const,
  practitioner: (practitionerId: Id) =>
    ["student", practitionerId, "practitioner"] as const,
  /** Prefix of every home summary of the account (any coordinates). */
  homeAll: (practitionerId: Id) => ["student", practitionerId, "home-summary"] as const,
  home: (practitionerId: Id, latitude?: number, longitude?: number) =>
    ["student", practitionerId, "home-summary", latitude ?? null, longitude ?? null] as const,
  trail: (practitionerId: Id) => ["student", practitionerId, "trail"] as const,
  photo: (practitionerId: Id) => ["student", practitionerId, "profile-photo"] as const,
};
