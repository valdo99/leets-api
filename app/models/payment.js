const mongoose = require("mongoose");
const httpContext = require("express-http-context");

const authenticationCapable = require("../plugins/authentication-capable-plugin");

const publicFields = require("../plugins/public-fields");
const mongooseErrors = require("../utils/mongoose-errors");


const PAYMENT_STATUS = [
    0, // NONE
    1, // PAID
    2  // SPLITTED
];


const PaymentSchema = new mongoose.Schema(
    {
        domain: {
            type: String,
            required: [true, i18n.__("FIELD_REQUIRED")],
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true, i18n.__("FIELD_REQUIRED")],
        },
        order:{
            type: mongoose.Types.ObjectId,
            ref: "Order",
            required: [true, i18n.__("FIELD_REQUIRED")],
        },
        status: {
            type: Number,
            enum: PAYMENT_STATUS,
            default: PAYMENT_STATUS[0]
        },
       
    },
    {
        collection: "payments",
        timestamps: true,
        toJSON: { getters: true }
    }
);


PaymentSchema.plugin(publicFields, [
    "_id",
    "user",
    "order",
    "status",
]);

PaymentSchema.plugin(authenticationCapable);

PaymentSchema.plugin(mongooseErrors);

PaymentSchema.pre('validate', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});

PaymentSchema.pre('save', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});

PaymentSchema.pre('find', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});

PaymentSchema.pre('findOne', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});

PaymentSchema.pre('findOneAndDelete', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});

module.exports = exports = mongoose.model("Payment", PaymentSchema);