const validator = require('validator');
const mongoose = require('mongoose');
const otp = require("../../utils/otp");
const Mailer = require('../../services/mailer');

const Users = mongoose.model('User');

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

const tagLabel = "userSaveController";

new utilities.express.Service(tagLabel)
    .isPost()
    .isPublic()
    .respondsAt('/users')
    .controller(async (req, res) => {

        const { name, surname, email, username, password, repeatPassword, terms } = req.body;


        if (terms !== true)
            return res.badRequest({ terms: i18n.__('MISSING_CONSENSUS') });

        if (await Users.findOne({ email }))
            return res.forbidden(i18n.__("FORM_ERROR_EMAIL_IN_USE"));


        if (await Users.findOne({ username }))
            return res.forbidden("username already taken");

        if (!(/^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/.test(username))) {
            res.badRequest({
                username: "username must contain only letters, numbers and these special characters: ._"
            })
        }


        const user = new Users({
            name,
            surname,
            email,
            username: replaceAll(username.toLowerCase().trim(), " ", "")
        });

        if (!(await user.isPasswordCompliant(password))) {
            return res.badRequest({ password: i18n.__("PASSWORD_NOT_COMPLIANT") });
        }

        if (password !== repeatPassword)
            return res.badRequest({
                password: i18n.__('FORM_PASSWORDS_DO_NOT_MATCH'),
                repeatPassword: i18n.__('FORM_PASSWORDS_DO_NOT_MATCH'),
            });

        // TODO check if username is compliant with some regex


        await user.setPassword(password);

        user.emailConfirmation.otp = otp.generate(4, {
            specialChars: false,
            upperCase: false
        });

        await user.save();


        res.resolve(user);

        const posthog = utilities.dependencyLocator.get('posthog');

        posthog.identify({
            distinctId: user._id,
            properties: {
                name: user.name,
                surname: user.surname,
                username: user.username,
                createdAt: user.createdAt
            }
        })

        posthog.capture({
            distinctId: user._id,
            event: 'sign-up'
        })

        const mailer = new Mailer();
        await mailer.setTemplate(api.config.email.templates.verification)
            .to(user.name, user.email)
            .setParams({
                name: user.getFullName(),
                link: `${process.env.API_URL}/auth/confirm-email?email=${user.email}&otp=${user.emailConfirmation.otp}`
            })
            .send();


        //TODO: use the new Mailer service and then Move to JOB

    });