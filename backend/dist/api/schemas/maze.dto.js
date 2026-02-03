"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MazeIdParams = void 0;
const zod_1 = require("zod");
exports.MazeIdParams = zod_1.z.object({
    mazeId: zod_1.z.coerce.number().int().nonnegative()
});
