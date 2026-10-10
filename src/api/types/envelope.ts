export type ApiEnvelope<T> = {
  message: string;
  data: T;
};

export function unwrap<T>(envelope: ApiEnvelope<T>): T {
  return envelope.data;
}
