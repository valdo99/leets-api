require('dotenv').config();

const jwt = require("jsonwebtoken");
const Users = require("../models/users");

const tagLabel  = 'userAuthMiddleware';

module.exports = async (req, res, next) => {

    try {

        let token = req.headers['x-auth-token'];
        if (typeof token !== 'string' || token === "")
            return res.unauthorized();

        let decodedUser;

        try {
            decodedUser = jwt.verify(token, process.env.JWT_KEY);
        } catch (error) {
            return res.unauthorized();
        }

        if (!decodedUser) {
            return res.unauthorized();
        }

        const query = { _id: decodedUser._id};

        const user = await Users.findOne(query);

        if (!user)
            return res.unauthorized();
        
        req.locals.user = user;

        return next();
    }
    catch (error) {

        res.apiErrorResponse(error);
        utilities.logger.error('Cannot run client authentication', { tagLabel, error });

    }

};