

const tagLabel = "healthController";

new utilities.express.Service(tagLabel)
    .isPost()
    .isPublic()
    .respondsAt('/health')
    .controller(async (req, res) => {

        res.resolve();

    });