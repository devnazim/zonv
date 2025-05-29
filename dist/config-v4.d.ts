import { z, ZodObject } from 'zod/v4';
export declare const getConfig: <S extends ZodObject>({ schema, configPath, secretsPath, env, }: {
    schema: S;
    configPath?: string | string[];
    secretsPath?: string | string[];
    env?: string;
}) => z.infer<S>;
//# sourceMappingURL=config-v4.d.ts.map