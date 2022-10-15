const mongoose = require('mongoose');

const Artist = mongoose.model('Artist');


const tagLabel = "artistReadPublicController";

new utilities.express.Service(tagLabel)
    .isGet()
    .respondsAt('/artists/:id')
    .isPublic()
    .controller(async (req, res) => {

        const artist = await Artist.findOne({
            artist: req.params.id,
        }).populate(["hunter"])

        if (!artist) {
            return res.notFound(i18n.__("USER_NOT_FOUND"));
        }


        res.resolve(artist);

    });
