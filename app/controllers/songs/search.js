const mongoose = require("mongoose");
const Post = mongoose.model("Post");
const tagLabel = "search-song-controller";


const PER_PAGE = 7


new utilities.express.Service(tagLabel)
    .isGet()
    .isPublic()
    .respondsAt("/posts/search")
    .controller(async (req, res) => {

        const searchQuery = req.query.query;

        let page = parseInt(req.query.page);
        if (isNaN(page)) { page = 0; }

        let perPage = parseInt(req.query.perPage);
        if (isNaN(perPage) || perPage > 30 || perPage < 1) { perPage = PER_PAGE; }


        const query = { title: { '$regex': searchQuery, '$options': 'i' } };

        const post = await Post.find(query)
            .skip(page * perPage)
            .limit(perPage)
            .select("title hunter artist image")
            .populate([{
                path: "artist",
                model: "Artist",
                select: "_id name image",
            }, {
                path: "hunter",
                model: "User",
                select: "_id name surname username"
            }
            ]);


        res.setPagination({
            total: await Post.countDocuments(query),
            perPage,
            page,
        });

        return res.resolve(post);

    });
