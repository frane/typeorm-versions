"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Version_1 = require("../entity/Version");
var VersionSubscriber_1 = require("../subscriber/VersionSubscriber");
function versionsConfig(databaseConfig) {
    var _a, _b;
    (_a = databaseConfig.entities) === null || _a === void 0 ? void 0 : _a.push(Version_1.Version);
    (_b = databaseConfig.subscribers) === null || _b === void 0 ? void 0 : _b.push(VersionSubscriber_1.VersionSubscriber);
    return databaseConfig;
}
exports.versionsConfig = versionsConfig;
;
//# sourceMappingURL=index.js.map