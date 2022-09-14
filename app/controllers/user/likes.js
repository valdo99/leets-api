const mongoose = require('mongoose');

const Users = mongoose.model('User');
const Posts = mongoose.model('Post');


const tagLabel = "userUploadsReadPublicController";

new utilities.express.Service(tagLabel)
    .isGet()
    .respondsAt('/users/:username/uploads')
    .isPublic()
    .controller(async (req, res) => {

        const user = await Users.findOne({ username: req.params.username });
        if (!user) {
            return res.notFound("User not found");

        }
        const likes = await Posts.find({ users: user._id }).populate({
            path: "artist",
            model: "Artist"
        })


        res.resolve(likes);

    });