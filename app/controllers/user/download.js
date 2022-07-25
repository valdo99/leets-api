const mongoose = require('mongoose');

const User = mongoose.model('User');

const tagLabel = "usersDownloadController";

new utilities.express.Service(tagLabel)
    .isPost()
    .respondsAt('/users/download')
    .controller(async (req, res) => {
        if(!req.locals.user.isAdmin) res.forbidden();

        const users = await User.find({}).select("name surname email phoneNumber CAP address city province taxId createdAt").lean();

        res.resolveAsCSV(users);
    });