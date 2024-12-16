import { z, ZodObject } from 'zod';
export declare const getPaths: ({ type, path, env }: {
    type: "config" | "secrets";
    path?: string[] | string;
    env?: string;
}) => string[];
export declare const getZonfig: <S extends ZodObject<any, any, z.ZodTypeAny, any, any>>({ schema, configPath, secretsPath, zonfigENV, }: {
    schema: S;
    configPath?: string | string[];
    secretsPath?: string | string[];
    zonfigENV?: string;
}) => z.infer<S>;
//# sourceMappingURL=config.d.ts.map