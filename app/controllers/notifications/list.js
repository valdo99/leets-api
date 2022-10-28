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
            .sort({ createdAt: -1, status: -1 })
            .skip(page * PER_PAGE)
            .limit(PER_PAGE);

        res.setPagination({
            total: await Notifications.countDocuments(query),
            unseen: await Notifications.countDocuments({ ...query, status: Notifications.SENT_STATUS }),
            perPage: PER_PAGE,
            page,
        });

        await Notifications.updateMany({ ...query, status: Notifications.SENT_STATUS }, { $set: { status: Notifications.VIEWED_STATUS } })

        return res.resolve(notifications);
    });
