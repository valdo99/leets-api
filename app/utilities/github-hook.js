const crypto = require("crypto");
const github = require("simple-git")();
const { exec } = require("child_process");

const logger = require("./logger");

const tagLabel = "githubHook";

const restartApplication = () => {
	logger.info("Restarting process");
	restartApplicationFn();
};

let GITHUB_HOOK_SECRET;
let restartApplicationFn;

let isInit = false;

const init = (_GITHUB_HOOK_SECRET, _restartApplicationFn = () => { }) => {
	GITHUB_HOOK_SECRET = _GITHUB_HOOK_SECRET;
	restartApplicationFn = _restartApplicationFn;
	isInit = true;
};

const controller = async (req, res) => {
	if (!isInit) {
		return logger.error("Github hook needs to be initialized!", { tagLabel });
	}

	const sign = req.headers["x-hub-signature"];

	const hash =
		`sha1=${crypto
			.createHmac("sha1", GITHUB_HOOK_SECRET)
			.update(JSON.stringify(req.body))
			.digest("hex")}`;

	if (hash !== sign) {
		logger.info("Unable to pull, hash and signature do not match", {
			hash: hash,
			signature: sign,
		});
		return res.send("KO");
	}

	res.send("OK");

	try {
		logger.debug("Fetching repo", { tagLabel });
		await github.fetch(["--all"]);

		logger.debug("Hard reset", { tagLabel });
		await github.reset("hard");

		logger.debug("Pulling repo", { tagLabel });
		const response = await github.pull();
		logger.debug("", { response });
		logger.debug("Pull completed", {
			summary: response.summary,
			files: response.files,
			tagLabel,
		});

		if (response.files.length && response.files.indexOf("package.json") >= 0) {
			logger.debug("Running NPM install", { tagLabel });

			exec("npm install", (err, stdout, stderr) => {
				if (err) {
					logger.error("Can't update with NPM", err);
					return restartApplication();
				}

				logger.debug("NPM packages updated");

				restartApplication();
			});
		} else { restartApplication(); }
	} catch (error) {
		logger.error("Error during execution", { tagLabel, error });
	}
};

module.exports = { init, controller };
