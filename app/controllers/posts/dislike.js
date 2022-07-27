const mongoose = require('mongoose');
const Post = mongoose.model("Post")
const tagLabel = "likePostProtectedController";

new utilities.express.Service(tagLabel)
    .isPost()
    .respondsAt('/posts/:id/dislike')
    .controller(async (req, res) => {
        const {id} = req.params;

        Post.findLikes(req.locals.user._id, {_id:id}, function(err, likes) {
            if (err) {
                return res.forbidden("error")
            }
            var hasNotLiked = !likes.length;

            if(hasNotLiked){
                return res.forbidden("user cant like the post")
            }

            Post.cancelLike(id, req.locals.user._id, function(err) {
                if(err){
                    return res.forbidden("error")
                }
             });

             return res.resolve()
        });


    });
