const mongoose = require("mongoose");

const publicFields = require("../plugins/public-fields");
const mongooseErrors = require("../utils/mongoose-errors");

const STATUS_CREATED = "CREATED";
const STATUS_UPLOADED = "UPLOADED";
const STATUS_ONLINE = "ONLINE";



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
            enum: [STATUS_CREATED, STATUS_UPLOADED, STATUS_ONLINE],
            default: "CREATED"
        },
        playcount: {
            type: Number
        },
        uploadedAt: {
            type: Date
        }

    },
    {
        collection: "posts",
        timestamps: true,
        toJSON: { getters: true }
    }
);

PostSchema.statics.STATUS_CREATED = STATUS_CREATED;
PostSchema.statics.STATUS_UPLOADED = STATUS_UPLOADED;
PostSchema.statics.STATUS_ONLINE = STATUS_ONLINE;
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