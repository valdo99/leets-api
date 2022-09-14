const mongoose = require('mongoose');

const Users = mongoose.model('User');
const Posts = mongoose.model('Post');


const tagLabel = "userReadPublicController";

new utilities.express.Service(tagLabel)
    .isGet()
    .respondsAt('/users/:username')
    .isPublic()
    .controller(async (req, res) => {

        const user = await Users.findOne({ username: req.params.username }).select("_id username createdAt name surname");
        const likes = await Posts.find({ users: user._id }).count()
        const hunts = await Posts.find({ hunter: user._id }).count()
        if (!user) {
            return res.notFound("User not found");
        }

        res.resolve({ user, hunts, likes });

    });