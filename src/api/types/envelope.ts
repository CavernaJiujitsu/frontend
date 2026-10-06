export type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

export function unwrap<T>(envelope: ApiEnvelope<T>): T {
  return envelope.data;
}
