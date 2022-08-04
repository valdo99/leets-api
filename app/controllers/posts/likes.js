const mongoose = require('mongoose');
const Post = mongoose.model("Post")
const tagLabel = "likePostProtectedController";

new utilities.express.Service(tagLabel)
    .isPost()
    .isPublic()
    .respondsAt('/posts/:id/likes')
    .controller(async (req, res) => {
        const {id} = req.params;

        const post = await Post.findOne({_id:id}).select("users likes").populate({
            path:"users",
            model:"User",
            select:"username name surname"
        });

        if(!post){
            return res.notFound();
        }

        return res.resolve(post)


    });
