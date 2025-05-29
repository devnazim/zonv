"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileContent = void 0;
const node_fs_1 = require("node:fs");
const getFileContent = (path) => {
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
};
exports.getFileContent = getFileContent;
