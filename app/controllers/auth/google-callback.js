const queryString = require("query-string");
const axios = require("axios");
var redirect_uri = "http://localhost:8088/google/callback";
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Users = mongoose.model("User");

function replaceAll(str, find, replace) {
	return str.replace(new RegExp(find, "g"), replace);
}

const tagLabel = "google-login-controller";

new utilities.express.Service(tagLabel)
	.isGet()
	.isPublic()
	.respondsAt("/google/callback")
	.controller(async (req, res) => {
		var code = req.query.code || null;
		var error = req.query.error || null;

		if (error !== null) {
			console.log("error ->", error);
			return res.redirect(
				process.env.APP_URL +
				queryString.stringify({
					error: "state_mismatch",
				}),
			);
		}

		var authOptions = {
			url: "https://oauth2.googleapis.com/token",
			form: {
				grant_type: "authorization_code",
				code,
				redirect_uri,
				client_id: process.env.GOOGLE_CLIENT_ID,
				client_secret: process.env.GOOGLE_CLIENT_SECRET,
			},
			json: true,
		};

		const { data } = await axios({
			url: authOptions.url,
			method: "POST",
			data: authOptions.form,
		});
		const decodedUser = jwt.decode(data.id_token);

		const access_token = data.access_token;
		const refresh_token = data.refresh_token;

		let user = await Users.findOne({
			email: decodedUser.email,
		});

		if (user && user.origin === Users.statics.ORIGIN_EMAIL) {
			return res.resolve(
				queryString.stringify({
					error: i18n.__("USER_DIFFERENT_ORIGIN"),
				}),
			);
		}

		if (!user) {
			const newUser = new Users({
				email: decodedUser.email,
				name: decodedUser.given_name,
				surname: decodedUser.family_name,
				origin: 2,
				username: replaceAll(decodedUser.name.trim(), " ", ""),
				emailConfirmation: {
					confirmed: true,
				},
			});
			await newUser.save();
			user = newUser;
		}

		const token = jwt.sign(user.getPublicFields(), process.env.JWT_KEY);

		return res.redirect(`${process.env.APP_URL}/confirm-email?jwt=${token}`);
	});
