const tagLabel = "healthController";

new utilities.express.Service(tagLabel)
	.isGet()
	.isPublic()
	.respondsAt("/health")
	.controller(async (req, res) => {
		res.resolve();
	});
