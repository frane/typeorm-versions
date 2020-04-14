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
var typeorm_1 = require("typeorm");
var PostgresDriver_1 = require("typeorm/driver/postgres/PostgresDriver");
var SqlServerDriver_1 = require("typeorm/driver/sqlserver/SqlServerDriver");
var src_1 = require("../../src");
/**
 * Creates a testing connection options for the given driver type based on the configuration in the ormconfig.json
 * and given options that can override some of its configuration for the test-specific use case.
 */
function setupSingleTestingConnection(driverType, options) {
    var testingConnections = setupTestingConnections({
        name: options.name ? options.name : undefined,
        entities: options.entities ? options.entities : [],
        subscribers: options.subscribers ? options.subscribers : [],
        dropSchema: options.dropSchema ? options.dropSchema : false,
        schemaCreate: options.schemaCreate ? options.schemaCreate : false,
        enabledDrivers: [driverType],
        cache: options.cache,
        schema: options.schema ? options.schema : undefined,
        namingStrategy: options.namingStrategy ? options.namingStrategy : undefined
    });
    if (!testingConnections.length)
        throw new Error("Unable to run tests because connection options for \"" + driverType + "\" are not set.");
    return testingConnections[0];
}
exports.setupSingleTestingConnection = setupSingleTestingConnection;
/**
 * Loads test connection options from ormconfig.json file.
 */
function getTypeOrmConfig() {
    try {
        try {
            return require(__dirname + "/../../../ormconfig.json");
        }
        catch (err) {
            return require(__dirname + "/../../ormconfig.json");
        }
    }
    catch (err) {
        throw new Error("Cannot find ormconfig.json file in the root of the project. To run tests please create ormconfig.json file" +
            " in the root of the project (near ormconfig.json.dist, you need to copy ormconfig.json.dist into ormconfig.json" +
            " and change all database settings to match your local environment settings).");
    }
}
exports.getTypeOrmConfig = getTypeOrmConfig;
/**
 * Creates a testing connections options based on the configuration in the ormconfig.json
 * and given options that can override some of its configuration for the test-specific use case.
 */
function setupTestingConnections(options) {
    var ormConfigConnectionOptionsArray = getTypeOrmConfig();
    if (!ormConfigConnectionOptionsArray.length)
        throw new Error("No connections setup in ormconfig.json file. Please create configurations for each database type to run tests.");
    return ormConfigConnectionOptionsArray
        .filter(function (connectionOptions) {
        if (connectionOptions.skip === true)
            return false;
        if (options && options.enabledDrivers && options.enabledDrivers.length)
            return options.enabledDrivers.indexOf(connectionOptions.type) !== -1; // ! is temporary
        if (connectionOptions.disabledIfNotEnabledImplicitly === true)
            return false;
        return true;
    })
        .map(function (connectionOptions) {
        var newOptions = Object.assign({}, connectionOptions, {
            name: options && options.name ? options.name : connectionOptions.name,
            entities: options && options.entities ? options.entities : [],
            subscribers: options && options.subscribers ? options.subscribers : [],
            dropSchema: options && options.dropSchema !== undefined ? options.dropSchema : false,
            cache: options ? options.cache : undefined,
        });
        if (options && options.driverSpecific)
            newOptions = Object.assign({}, options.driverSpecific, newOptions);
        if (options && options.schemaCreate)
            newOptions.synchronize = options.schemaCreate;
        if (options && options.schema)
            newOptions.schema = options.schema;
        if (options && options.logging !== undefined)
            newOptions.logging = options.logging;
        if (options && options.__dirname)
            newOptions.entities = [options.__dirname + "/entity/*{.js,.ts}"];
        if (options && options.namingStrategy)
            newOptions.namingStrategy = options.namingStrategy;
        return newOptions;
    }).map(function (connctionOptions) { return src_1.versionsConfig(connctionOptions); }); // inject versions stuff
}
exports.setupTestingConnections = setupTestingConnections;
/**
 * Creates a testing connections based on the configuration in the ormconfig.json
 * and given options that can override some of its configuration for the test-specific use case.
 */
function createTestingConnections(options) {
    return __awaiter(this, void 0, void 0, function () {
        var connections;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, typeorm_1.createConnections(setupTestingConnections(options))];
                case 1:
                    connections = _a.sent();
                    return [4 /*yield*/, Promise.all(connections.map(function (connection) { return __awaiter(_this, void 0, void 0, function () {
                            var databases, queryRunner, schemaPaths_1, schema;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        databases = [];
                                        connection.entityMetadatas.forEach(function (metadata) {
                                            if (metadata.database && databases.indexOf(metadata.database) === -1)
                                                databases.push(metadata.database);
                                        });
                                        queryRunner = connection.createQueryRunner();
                                        return [4 /*yield*/, typeorm_1.PromiseUtils.runInSequence(databases, function (database) { return queryRunner.createDatabase(database, true); })];
                                    case 1:
                                        _a.sent();
                                        if (!(connection.driver instanceof PostgresDriver_1.PostgresDriver || connection.driver instanceof SqlServerDriver_1.SqlServerDriver)) return [3 /*break*/, 3];
                                        schemaPaths_1 = [];
                                        connection.entityMetadatas
                                            .filter(function (entityMetadata) { return !!entityMetadata.schemaPath; })
                                            .forEach(function (entityMetadata) {
                                            var existSchemaPath = schemaPaths_1.find(function (path) { return path === entityMetadata.schemaPath; });
                                            if (!existSchemaPath)
                                                schemaPaths_1.push(entityMetadata.schemaPath);
                                        });
                                        schema = connection.driver.options.schema;
                                        if (schema && schemaPaths_1.indexOf(schema) === -1)
                                            schemaPaths_1.push(schema);
                                        return [4 /*yield*/, typeorm_1.PromiseUtils.runInSequence(schemaPaths_1, function (schemaPath) { return queryRunner.createSchema(schemaPath, true); })];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3: return [4 /*yield*/, queryRunner.release()];
                                    case 4:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, connections];
            }
        });
    });
}
exports.createTestingConnections = createTestingConnections;
/**
 * Closes testing connections if they are connected.
 */
function closeTestingConnections(connections) {
    return Promise.all(connections.map(function (connection) { return connection.isConnected ? connection.close() : undefined; }));
}
exports.closeTestingConnections = closeTestingConnections;
/**
 * Reloads all databases for all given connections.
 */
function reloadTestingDatabases(connections) {
    return Promise.all(connections.map(function (connection) { return connection.synchronize(true); }));
}
exports.reloadTestingDatabases = reloadTestingDatabases;
/**
 * Setups connection.
 *
 * @deprecated Old method of creating connection. Don't use it anymore. Use createTestingConnections instead.
 */
function setupConnection(callback, entities) {
    return function () {
        return typeorm_1.createConnection(setupSingleTestingConnection("mysql", { entities: entities }))
            .then(function (connection) {
            if (callback)
                callback(connection);
            return connection;
        });
    };
}
exports.setupConnection = setupConnection;
/**
 * Generates random text array with custom length.
 */
function generateRandomText(length) {
    var text = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i <= length; i++)
        text += characters.charAt(Math.floor(Math.random() * characters.length));
    return text;
}
exports.generateRandomText = generateRandomText;
function sleep(ms) {
    return new Promise(function (ok) {
        setTimeout(ok, ms);
    });
}
exports.sleep = sleep;
//# sourceMappingURL=test-utils.js.map