const Users = require("../models/users")
const httpContext = require("express-http-context");
const jwt = require("jsonwebtoken");

const tagLabel = "authPublicRoute";

utilities.dependencyLocator.register(
    tagLabel,
    {
        setContext: async (req) => {
            try {
                let token = req.headers["x-auth-token"];

                if (typeof token !== "string" || token === "") { return; }

                let decodedUser;

                try {
                    decodedUser = jwt.verify(token, process.env.JWT_KEY);
                } catch (error) {
                    return;
                }

                if (!decodedUser) {
                    return;
                }

                const query = { _id: decodedUser._id };

                const user = await Users.findOne(query);

                if (!user) { return; }

                req.locals.user = user;
                httpContext.set("context", user);
                return await httpContext.ns.runPromise(async () => { });
            } catch (error) {
                utilities.logger.debug("Error...", { tagLabel, error })
            }
        }
    }
);
