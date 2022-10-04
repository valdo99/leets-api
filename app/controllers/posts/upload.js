const mongoose = require('mongoose');
const Post = mongoose.model("Post");
const Artist = mongoose.model("Artist");
const Mailer = require('../../services/mailer');

const tagLabel = "uploadSpotifyLinkProtectedController";

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

    post.status = "ONLINE";
    const artistId = post.artist._id

    await post.save();

    await Artist.findOneAndUpdate({ _id: artistId }, { uploaded: true });


    const mailer = new Mailer();
    await mailer.setTemplate(api.config.email.templates.songUploaded)
      .to(req.locals.user.name, req.locals.user.email)
      .setParams({
        image: post.image,
        title: post.title,
        author: post.artist.name
      })
      .send();

    res.resolve(post)
  });
