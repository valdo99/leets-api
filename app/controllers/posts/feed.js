const moment = require('moment');
const mongoose = require('mongoose');
const Post = mongoose.model("Post");
const Users = mongoose.model("User");

const httpContext = require("express-http-context");
const jwt = require("jsonwebtoken");

const tagLabel = "feedController";

function getDateOfWeek(w, y) {
    let d = (1 + (w - 1) * 7); // 1st of January + 7 days for each week

    return new Date(y, 0, d);
}

const setContextIfUserLogged = async (req) => {
    try {

        let token = req.headers['x-auth-token'];

        if (typeof token !== 'string' || token === "")
            return;

        let decodedUser;

        try {
            decodedUser = jwt.verify(token, process.env.JWT_KEY);

        } catch (error) {
            return; 
        }

        if (!decodedUser) {
            return;
        }

        const query = { _id: decodedUser._id};

        const user = await Users.findOne(query);

        if (!user)
            return;
        
        req.locals.user = user;
        httpContext.set("context", user);
        return await httpContext.ns.runPromise(async () => {
        });
    }
    catch (error) {
        console.log(error);
    }

};

new utilities.express.Service(tagLabel)
    .isGet()
    .isPublic()
    .respondsAt('/posts/feed')
    .controller(async (req, res) => {

        await setContextIfUserLogged(req);

        const {week, year} = req.query;

        let day;

        if(week && year){
            day = getDateOfWeek(week, year);
        }else{
            day = new Date();
        }


        const posts = await Post.find({
            createdAt:{
                $gte: moment(day).startOf("week").toISOString(),
                $lte: moment(day).endOf("week").toISOString()

            }
        }).sort({likes:-1}).populate({
            path:"artist",
            model:"Artist"
        }); ;

        return res.resolve(posts);


    });
