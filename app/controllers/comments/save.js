const mongoose = require("mongoose");

const Comments = mongoose.model("Comment");

const tagLabel = "save-comment-controller";

new utilities.express.Service(tagLabel)
    .isPost()
    .respondsAt("/comments/song/:id")
    .controller(async (req, res) => {
        const { comment } = req.body;

        const newComment = new Comments({
            user: req.locals.user._id,
            post: req.params.id,
            comment
        });

        await newComment.save();

        res.resolve(newComment);
    });
