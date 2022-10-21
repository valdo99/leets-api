const queryString = require('query-string');
const axios = require("axios");
var redirect_uri = 'http://localhost:8088/spotify-callback';


const tagLabel = "spotify-login-controller";

new utilities.express.Service(tagLabel)
    .isGet()
    .isPublic()
    .respondsAt('/spotify-callback')
    .controller(async (req, res) => {
        var code = req.query.code || null;
        var state = req.query.state || null;

        if (state === null) {
            return res.redirect(process.env.APP_URL +
                queryString.stringify({
                    error: 'state_mismatch'
                }));
        }

        var authOptions = {
            url: "https://accounts.spotify.com/api/token",
            headers: {
                Authorization:
                    "Basic " +
                    Buffer.from(
                        process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET, "ascii"
                    ).toString("base64"),
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },

            form: {
                grant_type: "authorization_code",
                code,
                redirect_uri
            },
            json: true,
        };


        const { data } = await axios({
            url: authOptions.url,
            method: "POST",
            params: authOptions.form,
            headers: authOptions.headers
        })
        const userProfile = await axios({
            url: "https://api.spotify.com/v1/me",
            method: "GET",
            headers: {
                Authorization: `${data.token_type} ${data.access_token}`,
                "Accept": "application/json",
            },
            params: {
                grant_type: "client_credentials",
            }
        })



        console.log(userProfile);

    });