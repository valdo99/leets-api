const tagLabel = "sendLikeNotification";

module.exports = (agenda) =>
    agenda.define("send like notification", { concurrency: 10 }, async (job) => {
        const { like: likeObj } = job.attrs.data;

        const Likes = require("../../../models/likes")
        const Notifications = require("../../../models/notifications")

        const like = await Likes.findOne({ _id: likeObj._id }).populate([{
            path: "post",
            model: "Post",
            populate: {
                path: "hunter",
                model: "User",
            }
        }, {
            path: "user",
            model: "User",
        }]);

        if (!like) {
            return
        }

        //text, title = null, user, data = null
        await Notifications.create(`${like?.user?.username} ha messo "mi piace" a ${like.post.title}`, "Nuovo mi piace", like.post.hunter._id, { targetView: like.post._id })


    });
