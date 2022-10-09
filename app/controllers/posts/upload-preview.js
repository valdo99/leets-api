const mongoose = require('mongoose');
const Post = mongoose.model("Post");
const Artist = mongoose.model("Artist");
const AccessToken = mongoose.model("AccessToken");
const axios = require("axios");
const moment = require('moment');

const tagLabel = "uploadSpotifyLinkProtectedController";

const MAX_SONGS_PER_ARTIST_PER_WEEK = 5

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

const getSongsByArtistInLastWeek = async (artistId) => {
    return await Post.find({ artist: artistId, status: "ONLINE", createdAt: { $gte: new Date(moment().subtract(1, "week")) } })
}

new utilities.express.Service(tagLabel)
    .isPost()
    .respondsAt('/posts/upload/preview')
    .controller(async (req, res) => {
        const token = await getToken();
        const { id } = req.body;

        const existingPost = await Post.findOne({ spotify_id: id }).populate({
            path:"artist",
            model:"Artist"
        });

        if (existingPost && ["UPLOADED", "ONLINE"].includes(existingPost.status))
            return res.forbidden(i18n.__("SONG_ALREADY_UPLOADED"))

        if (existingPost) {
            // Check max number of weekly songs for the artists hasn't been reached
            const artistPosts = await getSongsByArtistInLastWeek(existingPost.artist._id);
            if (artistPosts.length >= MAX_SONGS_PER_ARTIST_PER_WEEK) {
                return res.forbidden(i18n.__("MAX_SONGS_PER_ARTIST_REACHED", { max: MAX_SONGS_PER_ARTIST_PER_WEEK }))
            }    
            return res.resolve(existingPost);
        }


        const { name: title, preview_url, artists, album } = await getTrackData({ id, token })

        const {
            name: artistName,
            followers: artistFollowers
        } = await getArtistData({ id: artists[0].id, token });

        const { getArtist, getTrack } = utilities.dependencyLocator.get('spotify');

        const { playcount, artistsWithRoles, albumOfTrack } = (await getTrack(id)).trackUnion

        const artistId = artistsWithRoles.items.filter(el => el.role === "MAIN")[0].artist.id;
        const artistData = await getArtist(artistId);

        const monthlyListeners = artistData.stats.monthlyListeners

        if (monthlyListeners > 35000)
            return res.forbidden(i18n.__("MAX_LISTENERS_PER_ARTIST", { max: 35000 }))


        const postImage = album.images[0].url

        let artist;

        artist = await Artist.findOne({ spotify_id: artistId });

        if (!artist) {
            artist = new Artist({
                name: artistName,
                image: artistData.visuals.avatarImage?.sources[0].url,
                followers: artistFollowers.total,
                spotify_id: artistId,
                // hunter: req.locals.user._id,
                // headerImage: artistData.visuals.headerImage?.sources[0].url,
                // biography: artistData.profile.biography.text,
                // topCities: artistData.stats.topCities.items,
                // monthly_listeners: monthlyListeners
            })
            await artist.save()
        }

        // Check max number of weekly songs for the artists hasn't been reached
        const artistPosts = await getSongsByArtistInLastWeek(artist._id);

        if (artistPosts.length >= MAX_SONGS_PER_ARTIST_PER_WEEK) {
            return res.forbidden(i18n.__("MAX_SONGS_PER_ARTIST_REACHED", { max: MAX_SONGS_PER_ARTIST_PER_WEEK }))
        }

        const newPost = new Post({
            title,
            image: postImage,
            preview_url,
            spotify_id: id,
            artist: artist._id.toString(),
            playcount,
            uploadedAt: albumOfTrack.date.isoString
        })

        await (await newPost.save()).populate({
            path: "artist",
            model: "Artist"
        })

        res.resolve(newPost);
    });
