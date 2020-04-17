"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
var typeorm_1 = require("typeorm");
var SqliteDriver_1 = require("typeorm/driver/sqlite/SqliteDriver");
var VersionEvent;
(function (VersionEvent) {
    VersionEvent["INSERT"] = "INSERT";
    VersionEvent["UPDATE"] = "UPDATE";
    VersionEvent["REMOVE"] = "REMOVE";
})(VersionEvent = exports.VersionEvent || (exports.VersionEvent = {}));
var Version = /** @class */ (function () {
    function Version() {
    }
    Version_1 = Version;
    Version.useConnection = function (connection) {
        this.usedConnection = connection;
    };
    Version.prototype.getConnection = function () {
        return this.constructor.usedConnection;
    };
    Version.prototype.getObject = function () {
        var _a;
        for (var _i = 0, _b = typeorm_1.getMetadataArgsStorage().tables; _i < _b.length; _i++) {
            var t = _b[_i];
            if (((_a = t.target) === null || _a === void 0 ? void 0 : _a.name) === this.itemType) {
                return Object.assign(new t.target(), this.object);
            }
        }
        return {};
    };
    Version.prototype.previous = function () {
        var _this = this;
        // Date comparison workaround for SQLite
        var timestampQuery = typeorm_1.LessThan(this.timestamp);
        if (this.getConnection().driver instanceof SqliteDriver_1.SqliteDriver) {
            timestampQuery = typeorm_1.Raw(function (alias) { return "STRFTIME('%Y-%m-%d %H:%M:%f', " + alias + ") < STRFTIME('%Y-%m-%d %H:%M:%f', '" + _this.timestamp.toISOString() + "')"; });
        }
        return this.getConnection().getRepository(Version_1).findOne({
            itemId: this.itemId,
            itemType: this.itemType,
            id: typeorm_1.Not(this.id),
            timestamp: timestampQuery,
        }, {
            order: { timestamp: 'DESC' }
        });
    };
    Version.prototype.next = function () {
        var _this = this;
        // Date comparison workaround for SQLite
        var timestampQuery = typeorm_1.MoreThan(this.timestamp);
        if (this.getConnection().driver instanceof SqliteDriver_1.SqliteDriver) {
            timestampQuery = typeorm_1.Raw(function (alias) { return "STRFTIME('%Y-%m-%d %H:%M:%f', " + alias + ") > STRFTIME('%Y-%m-%d %H:%M:%f', '" + _this.timestamp.toISOString() + "')"; });
        }
        return this.getConnection().getRepository(Version_1).findOne({
            itemId: this.itemId,
            itemType: this.itemType,
            id: typeorm_1.Not(this.id),
            timestamp: timestampQuery,
        }, {
            order: { timestamp: 'DESC' }
        });
    };
    Version.prototype.index = function () {
        return __awaiter(this, void 0, void 0, function () {
            var versions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection().getRepository(Version_1).find({
                            where: {
                                itemId: this.itemId,
                                itemType: this.itemType,
                            },
                            order: { timestamp: 'DESC' }
                        })];
                    case 1:
                        versions = _a.sent();
                        return [2 /*return*/, versions.indexOf(this)];
                }
            });
        });
    };
    var Version_1;
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Version.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ nullable: false }),
        __metadata("design:type", String)
    ], Version.prototype, "itemType", void 0);
    __decorate([
        typeorm_1.Column({ nullable: false }),
        __metadata("design:type", String)
    ], Version.prototype, "itemId", void 0);
    __decorate([
        typeorm_1.Column({ nullable: false }),
        __metadata("design:type", String)
    ], Version.prototype, "event", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", String)
    ], Version.prototype, "owner", void 0);
    __decorate([
        typeorm_1.Column({ type: "simple-json" }),
        __metadata("design:type", Object)
    ], Version.prototype, "object", void 0);
    __decorate([
        typeorm_1.Column({ precision: 6 }),
        __metadata("design:type", Date)
    ], Version.prototype, "timestamp", void 0);
    Version = Version_1 = __decorate([
        typeorm_1.Entity()
    ], Version);
    return Version;
}());
exports.Version = Version;
;
//# sourceMappingURL=Version.js.map