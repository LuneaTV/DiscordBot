const { createLogger, transports, format } = require("winston");
const winston = require("winston");

let customlevels = {
    levels: {
        error: 3,
        warn: 4,
        info: 7,
        mod: 7,
        debug: 9
    }
};

const logger = createLogger({
    level: "debug",
    levels: customlevels.levels,
    format: format.combine(
        format.timestamp({
            format: "DD/MM - HH:mm",
        }),
        format.printf(
            (info) => `\x1b[33m(${info.level}) ` + `\x1b[35m[${info.timestamp}]` + `: \x1b[0m${info.message}`
        )
    ),
    transports: [
        new transports.Console({ level: "warn" }),
        new transports.Console({ level: "info" }),
        new transports.Console({ level: "error" }),
        new transports.File({ filename: `/var/log/LUNBot/info.log`, level: "info" }),
        new transports.File({ filename: `/var/log/LUNBot/warn.log`, level: "warn" }),
        new transports.File({ filename: `/var/log/LUNBot/error.log`, level: "error" }),
        new transports.File({ filename: `/var/log/LUNBot/mod.log`, level: "error" }),
        new transports.File({ filename: `/var/log/LUNBot/all.log`, level: "mod" }),
        new transports.File({ filename: `/var/log/LUNBot/all.log`, level: "info" }),
        new transports.File({ filename: `/var/log/LUNBot/all.log`, level: "warn" }),
        new transports.File({ filename: `/var/log/LUNBot/all.log`, level: "error" }),
    ],
});

module.exports = logger;