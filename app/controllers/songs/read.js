const mongoose = require("mongoose");
const Post = mongoose.model("Post");
const Likes = mongoose.model("Like");
const tagLabel = "songReadController";



new utilities.express.Service(tagLabel)
    .isGet()
    .isPublic()
    .respondsAt("/posts/post/:id")
    .controller(async (req, res) => {

        const post = await Post.findOne({ _id: req.params.id })
            .populate([{
                path: "artist",
                model: "Artist",
            }, {
                path: "hunter",
                model: "User",
            }
            ]);

        if (!post) {
            return res.notFound();
        }

        return res.resolve(post);

    });
