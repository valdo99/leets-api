const mongoose = require("mongoose");
const Notifications = mongoose.model("Notifications");
const tagLabel = "notificationsListProtectedController";

const PER_PAGE = 5;

new utilities.express.Service(tagLabel)
    .isGet()
    .respondsAt("/users/me/notifications")
    .controller(async (req, res) => {

        let page = parseInt(req.query.page);
        if (isNaN(page)) { page = 0; }

        const query = {
            user: req.locals.user._id
        };

        const notifications = await Notifications.find(query)
            .sort({ createdAt: -1, status: 0 })
            .skip(page * PER_PAGE)
            .limit(PER_PAGE)
            .populate([{
                path: "asset",
                select: "-__v -user -updatedAt",
                populate: {
                    path: "post",
                    select: "title _id image createdAt"
                }
            }, {
                path: "user_from",
                select: "username _id"
            }]);

        res.setPagination({
            total: await Notifications.countDocuments(query),
            perPage: PER_PAGE,
            page,
        });

        await Notifications.updateMany({ ...query, status: Notifications.SENT_STATUS }, { $set: { status: Notifications.VIEWED_STATUS } })

        return res.resolve(notifications);
    });
