const moment = require("moment");
const mongoose = require("mongoose");

const User = mongoose.model("User");

const tagLabel = "userListProtectedController";

const perPage = 20;

new utilities.express.Service(tagLabel)
	.isGet()
	.respondsAt("/users")
	.controller(async (req, res) => {
		const { date, createdAt = -1, email, name, surname } = req.query;

		if (!req.locals.user.isAdmin) {
			return res.forbidden(i18n.__("ACTION_NOT_PERMITTED"));
		}

		let page = parseInt(req.query.page);
		if (isNaN(page)) { page = 0; }

		const queries = [];

		if (email) {
			queries.push({ email: { $regex: email, $options: "i" } });
		}

		if (name) {
			queries.push({ name: { $regex: name, $options: "i" } });
		}

		if (surname) {
			queries.push({ surname: { $regex: surname, $options: "i" } });
		}

		if (moment(date).isValid()) {
			queries.push({
				$or: [
					{
						createdAt: {
							$lte: moment(date, "MM-DD-YYYY").endOf("day"),
							$gte: moment(date, "MM-DD-YYYY").startOf("day"),
						},
					},
					{
						updatedAt: {
							$lte: moment(date, "MM-DD-YYYY").endOf("day"),
							$gte: moment(date, "MM-DD-YYYY").startOf("day"),
						},
					},
				],
			});
		}

		const query = queries.length > 0 ? { $and: queries } : {};

		const users = await User.find(query)
			.sort({ createdAt })
			.skip(page * perPage)
			.limit(perPage);

		res.setPagination({
			total: await User.countDocuments(query),
			perPage: perPage,
			page,
		});

		res.resolve(users);
	});
