"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = require("node:test");
const promises_1 = require("node:fs/promises");
const node_fs_1 = require("node:fs");
const node_process_1 = require("node:process");
const node_path_1 = require("node:path");
const zod_1 = require("zod");
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const config_js_1 = require("./config.js");
const createConfigFiles = (files) => __awaiter(void 0, void 0, void 0, function* () {
    const dirToDelete = [];
    for (const file of files) {
        const dir = (0, node_path_1.dirname)(file.path);
        const paths = dir.split(node_path_1.sep);
        const nestedPaths = [];
        let currentPath = [];
        for (const path of paths) {
            currentPath.push(path);
            const currentDir = currentPath.join(node_path_1.sep);
            if ((0, node_fs_1.existsSync)(currentDir) === false) {
                nestedPaths.push(currentDir);
                yield (0, promises_1.mkdir)(currentDir);
            }
        }
        dirToDelete.push(...nestedPaths.reverse());
        yield (0, promises_1.writeFile)(file.path, JSON.stringify(file.data, null, 2));
    }
    return {
        cleanup: () => __awaiter(void 0, void 0, void 0, function* () {
            for (const file of files) {
                if ((0, node_fs_1.existsSync)(file.path)) {
                    yield (0, promises_1.unlink)(file.path);
                }
            }
            for (const dir of dirToDelete) {
                if ((0, node_fs_1.existsSync)(dir)) {
                    yield (0, promises_1.rm)(dir, { recursive: true });
                }
            }
        }),
    };
});
(0, node_test_1.describe)('getZonfig', () => {
    (0, node_test_1.describe)('get config paths', () => {
        (0, node_test_1.it)('use default value: ', () => {
            const configPaths = (0, config_js_1.getPaths)({ type: 'config' });
            const secretsPaths = (0, config_js_1.getPaths)({ type: 'secrets' });
            node_assert_1.default.deepEqual(configPaths, [(0, node_path_1.resolve)((0, node_process_1.cwd)(), './config/config.json')]);
            node_assert_1.default.deepEqual(secretsPaths, [(0, node_path_1.resolve)((0, node_process_1.cwd)(), './secrets/secrets.json')]);
        });
        (0, node_test_1.it)('use default value with zonfig ENV: ', () => {
            const configPaths = (0, config_js_1.getPaths)({ type: 'config', env: 'dev' });
            const secretsPaths = (0, config_js_1.getPaths)({ type: 'secrets', env: 'dev' });
            node_assert_1.default.deepEqual(configPaths, [(0, node_path_1.resolve)((0, node_process_1.cwd)(), './config/dev.config.json')]);
            node_assert_1.default.deepEqual(secretsPaths, [(0, node_path_1.resolve)((0, node_process_1.cwd)(), './secrets/dev.secrets.json')]);
        });
        (0, node_test_1.it)('use explicitly defined path: ', () => {
            const configPath = (0, node_path_1.resolve)((0, node_process_1.cwd)(), './custom/config/path/config.json');
            const secretsPath = (0, node_path_1.resolve)((0, node_process_1.cwd)(), './custom/secrets/path/secrets.json');
            const configPaths = (0, config_js_1.getPaths)({ type: 'config', path: configPath, env: 'prod' });
            const secretsPaths = (0, config_js_1.getPaths)({ type: 'secrets', path: secretsPath, env: 'prod' });
            node_assert_1.default.deepEqual(configPaths, [configPath]);
            node_assert_1.default.deepEqual(secretsPaths, [secretsPath]);
        });
        (0, node_test_1.it)('use multiple config paths: ', () => {
            const configPath = [(0, node_path_1.resolve)((0, node_process_1.cwd)(), './custom/config/path/config1.json'), (0, node_path_1.resolve)((0, node_process_1.cwd)(), './custom/config/path/config2.json')];
            const secretsPath = [(0, node_path_1.resolve)((0, node_process_1.cwd)(), './custom/secrets/path1/my-secret1.json'), (0, node_path_1.resolve)((0, node_process_1.cwd)(), './custom/secrets/path2/my-secret2.json')];
            const configPaths = (0, config_js_1.getPaths)({ type: 'config', path: configPath, env: 'prod' });
            const secretsPaths = (0, config_js_1.getPaths)({ type: 'secrets', path: secretsPath, env: 'prod' });
            node_assert_1.default.deepEqual(configPaths, configPath);
            node_assert_1.default.deepEqual(secretsPaths, secretsPath);
        });
    });
    (0, node_test_1.describe)('validate schema without secrets', () => {
        const schema = zod_1.z.object({
            name: zod_1.z.string(),
            birthYear: zod_1.z.number().optional(),
            nested: zod_1.z.object({
                foo: zod_1.z.number(),
                bar: zod_1.z.string(),
                baz: zod_1.z.array(zod_1.z.number()),
            }),
            arr: zod_1.z.array(zod_1.z.object({
                id: zod_1.z.coerce.number(),
                val: zod_1.z.coerce.string(),
            })),
        });
        (0, node_test_1.it)('valid data', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = './tmp/test/config.json';
            const data = {
                name: 'foo',
                birthYear: 2000,
                nested: {
                    foo: 1,
                    bar: 'abcd',
                    baz: [1, 2, 3],
                },
                arr: [
                    {
                        id: 1,
                        val: 'foo',
                    },
                ],
            };
            const { cleanup } = yield createConfigFiles([{ path, data }]);
            try {
                const config = yield (0, config_js_1.getZonfig)({
                    schema,
                    configPath: [path],
                });
                node_assert_1.default.deepEqual(data, config);
            }
            catch (e) {
                throw e;
            }
            finally {
                yield cleanup();
            }
        }));
        (0, node_test_1.it)('valid data without optional fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = './tmp/test/config.json';
            const data = {
                name: 'foo',
                nested: {
                    foo: 1,
                    bar: 'abcd',
                    baz: [1, 2, 3],
                },
                arr: [
                    {
                        id: 1,
                        val: 'foo',
                    },
                ],
            };
            const { cleanup } = yield createConfigFiles([{ path, data }]);
            try {
                const config = yield (0, config_js_1.getZonfig)({
                    schema,
                    configPath: [path],
                });
                node_assert_1.default.deepEqual(data, config);
            }
            catch (e) {
                throw e;
            }
            finally {
                yield cleanup();
            }
        }));
        (0, node_test_1.it)('convert values type', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = './tmp/test/config.json';
            const data = {
                name: 'foo',
                nested: {
                    foo: 1,
                    bar: 'abcd',
                    baz: [1, 2, 3],
                },
                arr: [
                    {
                        id: '1',
                        val: 123,
                    },
                ],
            };
            const { cleanup } = yield createConfigFiles([{ path, data }]);
            try {
                const config = yield (0, config_js_1.getZonfig)({
                    schema,
                    configPath: [path],
                });
                node_assert_1.default.deepEqual(config.arr, data.arr.map(({ id, val }) => ({
                    id: Number(id),
                    val: String(val),
                })));
            }
            catch (e) {
                throw e;
            }
            finally {
                yield cleanup();
            }
        }));
        (0, node_test_1.it)('override field', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = './tmp/test/config.json';
            const data = {
                name: 'foo',
                birthYear: 2000,
                nested: {
                    foo: 1,
                    bar: 'abcd',
                    baz: [1, 2, 3],
                },
                arr: [
                    {
                        id: 1,
                        val: 'foo',
                    },
                ],
            };
            const overrideName = 'bar';
            process.env.name = overrideName;
            const { cleanup } = yield createConfigFiles([{ path, data }]);
            try {
                const config = yield (0, config_js_1.getZonfig)({
                    schema,
                    configPath: [path],
                });
                node_assert_1.default.equal(config.name, overrideName);
            }
            catch (e) {
                throw e;
            }
            finally {
                yield cleanup();
                delete process.env.name;
            }
        }));
        (0, node_test_1.it)('override nested field', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = './tmp/test/config.json';
            const data = {
                name: 'foo',
                birthYear: 2000,
                nested: {
                    foo: 1,
                    bar: 'abcd',
                    baz: [1, 2, 3],
                },
                arr: [
                    {
                        id: 1,
                        val: 'foo',
                    },
                ],
            };
            const nestedBar = 'foo';
            process.env['nested.bar'] = nestedBar;
            const { cleanup } = yield createConfigFiles([{ path, data }]);
            try {
                const config = yield (0, config_js_1.getZonfig)({
                    schema,
                    configPath: [path],
                });
                node_assert_1.default.equal(config.nested.bar, nestedBar);
            }
            catch (e) {
                throw e;
            }
            finally {
                yield cleanup();
                delete process.env['nested.bar'];
            }
        }));
        (0, node_test_1.it)('override object', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = './tmp/test/config.json';
            const data = {
                name: 'foo',
                birthYear: 2000,
                nested: {
                    foo: 1,
                    bar: 'abcd',
                    baz: [1, 2, 3],
                },
                arr: [
                    {
                        id: 1,
                        val: 'foo',
                    },
                ],
            };
            const nested = {
                foo: 2,
                bar: 'xys',
                baz: [5, 6, 7],
            };
            process.env.nested = JSON.stringify(nested);
            const { cleanup } = yield createConfigFiles([{ path, data }]);
            try {
                const config = yield (0, config_js_1.getZonfig)({
                    schema,
                    configPath: [path],
                });
                node_assert_1.default.deepEqual(config.nested, nested);
            }
            catch (e) {
                throw e;
            }
            finally {
                yield cleanup();
                delete process.env.nested;
            }
        }));
        (0, node_test_1.it)('override array', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = './tmp/test/config.json';
            const data = {
                name: 'foo',
                birthYear: 2000,
                nested: {
                    foo: 1,
                    bar: 'abcd',
                    baz: [1, 2, 3],
                },
                arr: [
                    {
                        id: 1,
                        val: 'foo',
                    },
                ],
            };
            const arr = [
                {
                    id: 10,
                    val: 'abcd',
                },
                {
                    id: 20,
                    val: 'xyz',
                },
            ];
            process.env.arr = JSON.stringify(arr);
            const { cleanup } = yield createConfigFiles([{ path, data }]);
            try {
                const config = yield (0, config_js_1.getZonfig)({
                    schema,
                    configPath: [path],
                });
                node_assert_1.default.deepEqual(config.arr, arr);
            }
            catch (e) {
                throw e;
            }
            finally {
                yield cleanup();
                delete process.env.arr;
            }
        }));
        (0, node_test_1.it)('add missing data with env', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = './tmp/test/config.json';
            const data = {
                birthYear: 2000,
                nested: {
                    foo: 1,
                    bar: 'abcd',
                    baz: [1, 2, 3],
                },
                arr: [
                    {
                        id: 1,
                        val: 'foo',
                    },
                ],
            };
            const overrideName = 'bar';
            process.env.name = overrideName;
            const { cleanup } = yield createConfigFiles([{ path, data }]);
            try {
                const config = yield (0, config_js_1.getZonfig)({
                    schema,
                    configPath: [path],
                });
                node_assert_1.default.equal(config.name, overrideName);
            }
            catch (e) {
                throw e;
            }
            finally {
                yield cleanup();
                delete process.env.name;
            }
        }));
        (0, node_test_1.it)('load data from multiple files', () => __awaiter(void 0, void 0, void 0, function* () {
            const path1 = './tmp/test/config1.json';
            const data1 = {
                name: 'foo',
                birthYear: 2000,
            };
            const path2 = './tmp/test/config2.json';
            const data2 = {
                nested: {
                    foo: 1,
                    bar: 'abcd',
                    baz: [1, 2, 3],
                },
                arr: [
                    {
                        id: 1,
                        val: 'foo',
                    },
                ],
            };
            const { cleanup: cleanup1 } = yield createConfigFiles([{ path: path1, data: data1 }]);
            const { cleanup: cleanup2 } = yield createConfigFiles([{ path: path2, data: data2 }]);
            try {
                const config = yield (0, config_js_1.getZonfig)({
                    schema,
                    configPath: [path1, path2],
                });
                node_assert_1.default.deepEqual((0, lodash_merge_1.default)(data1, data2), config);
            }
            catch (e) {
                throw e;
            }
            finally {
                yield cleanup1();
                yield cleanup2();
            }
        }));
    });
    (0, node_test_1.describe)('validate schema with secrets', () => {
        const schema = zod_1.z.object({
            zone: zod_1.z.string(),
            API_KEY: zod_1.z.string(),
        });
        (0, node_test_1.it)('valid data', () => __awaiter(void 0, void 0, void 0, function* () {
            const configPath = './tmp/test/config.json';
            const secretsPath = './tmp/test/secret.json';
            const configData = {
                zone: 'us',
            };
            const secretsData = {
                API_KEY: 'abcd',
            };
            const { cleanup } = yield createConfigFiles([
                { path: configPath, data: configData },
                { path: secretsPath, data: secretsData },
            ]);
            try {
                const config = yield (0, config_js_1.getZonfig)({
                    schema,
                    configPath,
                    secretsPath,
                });
                node_assert_1.default.deepEqual((0, lodash_merge_1.default)(configData, secretsData), config);
            }
            catch (e) {
                throw e;
            }
            finally {
                yield cleanup();
            }
        }));
    });
});
