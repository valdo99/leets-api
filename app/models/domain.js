const mongoose = require("mongoose");

const publicFields = require("../plugins/public-fields");
const mongooseErrors = require("../utils/mongoose-errors");




const DomainSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            sparse: true,
        },
        active:{
            type:Boolean,
            default:true
          
        },
        config:{
            type:Object,
        }
    

    },
    {
        collection: "domains",
        timestamps: true,
        toJSON: { getters: true }
    }
);




DomainSchema.plugin(publicFields, []);

DomainSchema.plugin(mongooseErrors);


module.exports = exports = mongoose.model("Domain", DomainSchema);