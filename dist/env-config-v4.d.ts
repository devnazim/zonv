import { z, ZodObject } from 'zod/v4';
export declare const getConfigFromEnv: <S extends ZodObject>({ schema }: {
    schema: S;
}) => z.infer<S>;
