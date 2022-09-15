const mongoose = require('mongoose');
const Users = mongoose.model('User');

const tagLabel = "confirmEmailController";

new utilities.express.Service(tagLabel)
    .isPost()
    .isPublic()
    .respondsAt('/auth/confirm-email')
    .controller(async (req, res) => {
        const { email, otp } = req.body;

        if (!email) return res.forbidden(i18n.__('EMAIL_MISSING'));
        if (!otp) return res.forbidden(i18n.__('OTP_MISSING'));

        const user = await Users.findOne({
            email: email.toLowerCase(),
            'emailConfirmation.confirmed': false,
            'emailConfirmation.otp': req.body.otp,
        });

        if (!user)
            return res.forbidden(i18n.__('USER_NOT_FOUND_OR_WRONG_OTP'));

        user.emailConfirmation.confirmed = true;

        await user.save();

        await axios({ url: `${process.env.APP_URL}/api/revalidate?username=${user.username}&secret=${process.env.REVALIDATE_TOKEN}`, method: "GET" })

        return res.resolve();


    });