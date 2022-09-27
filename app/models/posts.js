const mongoose = require("mongoose");

const publicFields = require("../plugins/public-fields");
const mongooseErrors = require("../utils/mongoose-errors");



const PostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, i18n.__("FIELD_REQUIRED")],
        },
        image: {
            type: String,
        },
        preview_url: {
            type: String,
        },
        spotify_id: {
            type: String,
        },
        hunter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Artist"
        },
        status: {
            type: String,
            enum: ["CREATED", "UPLOADED", "ONLINE"],
            default: "CREATED"
        }

    },
    {
        collection: "posts",
        timestamps: true,
        toJSON: { getters: true }
    }
);

// creare post findOne e inserire all'interno il numero totale dei like


PostSchema.plugin(publicFields, [
    "_id",
    "title",
    "spotify_id",
    "hunter",
    "artist",
    "image",
    "followers",
    "likes",
    "score",
    "likers",
    "users",
    "preview_url",
    "isLiked"
]);


PostSchema.plugin(mongooseErrors);


module.exports = exports = mongoose.model("Post", PostSchema);