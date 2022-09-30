const mongoose = require('mongoose');
const Post = mongoose.model("Post");
const Artist = mongoose.model("Artist");
const AccessToken = mongoose.model("AccessToken");
const axios = require("axios");
const moment = require('moment');

const tagLabel = "uploadSpotifyLinkProtectedController";

const MAX_SONGS_PER_ARTIST_PER_MONTH = 3

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
    grant_type: "client_credentials",
  },
  json: true,
};

const getToken = async () => {
  const token = await AccessToken.findOne({
    validTill: { $gte: moment().subtract(6, 'seconds').toISOString() }
  })

  if (token) {
    return token.token
  }

  const res = await axios({
    url: authOptions.url,
    method: "POST",
    params: authOptions.form,
    headers: authOptions.headers
  })

  const newAccessToken = new AccessToken({
    token: res.data.access_token,
    type: res.data.token_type,
    validTill: moment().add(res.data.expires_in, 'seconds').toISOString()
  })

  await newAccessToken.save()
  return res.data.access_token;
}

const getTrackData = async ({ token, id }) => {
  const res = await axios({
    url: `https://api.spotify.com/v1/tracks/${id}`,
    method: "GET",
    headers: {
      ...authOptions,
      Authorization: `Bearer ${token}`
    }
  })

  return res.data

}

const getArtistData = async ({ token, id }) => {
  const res = await axios({
    url: `https://api.spotify.com/v1/artists/${id}`,
    method: "GET",
    headers: {
      ...authOptions,
      Authorization: `Bearer ${token}`
    }
  })

  return res.data

}

new utilities.express.Service(tagLabel)
  .isPost()
  .respondsAt('/posts/upload')
  .controller(async (req, res) => {
    const { id } = req.body;

    const post = await Post.findOne({ spotify_id: id, status: "CREATED", hunter: req.locals.user._id }).populate({
      path: "artist",
      model: "Artist"
    })

    if (!post)
      return res.forbidden(i18n.__("PREVIEW_NOT_UPLOADED"))

    post.status = "UPLOADED";

    await post.save();


    const agenda = utilities.dependencyLocator.get('agenda');
    await agenda.now("monthly listeners", { post })

    res.resolve(post)
  });
