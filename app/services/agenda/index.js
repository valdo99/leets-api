const Agenda = require("agenda");

const tagLabel = "agenda";

utilities.dependencyLocator.register(
	tagLabel,
	(() => {
		const agenda = new Agenda({
			db: {
				address: process.env.DB_SERVER,
				collection: "jobs",
				options: {
					useUnifiedTopology: true,
					useNewUrlParser: true,
				},
			},
		});

		agenda.on("fail", (err, job) => {
			console.log(">>>>", err, job);
			api.logger.error("Job failed with error", {
				error: err.message,
				job: job.attrs.name,
				tagLabel: tagLabel,
			});
		});

		return agenda;
	})(),
);
