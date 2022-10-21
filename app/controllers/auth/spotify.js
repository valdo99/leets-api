const queryString = require("query-string");
var redirect_uri = "http://localhost:8088/spotify-callback";
var crypto = require("crypto");

const tagLabel = "spotify-login-controller";

new utilities.express.Service(tagLabel)
	.isGet()
	.isPublic()
	.respondsAt("/auth/login/spotify")
	.controller(async (req, res) => {
		var state = crypto.randomBytes(16).toString("hex");
		var scope = "user-read-private user-read-email";

		res.resolve(
			`https://accounts.spotify.com/authorize?${queryString.stringify({
				response_type: "code",
				client_id: process.env.SPOTIFY_CLIENT_ID,
				scope: scope,
				redirect_uri: redirect_uri,
				state: state,
			})}`,
		);
	});
