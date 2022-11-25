const mongoose = require("mongoose");
const Comments = mongoose.model("Comment");
const tagLabel = "comments-list-public-controller";

const PER_PAGE = 20;

new utilities.express.Service(tagLabel)
    .isGet()
    .isPublic()
    .respondsAt("/comments/song/:id")
    .controller(async (req, res) => {
        const { id } = req.params;
        const createdAt = 1;

        let page = parseInt(req.query.page);
        if (isNaN(page)) { page = 0; }

        const query = {
            post: id,
        };

        const comments = await Comments.find(query)
            .select("createdAt _id user comment")
            .populate({
                path: "user",
                model: "User",
                select: "_id name surname username",
            })
            .sort({ createdAt })
            .skip(page * PER_PAGE)
            .limit(PER_PAGE);

        res.setPagination({
            total: await Comments.countDocuments(query),
            perPage: PER_PAGE,
            page,
        });

        return res.resolve(comments);
    });
