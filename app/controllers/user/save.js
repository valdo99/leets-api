const validator = require('validator');
const mongoose = require('mongoose');
const otp = require("../../utils/otp");
const Mailer = require('../../services/mailer');

const Users = mongoose.model('User');


const tagLabel = "userSaveController";

new utilities.express.Service(tagLabel)
    .isPost()
    .isPublic()
    .respondsAt('/users')
    .controller(async (req, res) => {

        const {name, surname, email, username, password, repeatPassword, terms} = req.body;


        if (terms !== true )
            return res.badRequest({terms: i18n.__('MISSING_CONSENSUS')});

        if (await Users.findOne({email}))
            return res.forbidden(i18n.__("FORM_ERROR_EMAIL_IN_USE"));

        const user = new Users({
            name,
            surname,
            email,
            username
        });

        if (!(await user.isPasswordCompliant(password))) {
            return res.badRequest({password:i18n.__("PASSWORD_NOT_COMPLIANT")});
        }

        if (password !== repeatPassword)
            return res.badRequest({
                password: i18n.__('FORM_PASSWORDS_DO_NOT_MATCH'),
                repeatPassword: i18n.__('FORM_PASSWORDS_DO_NOT_MATCH'),
            });

        await user.setPassword(password);

        user.emailConfirmation.otp = otp.generate(4, {
            specialChars: false,
            upperCase: false
        });

        await user.save();

        res.resolve(user);



        //TODO: use the new Mailer service and then Move to JOB

    });