"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertiesPathsFromSchema = void 0;
const zod_1 = require("zod");
const getPropertiesPathsFromSchema = (schema) => {
    const paths = [];
    const getPaths = (obj, prefix = []) => {
        const keys = obj instanceof zod_1.ZodObject ? Object.keys(obj.keyof().Values) : [];
        for (const key of keys) {
            paths.push([...prefix, key].join('.'));
            if (obj.shape[key] instanceof zod_1.ZodObject) {
                getPaths(obj.shape[key], [...prefix, key]);
            }
        }
    };
    getPaths(schema);
    return paths;
};
exports.getPropertiesPathsFromSchema = getPropertiesPathsFromSchema;
