const mongoose = require('mongoose');
const publicFields = require("../plugins/public-fields");


const SENT_STATUS = 0;
const VIEWED_STATUS = 1;

const ASSETNOTIFICATION = {
    LIKE: "Like",
    COMMENT: "Comment",
}

const NotificationSchema = new mongoose.Schema(
    {
        asset_type: {
            type: String,
            enum: [ASSETNOTIFICATION.LIKE, ASSETNOTIFICATION.COMMENT],
            required: true,
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
        user_from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        asset: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'asset_type'
        }

    },
    { collection: 'notifications', timestamps: true });

NotificationSchema.statics.SENT_STATUS = SENT_STATUS;
NotificationSchema.statics.VIEWED_STATUS = VIEWED_STATUS;
NotificationSchema.statics.ASSETNOTIFICATION = ASSETNOTIFICATION;

NotificationSchema.statics.create = async function ({ asset_type, user, asset, user_from }) {
    const n = new this({ asset_type, user, asset, user_from });
    await n.save();
    return n;


};


NotificationSchema.plugin(publicFields, [
    "_id",
    "asste_type",
    "asset",
    "user_from",
]);

module.exports = exports = mongoose.model("Notifications", NotificationSchema);
