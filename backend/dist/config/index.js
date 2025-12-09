"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = void 0;
const dotenv = require('dotenv');
// TODO: somehow this is not working
dotenv.load();
exports.PORT = process.env.PORT || 3000;
