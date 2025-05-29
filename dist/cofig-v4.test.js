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
const v4_1 = require("zod/v4");
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const config_v4_js_1 = require("./config-v4.js");
const env_config_v4_js_1 = require("./env-config-v4.js");
const config_test_js_1 = require("./config.test.js");
(0, node_test_1.describe)('getConfig with zod/v4', { concurrency: false }, () => {
    (0, node_test_1.describe)('validate schema without secrets', () => {
        const schema = v4_1.z.object({
            name: v4_1.z.string(),
            birthYear: v4_1.z.number().optional(),
            nested: v4_1.z.object({ foo: v4_1.z.number(), bar: v4_1.z.string(), baz: v4_1.z.array(v4_1.z.number()) }),
            arr: v4_1.z.array(v4_1.z.object({ id: v4_1.z.coerce.number(), val: v4_1.z.coerce.string() })),
        });
        (0, node_test_1.it)('valid data', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = './tmp/test/config.json';
            const data = { name: 'foo', birthYear: 2000, nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
            const { cleanup } = yield (0, config_test_js_1.createConfigFiles)([{ path, data }]);
            try {
                const config = yield (0, config_v4_js_1.getConfig)({ schema, configPath: [path] });
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
            const data = { name: 'foo', nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
            const { cleanup } = yield (0, config_test_js_1.createConfigFiles)([{ path, data }]);
            try {
                const config = yield (0, config_v4_js_1.getConfig)({ schema, configPath: [path] });
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
            const data = { name: 'foo', nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: '1', val: 123 }] };
            const { cleanup } = yield (0, config_test_js_1.createConfigFiles)([{ path, data }]);
            try {
                const config = yield (0, config_v4_js_1.getConfig)({ schema, configPath: [path] });
                node_assert_1.default.deepEqual(config.arr, data.arr.map(({ id, val }) => ({ id: Number(id), val: String(val) })));
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
            const data = { name: 'foo', birthYear: 2000, nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
            const overrideName = 'bar';
            process.env.name = overrideName;
            const { cleanup } = yield (0, config_test_js_1.createConfigFiles)([{ path, data }]);
            try {
                const config = yield (0, config_v4_js_1.getConfig)({ schema, configPath: [path] });
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
            const data = { name: 'foo', birthYear: 2000, nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
            const nestedBar = 'foo';
            process.env['nested___bar'] = nestedBar;
            const { cleanup } = yield (0, config_test_js_1.createConfigFiles)([{ path, data }]);
            try {
                const config = yield (0, config_v4_js_1.getConfig)({ schema, configPath: [path] });
                node_assert_1.default.equal(config.nested.bar, nestedBar);
            }
            catch (e) {
                throw e;
            }
            finally {
                yield cleanup();
                delete process.env['nested___bar'];
            }
        }));
        (0, node_test_1.it)('override object', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = './tmp/test/config.json';
            const data = { name: 'foo', birthYear: 2000, nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
            const nested = { foo: 2, bar: 'xys', baz: [5, 6, 7] };
            process.env.nested = JSON.stringify(nested);
            const { cleanup } = yield (0, config_test_js_1.createConfigFiles)([{ path, data }]);
            try {
                const config = yield (0, config_v4_js_1.getConfig)({ schema, configPath: [path] });
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
            const data = { name: 'foo', birthYear: 2000, nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
            const arr = [
                { id: 10, val: 'abcd' },
                { id: 20, val: 'xyz' },
            ];
            process.env.arr = JSON.stringify(arr);
            const { cleanup } = yield (0, config_test_js_1.createConfigFiles)([{ path, data }]);
            try {
                const config = yield (0, config_v4_js_1.getConfig)({ schema, configPath: [path] });
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
            const data = { birthYear: 2000, nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
            const overrideName = 'bar';
            process.env.name = overrideName;
            const { cleanup } = yield (0, config_test_js_1.createConfigFiles)([{ path, data }]);
            try {
                const config = yield (0, config_v4_js_1.getConfig)({ schema, configPath: [path] });
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
            const data1 = { name: 'foo', birthYear: 2000 };
            const path2 = './tmp/test/config2.json';
            const data2 = { nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
            const { cleanup: cleanup1 } = yield (0, config_test_js_1.createConfigFiles)([{ path: path1, data: data1 }]);
            const { cleanup: cleanup2 } = yield (0, config_test_js_1.createConfigFiles)([{ path: path2, data: data2 }]);
            try {
                const config = yield (0, config_v4_js_1.getConfig)({ schema, configPath: [path1, path2] });
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
        const schema = v4_1.z.object({ zone: v4_1.z.string(), API_KEY: v4_1.z.string() });
        (0, node_test_1.it)('valid data', () => __awaiter(void 0, void 0, void 0, function* () {
            const configPath = './tmp/test/config.json';
            const secretsPath = './tmp/test/secret.json';
            const configData = { zone: 'us' };
            const secretsData = { API_KEY: 'abcd' };
            const { cleanup } = yield (0, config_test_js_1.createConfigFiles)([
                { path: configPath, data: configData },
                { path: secretsPath, data: secretsData },
            ]);
            try {
                const config = yield (0, config_v4_js_1.getConfig)({ schema, configPath, secretsPath });
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
    (0, node_test_1.describe)('getConfigFromEnv', () => {
        (0, node_test_1.it)('get config from env', () => {
            const envVariables = [
                { key: 'FOO', value: 'foo' },
                { key: 'BAR', value: 'bar' },
                { key: 'NESTED___BAZ', value: 'baz' },
            ];
            for (const envVariable of envVariables) {
                process.env[envVariable.key] = envVariable.value;
            }
            try {
                const schema = v4_1.z.object({
                    FOO: v4_1.z.string(),
                    BAR: v4_1.z.string().optional(),
                    NESTED: v4_1.z.object({ BAZ: v4_1.z.string() }),
                });
                const config = (0, env_config_v4_js_1.getConfigFromEnv)({ schema });
                node_assert_1.default.equal(config.FOO, 'foo');
                node_assert_1.default.equal(config.NESTED.BAZ, 'baz');
            }
            catch (e) {
                throw e;
            }
            finally {
                for (const envVariable of envVariables) {
                    delete process.env[envVariable.key];
                }
            }
        });
    });
});
