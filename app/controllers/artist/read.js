const mongoose = require('mongoose');

const Artist = mongoose.model('Artist');


const tagLabel = "artistReadPublicController";

new utilities.express.Service(tagLabel)
    .isGet()
    .respondsAt('/artists/:id')
    .isPublic()
    .controller(async (req, res) => {

        const artist = await Artist.findById(req.params.id).populate([{ path: "hunter", select: "username name surname createdAt _id" }])

        if (!artist) {
            return res.notFound(i18n.__("USER_NOT_FOUND"));
        }


        res.resolve(artist);

    });
