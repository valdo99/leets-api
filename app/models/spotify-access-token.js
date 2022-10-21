const mongoose = require("mongoose");

const mongooseErrors = require("../utils/mongoose-errors");

const AccessToken = new mongoose.Schema(
	{
		token: {
			type: String,
		},
		type: {
			type: String,
		},
		validTill: {
			type: Date,
		},
	},
	{
		collection: "accessToken",
		timestamps: true,
		toJSON: { getters: true },
	},
);

AccessToken.plugin(mongooseErrors);

module.exports = exports = mongoose.model("AccessToken", AccessToken);
