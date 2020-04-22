"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var chai_1 = require("chai");
var test_utils_1 = require("../../utils/test-utils");
var typeorm_1 = require("typeorm");
var AddVersionMigration_1 = require("../../../src/migration/AddVersionMigration");
var Version1000000000001 = /** @class */ (function (_super) {
    __extends(Version1000000000001, _super);
    function Version1000000000001() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.tableName = "version1";
        return _this;
    }
    return Version1000000000001;
}(AddVersionMigration_1.AddVersionMigration));
var Version1000000000002 = /** @class */ (function (_super) {
    __extends(Version1000000000002, _super);
    function Version1000000000002() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.tableName = "version2";
        return _this;
    }
    return Version1000000000002;
}(AddVersionMigration_1.AddVersionMigration));
describe("Migration", function () {
    var connections;
    before(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, test_utils_1.createTestingConnections({
                        schemaCreate: true,
                        dropSchema: true,
                        migrations: [Version1000000000001, Version1000000000002],
                    })];
                case 1: return [2 /*return*/, connections = _a.sent()];
            }
        });
    }); });
    beforeEach(function () { return test_utils_1.reloadTestingDatabases(connections); });
    after(function () { return test_utils_1.closeTestingConnections(connections); });
    it("can recognise the pending migrations", function () { return Promise.all(connections.map(function (connection) { return __awaiter(void 0, void 0, void 0, function () {
        var migrations;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connection.showMigrations()];
                case 1:
                    migrations = _a.sent();
                    migrations.should.be.equal(true);
                    return [2 /*return*/];
            }
        });
    }); })); });
    it("inherits from AddVersionMigration", function () { return Promise.all(connections.map(function (connection) { return __awaiter(void 0, void 0, void 0, function () {
        var migrationExecutor, migrations;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    migrationExecutor = new typeorm_1.MigrationExecutor(connection);
                    return [4 /*yield*/, migrationExecutor.getAllMigrations()];
                case 1:
                    migrations = _a.sent();
                    chai_1.expect(migrations.pop().instance instanceof AddVersionMigration_1.AddVersionMigration).to.equal(true);
                    return [2 /*return*/];
            }
        });
    }); })); });
    it("multiple with different names", function () { return Promise.all(connections.map(function (connection) { return __awaiter(void 0, void 0, void 0, function () {
        var migrations, tables;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connection.runMigrations({ transaction: "none" })];
                case 1:
                    migrations = _a.sent();
                    return [4 /*yield*/, connection.createQueryRunner().getTables(migrations.map(function (m) { return m.instance.tableName; }))];
                case 2:
                    tables = (_a.sent()).sort(function (a, b) { return a.name.localeCompare(b.name); });
                    tables.length.should.be.equal(2);
                    chai_1.expect(tables[0].name).to.equal("version1", "failed for " + connection.name);
                    chai_1.expect(tables[1].name).to.equal("version2", "failed for " + connection.name);
                    chai_1.expect(tables[0].columns).to.deep.equal(tables[1].columns, "failed for " + connection.name);
                    return [2 /*return*/];
            }
        });
    }); })); });
});
//# sourceMappingURL=test.js.map