const mongoose = require("mongoose");
const validator = require("validator");

const authenticationCapable = require("../plugins/authentication-capable-plugin");

const publicFields = require("../plugins/public-fields");
const mongooseErrors = require("../utils/mongoose-errors");

const ORIGIN = {
	EMAIL: 1,
	GOOGLE: 2,
};

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
		},
		surname: {
			type: String,
		},
		email: {
			type: String,
			lowercase: true,
			unique: true,
			sparse: true,
			trim: true,
			validate: [validator.isEmail, i18n.__("FORM_ERROR_INVALID_EMAIL")],
		},
		username: {
			type: String,
			required: [true, i18n.__("FIELD_REQUIRED")],
			unique: true,
			sparse: true,
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		origin: {
			type: Number,
			enum: [ORIGIN.EMAIL, ORIGIN.GOOGLE],
			default: ORIGIN.EMAIL,
		},
		referral: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		}
	},
	{
		collection: "users",
		timestamps: true,
		toJSON: { getters: true },
	},
);

UserSchema.statics.ORIGIN_EMAIL = ORIGIN.EMAIL;
UserSchema.statics.ORIGIN_GOOGLE = ORIGIN.GOOGLE;

UserSchema.statics.isUsernameTaken = async function (username) {
	const user = await this.findOne({ username });
	if (user) { return true }
	return false;
}


UserSchema.plugin(publicFields, [
	"_id",
	"name",
	"surname",
	"email",
	"isAdmin",
	"username",
]);

UserSchema.plugin(authenticationCapable);

UserSchema.plugin(mongooseErrors);

module.exports = exports = mongoose.model("User", UserSchema);
