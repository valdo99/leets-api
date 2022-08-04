const mongoose = require('mongoose');
const Post = mongoose.model("Post");
const tagLabel = "likePostProtectedController";

new utilities.express.Service(tagLabel)
    .isPost()
    .respondsAt('/posts/:id/like')
    .controller(async (req, res) => {
        const {id} = req.params;

        Post.findLikes(req.locals.user._id, {_id:id}, function(err, likes) {
            if (err) {
                console.log(err);

                return res.forbidden("error");
            }
            let hasLiked = !!likes.length;

            if(hasLiked){
                return res.resolve();
            }

            Post.like(id, req.locals.user._id, function(err) {
                if(err){
                    console.log(err);

                    return res.forbidden("error");
                }
            });

            return res.resolve();
        });


    });
