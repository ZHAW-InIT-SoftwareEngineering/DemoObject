"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("../app"));
const config_1 = require("../config/config");
const mongo_1 = require("../db/mongo");
app_1.default.set('port', config_1.PORT);
const server = http_1.default.createServer(app_1.default);
async function start() {
    await (0, mongo_1.connectToDb)();
}
start().catch((err) => {
    console.error("Failed to start MongoDB:", err);
    process.exit(1);
});
server.listen(config_1.PORT, () => {
    console.log(`Server running on http://localhost:${config_1.PORT}`);
});
