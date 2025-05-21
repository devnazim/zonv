import { z } from 'zod';
export declare const getPaths: ({ type, path, env }: {
    type: "config" | "secrets";
    path?: string[] | string;
    env?: string;
}) => string[];
type ZodObjectType = z.SomeZodObject;
export declare const getConfig: <S extends ZodObjectType>({ schema, configPath, secretsPath, env, }: {
    schema: S;
    configPath?: string | string[];
    secretsPath?: string | string[];
    env?: string;
}) => z.infer<S>;
export {};
//# sourceMappingURL=config.d.ts.map