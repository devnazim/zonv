"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = void 0;
const get = (obj, path) => {
    if (typeof obj !== 'object' || !path) {
        return undefined;
    }
    let currValue = obj;
    const paths = Array.isArray(path) ? path : path.split('.');
    for (const prop of paths) {
        currValue = currValue === null || currValue === void 0 ? void 0 : currValue[prop];
    }
    return currValue;
};
exports.get = get;
