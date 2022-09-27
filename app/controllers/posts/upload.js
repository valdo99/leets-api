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
    const token = await getToken();
    const { id } = req.body;

    const existingPost = await Post.findOne({ spotify_id: id })

    if (existingPost && existingPost.status === "CREATED") {
      existingPost.status = "UPLOADED"
      await existingPost.save()
      return res.resolve(existingPost)
    }


    const { name: title, preview_url, artists, album } = await getTrackData({ id, token })

    const {
      id: artistId,
      images: artistImages,
      name: artistName,
      followers: artistFollowers
    } = await getArtistData({ id: artists[0].id, token });

    const postImage = album.images[0].url

    let artist;

    artist = await Artist.findOne({ spotify_id: artistId });


    if (!artist) {
      artist = new Artist({
        name: artistName,
        image: artistImages[0].url,
        followers: artistFollowers.total,
        spotify_id: artistId,
        hunter: req.locals.user._id
      })
      await artist.save()
    }

    const artistPosts = await Post.find({ artist: artist._id, createdAt: { $gte: new Date(moment().subtract(1, "months")) } })

    if (artistPosts.length > MAX_SONGS_PER_ARTIST_PER_MONTH) {
      return res.forbidden(`Non si possono caricare più di ${MAX_SONGS_PER_ARTIST_PER_MONTH} canzoni per artista per mese.`)
    }

    // if the artist exists do we need to block the user to post the track?

    // create new Post

    if (existingPost && (existingPost.status === "UPLOADED" || existingPost.status === "ONLINE")) {
      return res.forbidden("Track già caricato.")
    }

    const newPost = new Post({
      title,
      image: postImage,
      preview_url,
      spotify_id: id,
      hunter: req.locals.user._id,
      artist: artist._id.toString()
    })

    await newPost.save()

    const agenda = utilities.dependencyLocator.get('agenda');
    await agenda.now("monthly listeners", { post: newPost })

    res.resolve(newPost)
  });
