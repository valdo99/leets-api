process.name = "clearconnecconsole";

require("dotenv").config();
require("./app/utils/i18n");

const term = require("terminal-kit").terminal;
const appRoot = require("app-root-path").path;
const fs = require("fs");
const glob = require("glob");

term.clear();

const menuItems = [];
const scripts = [];

term.white("bootstrapping app...").nextLine();

require("./application-boot");

(async () => {
	term.white("connecting to database...").nextLine();
	const dbConn = await require("./app/utils/db");

	fs.readdirSync(`${appRoot}/scripts`).map((file) => {
		if (fs.lstatSync(`./scripts/${file}`).isDirectory()) {
			return;
		}

		let script;
		try {
			script = require(`./scripts/${file}`);
		} catch (e) {
			throw e;
		}

		menuItems.push(script.name);
		scripts.push(script);
	});

	menuItems.push("[EXIT]");
	scripts.push({ name: "[EXIT]", run: () => process.exit(0) });

	term.clear();

	const patterns = [
		"app/plugins/*.js",
		"app/services/**/index.js",
		"app/services/*.js",
		"app/models/*.js",
	];

	for (const pattern of patterns) {
		try {
			const files = glob.sync(pattern, null);

			for (const filePath of files) {
				require(`./${filePath}`);
			}
		} catch (error) {}
	}

	term.cyan("Commands available:").nextLine();

	term.gridMenu(menuItems, async function (error, response) {
		const script = scripts[response.selectedIndex];
		const inputs = {};

		term("\n").green("Running ").bold.green(script.name).nextLine();

		if (Array.isArray(script.inputs)) {
			for (let i = 0; i < script.inputs.length; i++) {
				const input = script.inputs[i];

				if (input.askIf && !Array.isArray(input.askIf)) {
					input.askIf = [input.askIf];
				}

				if (
					input.askIf &&
					!input.askIf.find(
						(askIf) => inputs[askIf.inputName] === askIf.equalTo,
					)
				) {
					continue;
				}

				term.nextLine();
				term.cyan.bold(`${input.name}?`);

				if (input.type === "text") {
					term.nextLine();
					inputs[input.name] = await term.inputField({
						autoComplete: input.autoComplete || [],
						autoCompleteMenu: true,
					}).promise;
				} else if (input.type === "multiple") {
					inputs[input.name] = (
						await term.singleLineMenu(
							typeof input.options === "function"
								? await input.options()
								: input.options,
						).promise
					).selectedText;
				}
			}
		}

		term.nextLine().nextLine();
		let watchdogTimer = killMeIn5();

		try {
			await script.run(inputs, term, () => {
				clearTimeout(watchdogTimer);
				watchdogTimer = killMeIn5();
			});
		} catch (e) {
			console.log(e);
		}
	});
})();

const killMeIn5 = () =>
	setTimeout(() => {
		console.log("Killed by watchdog...");
		process.exit();
	}, 5000);
