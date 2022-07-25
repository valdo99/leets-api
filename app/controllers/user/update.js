const mongoose = require('mongoose');

const Users = mongoose.model('User');


const tagLabel = "userUpdateController";

const editableKeys = [
    "_id",
    "name",
    "surname",
    "isAdmin",
    "taxId",
    "phoneNumber",
    "city",
    "CAP",
    "province",
    "address",
];

new utilities.express.Service(tagLabel)
    .isPut()
    .respondsAt('/users/me')
    .controller(async (req, res) => {

        Object.keys(req.body).forEach(key => { if(editableKeys.indexOf(key) < 0) throw new ForbiddenError("\"" + key + "\" cannot be edited");});
        const user = await Users.findOneAndUpdate({ _id: req.locals.user._id }, {$set: req.body }, { new: true, upsert: false, runValidators: true });
        res.resolve(user);


    });