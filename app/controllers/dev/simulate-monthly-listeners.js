const mongoose = require('mongoose');
const Post = mongoose.model("Post");
const tagLabel = "simulateMonthlyListenersControllerDEV";

new utilities.express.Service(tagLabel)
    .isPost()
    .respondsAt('/dev/simulate-monthly-listeners/:id')
    .controller(async (req, res) => {
        const { id } = req.params;

        const post = await Post.findOne({ _id: id })

        if (!post) {
            return res.notFound()
        }

        const agenda = utilities.dependencyLocator.get('agenda');
        await agenda.now("monthly listeners", { post })


        res.resolve()

    });
