const mongoose = require("mongoose");

const publicFields = require("../plugins/public-fields");
const mongooseErrors = require("../utils/mongoose-errors");

const LikeSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		post: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
		},
	},
	{
		collection: "likes",
		timestamps: true,
		toJSON: { getters: true },
	},
);

LikeSchema.plugin(publicFields, ["_id", "user", "post"]);

LikeSchema.index({ user: 1, post: 1 }, { unique: true });

LikeSchema.plugin(mongooseErrors);

module.exports = exports = mongoose.model("Like", LikeSchema);
