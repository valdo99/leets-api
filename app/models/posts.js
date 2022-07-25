const mongoose = require("mongoose");

const publicFields = require("../plugins/public-fields");
const mongooseErrors = require("../utils/mongoose-errors");
var likesPlugin = require('mongoose-likes');


const PostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, i18n.__("FIELD_REQUIRED")],
        },
        image: {
            type: String,
        },
        preview_url: {
            type: String,
        },
        spotify_id: {
            type: String,
        },
        hunter:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        artist:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Artist"
        },
        status:{
            type:String,
            enum:["UPLOADED","ACTIVE","REFUSED"],
            default:"UPLAODED"
        }
       
    },
    {
        collection: "posts",
        timestamps: true,
        toJSON: { getters: true }
    }
);

PostSchema.plugin(likesPlugin, {
    // behaviour
    disableDislikes: true, // if true, turns off disliking
    
    // Property names
    likesName: 'likes',
    scoreName: 'score',
    
    likersName: 'users',
    
    // Function names
    likeFuncName: 'like',
    cancelLikeFuncName: 'cancelLike',
    findLikes: 'findLikes',
    
    // other options
    likerIdType: mongoose.Schema.Types.ObjectId, // The type to use in the likers/dislikers array
    indexed: true // whether to generate the indexes {_id:1, likers:1}, and {_id:1, dislikers:1}
});


PostSchema.plugin(publicFields, [
    "_id",
    "spotify_id",
    "hunter",
    "name",
    "image",
    "followers",
    "likes",
    "score",
    "likers"
]);


PostSchema.plugin(mongooseErrors);


module.exports = exports = mongoose.model("Post", PostSchema);