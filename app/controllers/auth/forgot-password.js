const mongoose = require('mongoose');
const Users = mongoose.model('User');
const Mailer = require('../../services/mailer');

const tagLabel = "forgotPasswordClientController";

new utilities.express.Service(tagLabel)
    .isPost()
    .isPublic()
    .respondsAt('/auth/forgot-password')
    .controller(async (req, res) => {
        const { email } = req.body;

        if (!email) return res.forbidden(i18n.__('EMAIL_MISSING'));

        const user = await Users
            .findOne({ email: req.body.email.toLowerCase() })
            .select('+resetPassword.otp +resetPassword.validTill');

        if (!user)
            return res.forbidden(i18n.__('USER_NOT_FOUND'));

        if (user.resetPassword && user.resetPassword.validTill > new Date())
            return res.forbidden(i18n.__('EXISTENT_RESET_PASSWORD_PROCESS'));

        const data = user.startResetPasswordProcess();

        await user.save();

        utilities.dependencyLocator.get('posthog').capture({
            distinctId: user._id,
            event: 'forgot-password'
        })

        const mailer = new Mailer();
        await mailer.setTemplate(api.config.email.templates.lostPassword)
            .to(user.name, user.email)
            .setParams({
                name: user.getFullName(),
                OTP: user.resetPassword.otp,
                link: `${process.env.APP_URL}/reset-password?email=${user.email}&OTP=${user.resetPassword.otp}`
            })
            .send();

        return res.resolve(data);




    });