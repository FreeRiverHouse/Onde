"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.createLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, printf, colorize } = winston_1.default.format;
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});
const createLogger = (service) => {
    return winston_1.default.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        defaultMeta: { service },
        format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
        transports: [
            new winston_1.default.transports.Console({
                format: combine(colorize(), logFormat),
            }),
        ],
    });
};
exports.createLogger = createLogger;
exports.logger = (0, exports.createLogger)('onde');
//# sourceMappingURL=logger.js.map