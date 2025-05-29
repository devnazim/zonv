import { z, SomeZodObject } from 'zod';
export declare const getConfig: <S extends SomeZodObject>({ schema, configPath, secretsPath, env, }: {
    schema: S;
    configPath?: string | string[];
    secretsPath?: string | string[];
    env?: string;
}) => z.infer<S>;
//# sourceMappingURL=config.d.ts.map