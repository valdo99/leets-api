const mongoose = require('mongoose');
const publicFields = require("../plugins/public-fields");


const SENT_STATUS = 0;
const VIEWED_STATUS = 1;


const NotificationSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true
        },
        title: {
            type: String
        },
        status: {
            type: Number,
            enum: [SENT_STATUS, VIEWED_STATUS],
            default: SENT_STATUS
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        data: {
            targetView: { type: String },
            payload: { type: String }
        },

    },
    { collection: 'notifications', timestamps: true });

NotificationSchema.statics.SENT_STATUS = SENT_STATUS;
NotificationSchema.statics.VIEWED_STATUS = VIEWED_STATUS;

NotificationSchema.statics.create = async function (text, title = null, user, data = null) {
    const n = new this({ text, title, user, data });
    await n.save();
    return n;
};


NotificationSchema.plugin(publicFields, [
    "_id",
    "text",
    "title",
    "status",
    "data"
]);

module.exports = exports = mongoose.model("Notifications", NotificationSchema);
