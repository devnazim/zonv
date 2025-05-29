import { z, SomeZodObject } from 'zod';
export declare const getConfigFromEnv: <S extends SomeZodObject>({ schema }: {
    schema: S;
}) => z.infer<S>;
//# sourceMappingURL=env-config.d.ts.map