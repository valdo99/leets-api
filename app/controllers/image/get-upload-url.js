const Image = require('mongoose').model('Image');
const AWS = require("aws-sdk");
const mime = require('mime');
const tagLabel = "getUploadLinkController";

const S3 = new AWS.S3({
    region: process.env.AWS_S3_REGION,
    signatureVersion: "v4",
});


new utilities.express.Service(tagLabel)
    .isPost()
    .respondsAt('/get-upload-link')
    .controller(async (req, res) => {
        const {asset, file} = req.body;


        const image = new Image({
            asset,
            user:req.locals.user._id,
        });


        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Expires: 120,
            Key:`${req.locals.domain.name}/${asset}/${image._id.toString()}/${file}`,
            ContentType:mime.getType(file),
            ACL: 'public-read'
        };

        const signed = await S3.getSignedUrlPromise('putObject', params);

        image.url=signed.split('?')[0];


        await image.save();


        res.resolve(signed);

    });