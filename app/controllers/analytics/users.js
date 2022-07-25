const mongoose = require('mongoose');

const tagLabel = "userAnalytics";

const moment = require("moment");

const User = mongoose.model("User");

new utilities.express.Service(tagLabel)
    .isGet()
    .respondsAt('/analytics/users')
    .controller(async (req, res) => {
        if (!req.locals.user.isAdmin)
            return res.forbidden(i18n.__("ACTION_NOT_PERMITTED"));
        const aggregate = [
            // First Stage
            {
                $addFields: {
                    createdAtDate: {
                        $toDate: "$createdAt"
                    },
                
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%d-%m-%Y",
                            date: "$createdAtDate"
                        }
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            { $sort: { "createdAt": 1 } },

            {
                $project: {
                    date: "$_id",
                    _id: 0,
                    users:"$count"
                }
            }
        ];

        let data = await User.aggregate(aggregate);

        // let startDate = moment('30/03/2022', "DD/MM/YYYY");
        // let endDate = moment();

        // let days = endDate.diff(startDate, 'd', false);
        // for (let i = 0; i < days; i++) {
        //     data.splice(i, 0, {"date" : startDate.add(1, 'd').format("DD-MM-YYYY"), 'users': 0  });
        // }


        res.resolve(data);
    });