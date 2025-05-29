"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigFromEnv = void 0;
const zod_1 = require("zod");
const lodash_set_1 = __importDefault(require("lodash.set"));
const getPropertiesPathsFromSchema_js_1 = require("./utils/getPropertiesPathsFromSchema.js");
const get_1 = require("./utils/get");
const getConfigFromEnv = ({ schema }) => {
    const config = {};
    const propertiesPaths = (0, getPropertiesPathsFromSchema_js_1.getPropertiesPathsFromSchema)(schema);
    for (const path of propertiesPaths) {
        try {
            const envValue = process.env[path.split('.').join('___')];
            if (envValue) {
                const schemaProp = (0, get_1.get)(schema.shape, path);
                const v = schemaProp instanceof zod_1.ZodObject || schemaProp instanceof zod_1.ZodArray ? JSON.parse(envValue) : envValue;
                (0, lodash_set_1.default)(config, path, v);
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    return schema.parse(config);
};
exports.getConfigFromEnv = getConfigFromEnv;
