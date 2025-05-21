"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = exports.getPaths = void 0;
const node_path_1 = require("node:path");
const node_process_1 = require("node:process");
const node_fs_1 = require("node:fs");
const zod_1 = require("zod");
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const lodash_set_1 = __importDefault(require("lodash.set"));
const lodash_get_1 = __importDefault(require("lodash.get"));
function getFileContent(path) {
    let fileContent;
    try {
        fileContent = (0, node_fs_1.readFileSync)(path, { encoding: 'utf-8' });
    }
    catch (e) {
        // * NOTE: readFileSync throws error with Type NodeJS.ErrnoException
        // eslint-disable-next-line no-undef
        if (e.code !== 'ENOENT') {
            // eslint-disable-next-line no-console
            console.error(e);
            throw e;
        }
        else {
            return {};
        }
    }
    if (fileContent) {
        return JSON.parse(fileContent);
    }
}
const buildArrayFromString = (str) => {
    const regex = /\s+|,\s*/gm;
    return str.split(regex);
};
const getPaths = ({ type, path, env }) => {
    const pathArr = [];
    if (Array.isArray(path) && path.length) {
        pathArr.push(...path);
    }
    else if (typeof path === 'string' && path.length) {
        pathArr.push(...buildArrayFromString(path));
    }
    else {
        pathArr.push((0, node_path_1.resolve)((0, node_process_1.cwd)(), `./${type}/${env ? `${env}.` : ''}${type}.json`));
    }
    return pathArr.filter((p) => p.trim().length > 0);
};
exports.getPaths = getPaths;
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
const getConfig = ({ schema, configPath, secretsPath, env, }) => {
    const config = {};
    const filePaths = [...(0, exports.getPaths)({ type: 'config', path: configPath, env }), ...(0, exports.getPaths)({ type: 'secrets', path: secretsPath, env })];
    for (const path of filePaths) {
        (0, lodash_merge_1.default)(config, getFileContent(path));
    }
    const propertiesPaths = getPropertiesPathsFromSchema(schema);
    for (const path of propertiesPaths) {
        try {
            const envValue = process.env[path.split('.').join('_')];
            if (envValue) {
                const schemaProp = (0, lodash_get_1.default)(schema.shape, path);
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
exports.getConfig = getConfig;
