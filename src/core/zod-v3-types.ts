/** Structural subset of a Zod v3 object schema used by zonv/v3. */
export interface ZodV3ObjectLike {
  parse: (data: unknown) => unknown;
  shape: Record<string, unknown>;
  keyof?: () => { Values: Record<string, unknown> };
  _output: unknown;
}

/** Infers the output type from a Zod v3-compatible schema. */
export type InferZodV3Output<S> = S extends { _output: infer Output } ? Output : never;
