"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.getZonfig = exports.getPaths = void 0;
var node_path_1 = require("node:path");
var node_process_1 = require("node:process");
var node_fs_1 = require("node:fs");
var zod_1 = require("zod");
var merge_1 = require("lodash/merge");
var set_1 = require("lodash/set");
var get_1 = require("lodash/get");
function getFileContent(path) {
    var fileContent;
    try {
        fileContent = node_fs_1.readFileSync(path, { encoding: 'utf-8' });
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
var buildArrayFromString = function (str) {
    var regex = /\s+|,\s*/gm;
    return str.split(regex);
};
exports.getPaths = function (_a) {
    var type = _a.type, path = _a.path, env = _a.env;
    var pathArr = [];
    if (Array.isArray(path) && path.length) {
        pathArr.push.apply(pathArr, path);
    }
    else if (typeof path === 'string' && path.length) {
        pathArr.push.apply(pathArr, buildArrayFromString(path));
    }
    else {
        pathArr.push(node_path_1.resolve(node_process_1.cwd(), "./" + type + "/" + (env ? env + "." : '') + type + ".json"));
    }
    return pathArr.filter(function (p) { return p.trim().length > 0; });
};
var getPropertiesPathsFromSchema = function (schema) {
    var paths = [];
    var getPaths = function (obj, prefix) {
        if (prefix === void 0) { prefix = []; }
        var keys = obj instanceof zod_1.ZodObject ? Object.keys(obj.keyof().Values) : [];
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            paths.push(__spreadArrays(prefix, [key]).join('.'));
            if (obj.shape[key] instanceof zod_1.ZodObject) {
                getPaths(obj.shape[key], __spreadArrays(prefix, [key]));
            }
        }
    };
    getPaths(schema);
    return paths;
};
exports.getZonfig = function (_a) {
    var schema = _a.schema, configPath = _a.configPath, secretsPath = _a.secretsPath, zonfigENV = _a.zonfigENV;
    var config = {};
    var filePaths = __spreadArrays(exports.getPaths({ type: 'config', path: configPath, env: zonfigENV }), exports.getPaths({ type: 'secrets', path: secretsPath, env: zonfigENV }));
    for (var _i = 0, filePaths_1 = filePaths; _i < filePaths_1.length; _i++) {
        var path = filePaths_1[_i];
        merge_1["default"](config, getFileContent(path));
    }
    var propertiesPaths = getPropertiesPathsFromSchema(schema);
    for (var _b = 0, propertiesPaths_1 = propertiesPaths; _b < propertiesPaths_1.length; _b++) {
        var path = propertiesPaths_1[_b];
        try {
            var envValue = process.env[path];
            if (envValue) {
                var schemaProp = get_1["default"](schema.shape, path);
                var v = schemaProp instanceof zod_1.ZodObject || schemaProp instanceof zod_1.ZodArray ? JSON.parse(envValue) : envValue;
                set_1["default"](config, path, v);
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    return schema.parse(config);
};
