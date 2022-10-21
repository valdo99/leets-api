const appRoot = require("app-root-path").path;
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;
const process = require("process");
const chalk = require("chalk");

require("winston-daily-rotate-file");

function censor(censor) {
	let i = 0;

	return function (key, value) {
		// eslint-disable-next-line eqeqeq
		if (
			i !== 0 &&
			typeof censor === "object" &&
			typeof value === "object" &&
			censor === value
		) {
			return "[Circular]";
		}

		if (i >= 29) { return "[Unknown]"; }

		++i;

		return value;
	};
}

const extractRelevant = (info) => {
	if (typeof info !== "object") { return info; }

	let obj = {};

	for (let key in info) {
		if (info.hasOwnProperty(key)) {
			if (key === "error") {
				if (info[key] instanceof Error) {
					obj[key] =
						typeof info[key] === "object"
							? JSON.stringify(info[key], Object.getOwnPropertyNames(info[key]))
							: info[key];
				} else { obj[key] = info[key]; }
			} else if (
				key !== "level" &&
				key !== "message" &&
				key !== "timestamp" &&
				key !== "tagLabel"
			) {
				obj[key] = info[key];
			}
		}
	}

	if (Object.keys(obj).length === 0) { return ""; }

	return JSON.stringify(obj, censor(obj));
};

const cFormat = printf((info) => {
	let level =
		info.level === "debug"
			? chalk.yellow(info.level.toUpperCase())
			: info.level === "info"
				? chalk.green(info.level.toUpperCase())
				: info.level === "error"
					? chalk.red(info.level.toUpperCase())
					: chalk.magenta(info.level.toUpperCase());

	if (info.tagLabel) { level += ` - ${info.tagLabel}`; }

	if (typeof info.message === "object") {
		info.message = JSON.stringify(info.message);
	}

	return (
		`${info.timestamp} ${chalk.blue(process.title)}(${process.pid}) [${level}] : ${info.message}  ${extractRelevant(info)}`
	);
});

const fFormat = printf((info) => {
	return JSON.stringify({
		process: process.title,
		pid: process.pid,
		level: info.level,
		tagLabel: info.tagLabel || null,
		timestamp: info.timestamp,
		message: info.message,
		payload: extractRelevant(info),
	});
});

const options = {
	fileInfo: {
		level: "info",
		handleExceptions: true,
		json: true,
		filename: `${appRoot}/logs/app-%DATE%.log`,
		datePattern: "YYYY-MM-DD",
		zippedArchive: false,
		maxSize: "20m",
		maxFiles: "14d",
		format: combine(timestamp(), format.splat(), format.simple(), fFormat),
	},

	fileHttp: {
		level: "info",
		filename: `${appRoot}/logs/http-%DATE%.log`,
		handleExceptions: true,
		datePattern: "YYYY-MM-DD",
		zippedArchive: false,
		maxSize: "20m",
		maxFiles: "14d",
		format: combine(format.json()),
	},

	fileError: {
		level: "error",
		filename: `${appRoot}/logs/error-%DATE%.log`,
		handleExceptions: true,
		json: true,
		datePattern: "YYYY-MM-DD",
		zippedArchive: false,
		maxSize: "20m",
		maxFiles: "14d",
		format: combine(timestamp(), format.splat(), format.simple(), fFormat),
	},

	console: {
		level: "debug",
		handleExceptions: true,
		json: false,
		format: combine(timestamp(), format.splat(), format.simple(), cFormat),
	},
};

let logger = createLogger({
	transports: [
		new transports.DailyRotateFile(options.fileInfo),
		new transports.DailyRotateFile(options.fileError),
		new transports.Console(options.console),
	],
	exitOnError: false,
});

let expressLogger = createLogger({
	transports: [new transports.DailyRotateFile(options.fileHttp)],
});

logger.stream = {
	write: function (message, encoding) {
		expressLogger.info(message);
	},
};

logger.genTag = (name) => {
	return `${name} (${Math.random().toString(36).substring(8)})`;
};

module.exports = logger;
