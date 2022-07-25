const mongoose = require('mongoose');
const Post = mongoose.model("Post");
const User = mongoose.model("User");
const Artist = mongoose.model("Artist");
const axios = require("axios")

const tagLabel = "uploadSpotifyLinkProtectedController";

var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET,"ascii"
        ).toString("base64"),
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
    },

    form: {
      grant_type: "client_credentials",
    },
    json: true,
  };

// TODO save token to db
//      for each call, look if token has expired
//      if not use the stored one, else create new token
const getToken = async () => {
        const res = await axios({
            url:authOptions.url,
            method:"POST",
            params:authOptions.form,
            headers:authOptions.headers
        })

        return res.data.access_token;
}

const getTrackData = async ({token,id}) => {
        const res = await axios({
            url:`https://api.spotify.com/v1/tracks/${id}`,
            method:"GET",
            headers:{
                ...authOptions,
                Authorization: `Bearer ${token}`
            }
        })

        return res.data

}

const getArtistData = async ({token,id}) => {
    const res = await axios({
        url:`https://api.spotify.com/v1/artists/${id}`,
        method:"GET",
        headers:{
            ...authOptions,
            Authorization: `Bearer ${token}`
        }
    })

    return res.data

}

new utilities.express.Service(tagLabel)
    .isPost()
    .isPublic()
    .respondsAt('/posts/upload')
    .controller(async (req, res) => {
       const token = await getToken();
       const { id } = req.body;

       const {name: title, preview_url, artists, album} = await getTrackData({id,token})

       const artistData = await getArtistData({id:artists[0].id, token});
       const image = album.images[0].url 

       //TODO check if artist is in DB

       // IF NOT save artist in db

       // create new Post

       

       res.resolve({
        artistData
       })
    });
