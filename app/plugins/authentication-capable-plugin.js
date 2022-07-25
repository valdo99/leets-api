require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const moment= require('moment');

const { ForbiddenError } = api.customErrors;

const ROUNDS = 10;

const PASSWORD_REGEX = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$";
const resetPasswordProcessDuration = 15 * 60;


const otp = require("../utils/otp");



module.exports= (schema, options = {}) => {

    schema.add({
        hashPassword:{
            type:String,
        },
        didResetFirstPassword: {
            type: Number,
            default: false
        }

    });

    schema.methods.isPasswordCompliant = (password) => {
        return !!password.match(PASSWORD_REGEX);
    };

    schema.methods.setPassword = async function (rawPassword) {

        this.hashPassword = await bcrypt.hash(rawPassword, ROUNDS);

    };

    schema.methods.isPasswordValid = async function (rawPassword) {

        if (!rawPassword) return false;
        return await bcrypt.compare(rawPassword, this.hashPassword);

    };

    schema.methods.login = async function (rawPassword, hashPassword) {

        if (!rawPassword)
            return Promise.reject("The user is missing the password");

        const validLogin = await bcrypt.compare(rawPassword, hashPassword);

        if (!validLogin) {
            return Promise.reject(new ForbiddenError(i18n.__("INVALID_LOGIN_CREDENTIALS")));
        }

        const token = jwt.sign(this.getPublicFields(), process.env.JWT_KEY);

        return Promise.resolve({token, isAdmin: this.isAdmin});

    };

    schema.methods.resetFirstPassword = async function (rawPassword) {

        if (!rawPassword)
            return Promise.reject("The user is missing the password");

        const didResetFirstPassword = this.didResetFirstPassword;

        if (didResetFirstPassword) {
            return Promise.reject(new ForbiddenError("User already changed the first password"));
        }

        this.hashPassword = await bcrypt.hash(rawPassword, ROUNDS);
        this.didResetFirstPassword = true;

    };
};