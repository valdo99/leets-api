const mongoose = require('mongoose');
const Likes = mongoose.model("Like")
const tagLabel = "likePostProtectedController";

const PER_PAGE = 20;

new utilities.express.Service(tagLabel)
    .isGet()
    .isPublic()
    .respondsAt('/posts/:id/likes')
    .controller(async (req, res) => {
        const { id } = req.params;
        const { createdAt = -1 } = req.query;

        let page = parseInt(req.query.page);
        if (isNaN(page)) page = 0;

        const query = {
            post: id,
        }


        const likes = await Likes.find(query).select("createdAt _id user ").populate({
            path: "user",
            model: "User",
            select: "_id name surname username"
        }).sort({ createdAt })
            .skip(page * PER_PAGE)
            .limit(PER_PAGE);

        res.setPagination({
            total: await Likes.countDocuments(query),
            perPage: PER_PAGE,
            page
        });

        return res.resolve(likes)


    });
