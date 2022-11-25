const mongoose = require("mongoose");

const publicFields = require("../plugins/public-fields");
const mongooseErrors = require("../utils/mongoose-errors");

const CommentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
        comment: {
            type: String,
            required: true,
            maxLength: [400, i18n.__("FORM_ERROR_MAX_LENGTH")],
        }
    },
    {
        collection: "comments",
        timestamps: true,
        toJSON: { getters: true },
    },
);

CommentSchema.index({ user: 1, post: 1 });

CommentSchema.plugin(publicFields, ["_id", "user", "post", "comment"]);

CommentSchema.plugin(mongooseErrors);

module.exports = exports = mongoose.model("Comment", CommentSchema);
