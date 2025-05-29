"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertiesPathsFromSchema = void 0;
const v4_1 = require("zod/v4");
const getPropertiesPathsFromSchema = (schema) => {
    const paths = [];
    const getPaths = (obj, prefix = []) => {
        const keys = obj instanceof v4_1.ZodObject ? obj.keyof().options : [];
        for (const key of keys) {
            paths.push([...prefix, key].join('.'));
            if (obj.shape[key] instanceof v4_1.ZodObject) {
                getPaths(obj.shape[key], [...prefix, key]);
            }
        }
    };
    getPaths(schema);
    return paths;
};
exports.getPropertiesPathsFromSchema = getPropertiesPathsFromSchema;
