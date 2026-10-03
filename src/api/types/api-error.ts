import { z } from "zod";

export const ErrorTypeSchema = z.enum([
  "VALIDATION",
  "DUPLICATE_RESOURCE",
  "CONFLICT",
  "NOT_FOUND",
  "AUTH",
  "FORBIDDEN",
  "RATE_LIMIT",
  "SERVER_ERROR",
]);

export type ErrorType = z.infer<typeof ErrorTypeSchema>;

export const ErrorDomainSchema = z.enum([
  "auth",
  "profile",
  "gym",
  "schedule",
  "client",
  "server",
]);

export type ErrorDomain = z.infer<typeof ErrorDomainSchema>;

export const ErrorDetailSchema = z.object({
  field: z.string().optional(),
  code: z.string(),
  message: z.string().optional(),
});

export type ErrorDetail = z.infer<typeof ErrorDetailSchema>;

export const BackendErrorDescriptionSchema = z.object({
  internalCode: z.string().min(1),
  message: z.string(),
  domain: z.string(),
  field: z.string().nullable().optional(),
  params: z.record(z.string(), z.unknown()).optional(),
  details: z.array(ErrorDetailSchema).optional(),
  traceId: z.string().optional(),
});

export type BackendErrorDescription = z.infer<
  typeof BackendErrorDescriptionSchema
>;

export const BackendErrorSchema = z.object({
  errorType: z.string().min(1),
  errorDescription: BackendErrorDescriptionSchema,
});

export type BackendError = z.infer<typeof BackendErrorSchema>;

export type AppError = {
  status?: number;
  errorType: string;
  internalCode: string;
  domain: string;
  field?: string | null;
  params?: Record<string, unknown>;
  details?: ErrorDetail[];
  traceId?: string;
  fallbackMessage?: string;
};

export const KNOWN_INTERNAL_CODES = [
  "VALIDATION_FAILED",
  "RESOURCE_NOT_FOUND",
  "CAVERNA_ALREADY_EXISTS",
  "SCHEDULE_CONFLICT",
  "CLASS_FULL",
  "DUPLICATE_SUBSCRIPTION",
  "INVALID_CREDENTIALS",
  "TOKEN_EXPIRED",
  "FORBIDDEN",
  "RATE_LIMITED",
  "SERVER_ERROR",
  "SERVICE_UNAVAILABLE",
  "OFFLINE",
  "TIMEOUT",
  "UNKNOWN",
] as const;

export type KnownInternalCode = (typeof KNOWN_INTERNAL_CODES)[number];
