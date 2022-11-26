const mongoose = require("mongoose");
const Notifications = mongoose.model("Notifications");
const tagLabel = "notificationsNewProtectedController";

const PER_PAGE = 5;

new utilities.express.Service(tagLabel)
    .isGet()
    .respondsAt("/users/me/notifications/new")
    .controller(async (req, res) => {

        const query = {
            user: req.locals.user._id,
            status: Notifications.SENT_STATUS
        };

        const notifications = await Notifications.countDocuments(query)


        return res.resolve(notifications.toString());
    });
