const mongoose = require("mongoose");

const publicFields = require("../plugins/public-fields");
const mongooseErrors = require("../utils/mongoose-errors");




const ImageSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref:"User",
        },
        asset:{
            type:String,
          
        },
        url:{
            type:String,
            unique:true
        }
    

    },
    {
        collection: "images",
        timestamps: true,
        toJSON: { getters: true }
    }
);




ImageSchema.plugin(publicFields, [
    "_id",
    "asset",
    "user",
]);

ImageSchema.plugin(mongooseErrors);

ImageSchema.pre('save', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});

ImageSchema.pre('find', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});

ImageSchema.pre('findOne', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});

ImageSchema.pre('findOneAndDelete', function (next) {
    const {req} = httpContext.get('context');
    this.domain = req.locals.domain.name;
    next();
});


module.exports = exports = mongoose.model("Image", ImageSchema);