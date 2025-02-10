import { z, ZodObject } from 'zod';
export declare const getPaths: ({ type, path, env }: {
    type: "config" | "secrets";
    path?: string[] | string;
    env?: string;
}) => string[];
export declare const getConfig: <S extends ZodObject<any, any, z.ZodTypeAny, any, any>>({ schema, configPath, secretsPath, env, }: {
    schema: S;
    configPath?: string | string[];
    secretsPath?: string | string[];
    env?: string;
}) => z.infer<S>;
//# sourceMappingURL=config.d.ts.map