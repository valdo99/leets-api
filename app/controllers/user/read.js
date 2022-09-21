const mongoose = require('mongoose');

const Users = mongoose.model('User');
const Posts = mongoose.model('Post');


const tagLabel = "userReadPublicController";

new utilities.express.Service(tagLabel)
    .isGet()
    .respondsAt('/users/:username')
    .isPublic()
    .controller(async (req, res) => {

        const user = await Users.findOne({
            username: req.params.username,
            "emailConfirmation.confirmed": true
            // emailConfirmation: { confirmed: true }
        }).select("_id username createdAt name surname");

        if (!user) {
            return res.notFound("User not found");
        }


        res.resolve(user);

    });
