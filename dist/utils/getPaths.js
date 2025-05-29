"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaths = void 0;
const node_path_1 = require("node:path");
const node_process_1 = require("node:process");
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
