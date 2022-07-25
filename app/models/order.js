const mongoose = require("mongoose");
const httpContext = require("express-http-context");

const authenticationCapable = require("../plugins/authentication-capable-plugin");

const publicFields = require("../plugins/public-fields");
const mongooseErrors = require("../utils/mongoose-errors");

const SERVICE_TYPE = [
    0, // RIPARATION
    1, // SELL
    2  // BUY
];

const SERVICE_STATUS = [
    0, // RECIEVED
    1, // PENDING
    2  // FINISHED 
];

const OrderSchema = new mongoose.Schema(
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
        service: {
            type: String,
            enum: SERVICE_TYPE,
            required: [true, i18n.__("FIELD_REQUIRED")],
        },
        device: {
            type: String,
            required: [true, i18n.__("FIELD_REQUIRED")],
        },
        price: {
            type: Number,
            required: [true, i18n.__("FIELD_REQUIRED")],
        },
        status: {
            type: Number,
            enum: SERVICE_STATUS,
            default: SERVICE_STATUS[0]
        },
        payment: {
            type: mongoose.Types.ObjectId,
            ref: "Payment",
        },
       
    },
    {
        collection: "orders",
        timestamps: true,
        toJSON: { getters: true }
    }
);


OrderSchema.plugin(publicFields, [
    "_id",
    "user",
    "service",
    "device",
    "price",
    "status",


]);

OrderSchema.plugin(authenticationCapable);

OrderSchema.plugin(mongooseErrors);

OrderSchema.pre('validate', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});

OrderSchema.pre('save', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});

OrderSchema.pre('find', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});

OrderSchema.pre('findOne', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});

OrderSchema.pre('findOneAndDelete', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});

module.exports = exports = mongoose.model("Order", OrderSchema);