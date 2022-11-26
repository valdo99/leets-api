const mongoose = require("mongoose");

const Comments = mongoose.model("Comment");
const Post = mongoose.model("Post");
const Notifications = mongoose.model("Notifications");


const tagLabel = "save-comment-controller";

new utilities.express.Service(tagLabel)
    .isPost()
    .respondsAt("/comments/song/:id")
    .controller(async (req, res) => {
        const { comment } = req.body;

        const post = await Post.findById(req.params.id);

        if (!post) { return res.forbidden("error"); }

        const newComment = new Comments({
            user: req.locals.user._id,
            post: req.params.id,
            comment
        });

        await newComment.save();

        if (post.hunter.toString() !== req.locals.user._id.toString()) {
            await Notifications.create({
                asset_type: Notifications.ASSETNOTIFICATION.COMMENT,
                user: post.hunter,
                asset: newComment._id,
                user_from: req.locals.user._id,
            });

        }




        res.resolve(newComment);
    });
