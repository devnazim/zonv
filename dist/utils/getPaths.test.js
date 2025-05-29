"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = require("node:test");
const node_process_1 = require("node:process");
const node_path_1 = require("node:path");
const getPaths_js_1 = require("./getPaths.js");
(0, node_test_1.describe)('get config paths', () => {
    (0, node_test_1.it)('use default value: ', () => {
        const configPaths = (0, getPaths_js_1.getPaths)({ type: 'config' });
        const secretsPaths = (0, getPaths_js_1.getPaths)({ type: 'secrets' });
        node_assert_1.default.deepEqual(configPaths, [(0, node_path_1.resolve)((0, node_process_1.cwd)(), './config/config.json')]);
        node_assert_1.default.deepEqual(secretsPaths, [(0, node_path_1.resolve)((0, node_process_1.cwd)(), './secrets/secrets.json')]);
    });
    (0, node_test_1.it)('use default value with zonfig ENV: ', () => {
        const configPaths = (0, getPaths_js_1.getPaths)({ type: 'config', env: 'dev' });
        const secretsPaths = (0, getPaths_js_1.getPaths)({ type: 'secrets', env: 'dev' });
        node_assert_1.default.deepEqual(configPaths, [(0, node_path_1.resolve)((0, node_process_1.cwd)(), './config/dev.config.json')]);
        node_assert_1.default.deepEqual(secretsPaths, [(0, node_path_1.resolve)((0, node_process_1.cwd)(), './secrets/dev.secrets.json')]);
    });
    (0, node_test_1.it)('use explicitly defined path: ', () => {
        const configPath = (0, node_path_1.resolve)((0, node_process_1.cwd)(), './custom/config/path/config.json');
        const secretsPath = (0, node_path_1.resolve)((0, node_process_1.cwd)(), './custom/secrets/path/secrets.json');
        const configPaths = (0, getPaths_js_1.getPaths)({ type: 'config', path: configPath, env: 'prod' });
        const secretsPaths = (0, getPaths_js_1.getPaths)({ type: 'secrets', path: secretsPath, env: 'prod' });
        node_assert_1.default.deepEqual(configPaths, [configPath]);
        node_assert_1.default.deepEqual(secretsPaths, [secretsPath]);
    });
    (0, node_test_1.it)('use multiple config paths: ', () => {
        const configPath = [(0, node_path_1.resolve)((0, node_process_1.cwd)(), './custom/config/path/config1.json'), (0, node_path_1.resolve)((0, node_process_1.cwd)(), './custom/config/path/config2.json')];
        const secretsPath = [(0, node_path_1.resolve)((0, node_process_1.cwd)(), './custom/secrets/path1/my-secret1.json'), (0, node_path_1.resolve)((0, node_process_1.cwd)(), './custom/secrets/path2/my-secret2.json')];
        const configPaths = (0, getPaths_js_1.getPaths)({ type: 'config', path: configPath, env: 'prod' });
        const secretsPaths = (0, getPaths_js_1.getPaths)({ type: 'secrets', path: secretsPath, env: 'prod' });
        node_assert_1.default.deepEqual(configPaths, configPath);
        node_assert_1.default.deepEqual(secretsPaths, secretsPath);
    });
});
