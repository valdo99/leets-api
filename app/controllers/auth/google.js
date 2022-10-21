const queryString = require("query-string");
var redirect_uri = "http://localhost:8088/google/callback";
var crypto = require("crypto");

const tagLabel = "google-login-controller";

new utilities.express.Service(tagLabel)
	.isGet()
	.isPublic()
	.respondsAt("/auth/login/google")
	.controller(async (req, res) => {
		var state = crypto.randomBytes(16).toString("hex");
		var scope = "openid email profile";

		res.resolve(
			`https://accounts.google.com/o/oauth2/v2/auth?${queryString.stringify({
				response_type: "code",
				client_id: process.env.GOOGLE_CLIENT_ID,
				scope: scope,
				redirect_uri: redirect_uri,
				state: state,
			})}`,
		);
	});
