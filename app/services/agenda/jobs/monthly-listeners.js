const tagLabel = 'checkIfSongUploadedJob';

module.exports = agenda =>

    agenda.define('Check if song uploaded', { concurrency: 10 }, async job => {

        const { post: previewPost } = job.attrs.data;

        const mongoose = require('mongoose');
        const Artist = mongoose.model("Artist");
        const Post = mongoose.model("Post");

        const post = await Post.findOne({ _id: previewPost._id, status: "CREATED" });

        if (!post)
            await Artist.findOneAndDelete({ _id: post.artist, uploaded: false });

    });


