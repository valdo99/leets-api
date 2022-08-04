const mongoose = require('mongoose');
const Users = mongoose.model('User');
const jwt = require("jsonwebtoken");


const tagLabel = "confirmEmailController";

new utilities.express.Service(tagLabel)
    .isGet()
    .isPublic()
    .respondsAt('/auth/confirm-email')
    .controller(async (req, res) => {
        const {email, otp} = req.query;

        console.log(email, otp);

        if (!email) return res.forbidden(i18n.__('EMAIL_MISSING'));
        if (!otp) return res.forbidden(i18n.__('OTP_MISSING'));

        const user = await Users.findOne({
            email: email.toLowerCase(),
            'emailConfirmation.confirmed': false,
            'emailConfirmation.otp': otp,
        });

        if (!user)
            return res.forbidden(i18n.__('USER_NOT_FOUND_OR_WRONG_OTP'));
        
        user.emailConfirmation.confirmed = true;
        
        await user.save();

        const token = jwt.sign(user.getPublicFields(), process.env.JWT_KEY);

        return res.redirect(`${process.env.APP_URL}/confirm-email?jwt=${token}`);


    });