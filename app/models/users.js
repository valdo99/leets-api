const mongoose = require("mongoose");
// const moment = require("moment");
const validator = require("validator");
const httpContext = require("express-http-context");


const authenticationCapable = require("../plugins/authentication-capable-plugin");

const publicFields = require("../plugins/public-fields");
const mongooseErrors = require("../utils/mongoose-errors");



const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, i18n.__("FIELD_REQUIRED")],
            minLength: [1, i18n.__("STRING_AT_LEAST", {min: 1})],
            maxLength: [50, i18n.__("STRING_AT_MUST", {max: 50})],
        },
        surname: {
            type: String,
            required: [true, i18n.__("FIELD_REQUIRED")],
            minLength: [1, i18n.__("STRING_AT_LEAST", {min: 1})],
            maxLength: [50, i18n.__("STRING_AT_MUST", {max: 50})],
        },
        phoneNumber:{
            type: String,
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            validate: [validator.isEmail, i18n.__("FORM_ERROR_INVALID_EMAIL")],
        },
        domain:{
            type:String,
            required: [true, i18n.__("FIELD_REQUIRED")],
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
       
    },
    {
        collection: "users",
        timestamps: true,
        toJSON: { getters: true }
    }
);


UserSchema.methods.getFullName = function () {
    return this.name + " " + this.surname;
};


UserSchema.plugin(publicFields, [
    "_id",
    "name",
    "surname",
    "email",
    "isAdmin",

]);

UserSchema.plugin(authenticationCapable);

UserSchema.plugin(mongooseErrors);

UserSchema.pre('validation', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});

UserSchema.pre('save', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});

UserSchema.pre('find', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});

UserSchema.pre('findOne', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});

UserSchema.pre('findOneAndDelete', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});

module.exports = exports = mongoose.model("User", UserSchema);