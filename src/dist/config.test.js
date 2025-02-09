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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var node_assert_1 = require("node:assert");
var node_test_1 = require("node:test");
var promises_1 = require("node:fs/promises");
var node_fs_1 = require("node:fs");
var node_process_1 = require("node:process");
var node_path_1 = require("node:path");
var zod_1 = require("zod");
var merge_1 = require("lodash/merge");
var config_js_1 = require("./config.js");
var createConfigFiles = function (files) { return __awaiter(void 0, void 0, void 0, function () {
    var dirToDelete, _i, files_1, file, dir, paths, nestedPaths, currentPath, _a, paths_1, path, currentDir;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                dirToDelete = [];
                _i = 0, files_1 = files;
                _b.label = 1;
            case 1:
                if (!(_i < files_1.length)) return [3 /*break*/, 8];
                file = files_1[_i];
                dir = node_path_1.dirname(file.path);
                paths = dir.split(node_path_1.sep);
                nestedPaths = [];
                currentPath = [];
                _a = 0, paths_1 = paths;
                _b.label = 2;
            case 2:
                if (!(_a < paths_1.length)) return [3 /*break*/, 5];
                path = paths_1[_a];
                currentPath.push(path);
                currentDir = currentPath.join(node_path_1.sep);
                if (!(node_fs_1.existsSync(currentDir) === false)) return [3 /*break*/, 4];
                nestedPaths.push(currentDir);
                return [4 /*yield*/, promises_1.mkdir(currentDir)];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4:
                _a++;
                return [3 /*break*/, 2];
            case 5:
                dirToDelete.push.apply(dirToDelete, nestedPaths.reverse());
                return [4 /*yield*/, promises_1.writeFile(file.path, JSON.stringify(file.data, null, 2))];
            case 6:
                _b.sent();
                _b.label = 7;
            case 7:
                _i++;
                return [3 /*break*/, 1];
            case 8: return [2 /*return*/, {
                    cleanup: function () { return __awaiter(void 0, void 0, void 0, function () {
                        var _i, files_2, file, _a, dirToDelete_1, dir;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _i = 0, files_2 = files;
                                    _b.label = 1;
                                case 1:
                                    if (!(_i < files_2.length)) return [3 /*break*/, 4];
                                    file = files_2[_i];
                                    if (!node_fs_1.existsSync(file.path)) return [3 /*break*/, 3];
                                    return [4 /*yield*/, promises_1.unlink(file.path)];
                                case 2:
                                    _b.sent();
                                    _b.label = 3;
                                case 3:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 4:
                                    _a = 0, dirToDelete_1 = dirToDelete;
                                    _b.label = 5;
                                case 5:
                                    if (!(_a < dirToDelete_1.length)) return [3 /*break*/, 8];
                                    dir = dirToDelete_1[_a];
                                    if (!node_fs_1.existsSync(dir)) return [3 /*break*/, 7];
                                    return [4 /*yield*/, promises_1.rm(dir, { recursive: true })];
                                case 6:
                                    _b.sent();
                                    _b.label = 7;
                                case 7:
                                    _a++;
                                    return [3 /*break*/, 5];
                                case 8: return [2 /*return*/];
                            }
                        });
                    }); }
                }];
        }
    });
}); };
node_test_1.describe('getZonfig', function () {
    node_test_1.describe('get config paths', function () {
        node_test_1.it('use default value: ', function () {
            var configPaths = config_js_1.getPaths({ type: 'config' });
            var secretsPaths = config_js_1.getPaths({ type: 'secrets' });
            node_assert_1["default"].deepEqual(configPaths, [node_path_1.resolve(node_process_1.cwd(), './config/config.json')]);
            node_assert_1["default"].deepEqual(secretsPaths, [node_path_1.resolve(node_process_1.cwd(), './secrets/secrets.json')]);
        });
        node_test_1.it('use default value with zonfig ENV: ', function () {
            var configPaths = config_js_1.getPaths({ type: 'config', env: 'dev' });
            var secretsPaths = config_js_1.getPaths({ type: 'secrets', env: 'dev' });
            node_assert_1["default"].deepEqual(configPaths, [node_path_1.resolve(node_process_1.cwd(), './config/dev.config.json')]);
            node_assert_1["default"].deepEqual(secretsPaths, [node_path_1.resolve(node_process_1.cwd(), './secrets/dev.secrets.json')]);
        });
        node_test_1.it('use explicitly defined path: ', function () {
            var configPath = node_path_1.resolve(node_process_1.cwd(), './custom/config/path/config.json');
            var secretsPath = node_path_1.resolve(node_process_1.cwd(), './custom/secrets/path/secrets.json');
            var configPaths = config_js_1.getPaths({ type: 'config', path: configPath, env: 'prod' });
            var secretsPaths = config_js_1.getPaths({ type: 'secrets', path: secretsPath, env: 'prod' });
            node_assert_1["default"].deepEqual(configPaths, [configPath]);
            node_assert_1["default"].deepEqual(secretsPaths, [secretsPath]);
        });
        node_test_1.it('use multiple config paths: ', function () {
            var configPath = [node_path_1.resolve(node_process_1.cwd(), './custom/config/path/config1.json'), node_path_1.resolve(node_process_1.cwd(), './custom/config/path/config2.json')];
            var secretsPath = [node_path_1.resolve(node_process_1.cwd(), './custom/secrets/path1/my-secret1.json'), node_path_1.resolve(node_process_1.cwd(), './custom/secrets/path2/my-secret2.json')];
            var configPaths = config_js_1.getPaths({ type: 'config', path: configPath, env: 'prod' });
            var secretsPaths = config_js_1.getPaths({ type: 'secrets', path: secretsPath, env: 'prod' });
            node_assert_1["default"].deepEqual(configPaths, configPath);
            node_assert_1["default"].deepEqual(secretsPaths, secretsPath);
        });
    });
    node_test_1.describe('validate schema without secrets', function () {
        var schema = zod_1.z.object({
            name: zod_1.z.string(),
            birthYear: zod_1.z.number().optional(),
            nested: zod_1.z.object({ foo: zod_1.z.number(), bar: zod_1.z.string(), baz: zod_1.z.array(zod_1.z.number()) }),
            arr: zod_1.z.array(zod_1.z.object({ id: zod_1.z.coerce.number(), val: zod_1.z.coerce.string() }))
        });
        node_test_1.it('valid data', function () { return __awaiter(void 0, void 0, void 0, function () {
            var path, data, cleanup, config, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = './tmp/test/config.json';
                        data = { name: 'foo', birthYear: 2000, nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
                        return [4 /*yield*/, createConfigFiles([{ path: path, data: data }])];
                    case 1:
                        cleanup = (_a.sent()).cleanup;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 7]);
                        return [4 /*yield*/, config_js_1.getZonfig({ schema: schema, configPath: [path] })];
                    case 3:
                        config = _a.sent();
                        node_assert_1["default"].deepEqual(data, config);
                        return [3 /*break*/, 7];
                    case 4:
                        e_1 = _a.sent();
                        throw e_1;
                    case 5: return [4 /*yield*/, cleanup()];
                    case 6:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        node_test_1.it('valid data without optional fields', function () { return __awaiter(void 0, void 0, void 0, function () {
            var path, data, cleanup, config, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = './tmp/test/config.json';
                        data = { name: 'foo', nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
                        return [4 /*yield*/, createConfigFiles([{ path: path, data: data }])];
                    case 1:
                        cleanup = (_a.sent()).cleanup;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 7]);
                        return [4 /*yield*/, config_js_1.getZonfig({ schema: schema, configPath: [path] })];
                    case 3:
                        config = _a.sent();
                        node_assert_1["default"].deepEqual(data, config);
                        return [3 /*break*/, 7];
                    case 4:
                        e_2 = _a.sent();
                        throw e_2;
                    case 5: return [4 /*yield*/, cleanup()];
                    case 6:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        node_test_1.it('convert values type', function () { return __awaiter(void 0, void 0, void 0, function () {
            var path, data, cleanup, config, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = './tmp/test/config.json';
                        data = { name: 'foo', nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: '1', val: 123 }] };
                        return [4 /*yield*/, createConfigFiles([{ path: path, data: data }])];
                    case 1:
                        cleanup = (_a.sent()).cleanup;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 7]);
                        return [4 /*yield*/, config_js_1.getZonfig({ schema: schema, configPath: [path] })];
                    case 3:
                        config = _a.sent();
                        node_assert_1["default"].deepEqual(config.arr, data.arr.map(function (_a) {
                            var id = _a.id, val = _a.val;
                            return ({ id: Number(id), val: String(val) });
                        }));
                        return [3 /*break*/, 7];
                    case 4:
                        e_3 = _a.sent();
                        throw e_3;
                    case 5: return [4 /*yield*/, cleanup()];
                    case 6:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        node_test_1.it('override field', function () { return __awaiter(void 0, void 0, void 0, function () {
            var path, data, overrideName, cleanup, config, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = './tmp/test/config.json';
                        data = { name: 'foo', birthYear: 2000, nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
                        overrideName = 'bar';
                        process.env.name = overrideName;
                        return [4 /*yield*/, createConfigFiles([{ path: path, data: data }])];
                    case 1:
                        cleanup = (_a.sent()).cleanup;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 7]);
                        return [4 /*yield*/, config_js_1.getZonfig({ schema: schema, configPath: [path] })];
                    case 3:
                        config = _a.sent();
                        node_assert_1["default"].equal(config.name, overrideName);
                        return [3 /*break*/, 7];
                    case 4:
                        e_4 = _a.sent();
                        throw e_4;
                    case 5: return [4 /*yield*/, cleanup()];
                    case 6:
                        _a.sent();
                        delete process.env.name;
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        node_test_1.it('override nested field', function () { return __awaiter(void 0, void 0, void 0, function () {
            var path, data, nestedBar, cleanup, config, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = './tmp/test/config.json';
                        data = { name: 'foo', birthYear: 2000, nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
                        nestedBar = 'foo';
                        process.env['nested.bar'] = nestedBar;
                        return [4 /*yield*/, createConfigFiles([{ path: path, data: data }])];
                    case 1:
                        cleanup = (_a.sent()).cleanup;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 7]);
                        return [4 /*yield*/, config_js_1.getZonfig({ schema: schema, configPath: [path] })];
                    case 3:
                        config = _a.sent();
                        node_assert_1["default"].equal(config.nested.bar, nestedBar);
                        return [3 /*break*/, 7];
                    case 4:
                        e_5 = _a.sent();
                        throw e_5;
                    case 5: return [4 /*yield*/, cleanup()];
                    case 6:
                        _a.sent();
                        delete process.env['nested.bar'];
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        node_test_1.it('override object', function () { return __awaiter(void 0, void 0, void 0, function () {
            var path, data, nested, cleanup, config, e_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = './tmp/test/config.json';
                        data = { name: 'foo', birthYear: 2000, nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
                        nested = { foo: 2, bar: 'xys', baz: [5, 6, 7] };
                        process.env.nested = JSON.stringify(nested);
                        return [4 /*yield*/, createConfigFiles([{ path: path, data: data }])];
                    case 1:
                        cleanup = (_a.sent()).cleanup;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 7]);
                        return [4 /*yield*/, config_js_1.getZonfig({ schema: schema, configPath: [path] })];
                    case 3:
                        config = _a.sent();
                        node_assert_1["default"].deepEqual(config.nested, nested);
                        return [3 /*break*/, 7];
                    case 4:
                        e_6 = _a.sent();
                        throw e_6;
                    case 5: return [4 /*yield*/, cleanup()];
                    case 6:
                        _a.sent();
                        delete process.env.nested;
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        node_test_1.it('override array', function () { return __awaiter(void 0, void 0, void 0, function () {
            var path, data, arr, cleanup, config, e_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = './tmp/test/config.json';
                        data = { name: 'foo', birthYear: 2000, nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
                        arr = [
                            { id: 10, val: 'abcd' },
                            { id: 20, val: 'xyz' },
                        ];
                        process.env.arr = JSON.stringify(arr);
                        return [4 /*yield*/, createConfigFiles([{ path: path, data: data }])];
                    case 1:
                        cleanup = (_a.sent()).cleanup;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 7]);
                        return [4 /*yield*/, config_js_1.getZonfig({ schema: schema, configPath: [path] })];
                    case 3:
                        config = _a.sent();
                        node_assert_1["default"].deepEqual(config.arr, arr);
                        return [3 /*break*/, 7];
                    case 4:
                        e_7 = _a.sent();
                        throw e_7;
                    case 5: return [4 /*yield*/, cleanup()];
                    case 6:
                        _a.sent();
                        delete process.env.arr;
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        node_test_1.it('add missing data with env', function () { return __awaiter(void 0, void 0, void 0, function () {
            var path, data, overrideName, cleanup, config, e_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = './tmp/test/config.json';
                        data = { birthYear: 2000, nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
                        overrideName = 'bar';
                        process.env.name = overrideName;
                        return [4 /*yield*/, createConfigFiles([{ path: path, data: data }])];
                    case 1:
                        cleanup = (_a.sent()).cleanup;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 7]);
                        return [4 /*yield*/, config_js_1.getZonfig({ schema: schema, configPath: [path] })];
                    case 3:
                        config = _a.sent();
                        node_assert_1["default"].equal(config.name, overrideName);
                        return [3 /*break*/, 7];
                    case 4:
                        e_8 = _a.sent();
                        throw e_8;
                    case 5: return [4 /*yield*/, cleanup()];
                    case 6:
                        _a.sent();
                        delete process.env.name;
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        node_test_1.it('load data from multiple files', function () { return __awaiter(void 0, void 0, void 0, function () {
            var path1, data1, path2, data2, cleanup1, cleanup2, config, e_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path1 = './tmp/test/config1.json';
                        data1 = { name: 'foo', birthYear: 2000 };
                        path2 = './tmp/test/config2.json';
                        data2 = { nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
                        return [4 /*yield*/, createConfigFiles([{ path: path1, data: data1 }])];
                    case 1:
                        cleanup1 = (_a.sent()).cleanup;
                        return [4 /*yield*/, createConfigFiles([{ path: path2, data: data2 }])];
                    case 2:
                        cleanup2 = (_a.sent()).cleanup;
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, 6, 9]);
                        return [4 /*yield*/, config_js_1.getZonfig({ schema: schema, configPath: [path1, path2] })];
                    case 4:
                        config = _a.sent();
                        node_assert_1["default"].deepEqual(merge_1["default"](data1, data2), config);
                        return [3 /*break*/, 9];
                    case 5:
                        e_9 = _a.sent();
                        throw e_9;
                    case 6: return [4 /*yield*/, cleanup1()];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, cleanup2()];
                    case 8:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        }); });
    });
    node_test_1.describe('validate schema with secrets', function () {
        var schema = zod_1.z.object({ zone: zod_1.z.string(), API_KEY: zod_1.z.string() });
        node_test_1.it('valid data', function () { return __awaiter(void 0, void 0, void 0, function () {
            var configPath, secretsPath, configData, secretsData, cleanup, config, e_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        configPath = './tmp/test/config.json';
                        secretsPath = './tmp/test/secret.json';
                        configData = { zone: 'us' };
                        secretsData = { API_KEY: 'abcd' };
                        return [4 /*yield*/, createConfigFiles([
                                { path: configPath, data: configData },
                                { path: secretsPath, data: secretsData },
                            ])];
                    case 1:
                        cleanup = (_a.sent()).cleanup;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 7]);
                        return [4 /*yield*/, config_js_1.getZonfig({ schema: schema, configPath: configPath, secretsPath: secretsPath })];
                    case 3:
                        config = _a.sent();
                        node_assert_1["default"].deepEqual(merge_1["default"](configData, secretsData), config);
                        return [3 /*break*/, 7];
                    case 4:
                        e_10 = _a.sent();
                        throw e_10;
                    case 5: return [4 /*yield*/, cleanup()];
                    case 6:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
    });
});
