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
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var chai_1 = require("chai");
var test_utils_1 = require("../../utils/test-utils");
var Post_1 = require("./entity/Post");
var src_1 = require("../../../src");
describe("Data Mapper", function () {
    var connections;
    before(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, test_utils_1.createTestingConnections({
                        entities: [Post_1.Post],
                    })];
                case 1: return [2 /*return*/, connections = _a.sent()];
            }
        });
    }); });
    beforeEach(function () { return test_utils_1.reloadTestingDatabases(connections); });
    after(function () { return test_utils_1.closeTestingConnections(connections); });
    it("save 1 item", function () { return Promise.all(connections.map(function (connection) { return __awaiter(void 0, void 0, void 0, function () {
        var postRepository, post, versionRepository, versions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    postRepository = connection.getRepository(Post_1.Post);
                    post = new Post_1.Post();
                    post.title = "hello";
                    post.content = "World";
                    return [4 /*yield*/, postRepository.save(post)];
                case 1:
                    post = _a.sent();
                    versionRepository = connection.getCustomRepository(src_1.VersionRepository);
                    return [4 /*yield*/, versionRepository.allForEntity(post)];
                case 2:
                    versions = _a.sent();
                    chai_1.expect(versions.length).to.equal(1);
                    chai_1.expect(versions[0].event).to.equal(src_1.VersionEvent.INSERT);
                    chai_1.expect(versions[0].itemId).to.equal(post.id.toString());
                    chai_1.expect(versions[0].itemType).to.equal(post.constructor.name);
                    return [2 /*return*/];
            }
        });
    }); })); });
    it("save 2 items", function () { return Promise.all(connections.map(function (connection) { return __awaiter(void 0, void 0, void 0, function () {
        var postRepository, post, post2, versionRepository, versions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    postRepository = connection.getRepository(Post_1.Post);
                    post = new Post_1.Post();
                    post.title = "hello";
                    post.content = "World";
                    return [4 /*yield*/, postRepository.save(post)];
                case 1:
                    _a.sent();
                    post2 = new Post_1.Post();
                    post2.title = "hello";
                    post2.content = "again";
                    return [4 /*yield*/, postRepository.save(post2)];
                case 2:
                    post2 = _a.sent();
                    versionRepository = connection.getCustomRepository(src_1.VersionRepository);
                    return [4 /*yield*/, versionRepository.allForEntity(post2)];
                case 3:
                    versions = _a.sent();
                    chai_1.expect(versions.length).to.equal(1);
                    chai_1.expect(versions[0].event).to.equal(src_1.VersionEvent.INSERT);
                    chai_1.expect(versions[0].itemId).to.equal(post2.id.toString());
                    chai_1.expect(versions[0].itemType).to.equal(post2.constructor.name);
                    return [2 /*return*/];
            }
        });
    }); })); });
    it("update item", function () { return Promise.all(connections.map(function (connection) { return __awaiter(void 0, void 0, void 0, function () {
        var postRepository, post, versionRepository, versions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    postRepository = connection.getRepository(Post_1.Post);
                    post = new Post_1.Post();
                    post.title = "hello";
                    post.content = "World";
                    return [4 /*yield*/, postRepository.save(post)];
                case 1:
                    post = _a.sent();
                    if (!(connection.name === "sqlite")) return [3 /*break*/, 3];
                    return [4 /*yield*/, test_utils_1.sleep(1000)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    post.content = "there!";
                    return [4 /*yield*/, postRepository.save(post)];
                case 4:
                    post = _a.sent();
                    versionRepository = connection.getCustomRepository(src_1.VersionRepository);
                    return [4 /*yield*/, versionRepository.allForEntity(post)];
                case 5:
                    versions = _a.sent();
                    chai_1.expect(versions.length).to.equal(2);
                    chai_1.expect(versions[0].event).to.equal(src_1.VersionEvent.UPDATE);
                    chai_1.expect(versions[0].itemId).to.equal(post.id.toString());
                    chai_1.expect(versions[0].itemType).to.equal(post.constructor.name);
                    return [2 /*return*/];
            }
        });
    }); })); });
    it("remove item", function () { return Promise.all(connections.map(function (connection) { return __awaiter(void 0, void 0, void 0, function () {
        var postRepository, post, versionRepository, versions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    postRepository = connection.getRepository(Post_1.Post);
                    post = new Post_1.Post();
                    post.title = "hello";
                    post.content = "World";
                    return [4 /*yield*/, postRepository.save(post)];
                case 1:
                    post = _a.sent();
                    if (!(connection.name === "sqlite")) return [3 /*break*/, 3];
                    return [4 /*yield*/, test_utils_1.sleep(1000)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [4 /*yield*/, postRepository.remove(post)];
                case 4:
                    _a.sent();
                    versionRepository = connection.getCustomRepository(src_1.VersionRepository);
                    return [4 /*yield*/, versionRepository.allForEntity(post)];
                case 5:
                    versions = _a.sent();
                    chai_1.expect(versions.length).to.equal(2);
                    chai_1.expect(versions[0].event).to.equal(src_1.VersionEvent.REMOVE);
                    chai_1.expect(versions[0].itemId).to.equal(post.id.toString());
                    chai_1.expect(versions[0].itemType).to.equal(post.constructor.name);
                    return [2 /*return*/];
            }
        });
    }); })); });
});
//# sourceMappingURL=test.js.map