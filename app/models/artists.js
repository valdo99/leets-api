const mongoose = require("mongoose");

const publicFields = require("../plugins/public-fields");
const mongooseErrors = require("../utils/mongoose-errors");



const ArtistSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, i18n.__("FIELD_REQUIRED")],
        },
        image: {
            type: String,
        },
        followers: {
            type: Number,
            required: [true, i18n.__("FIELD_REQUIRED")],
        },
        spotify_id: {
            type: String,
        },
        hunter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        monthly_listeners: {
            type: Number,
        },
        biography: {
            type: String,
        },
        headerImage: {
            type: String,
        },
        topCities: {
            type: Array
        },

    },
    {
        collection: "artists",
        timestamps: true,
        toJSON: { getters: true }
    }
);



ArtistSchema.plugin(publicFields, [
    "_id",
    "spotify_id",
    "hunter",
    "name",
    "image",
    "followers",
    "monthly_listeners"
]);


ArtistSchema.plugin(mongooseErrors);


module.exports = exports = mongoose.model("Artist", ArtistSchema);