const Image = require('mongoose').model('Image');
const AWS = require("aws-sdk");
const mime = require('mime');

const tagLabel = "getMultipleUploadLinkController";

const S3 = new AWS.S3({
    region: process.env.AWS_S3_REGION,
    signatureVersion: "v4",
});


new utilities.express.Service(tagLabel)
    .isPost()
    .respondsAt('/get-multiple-upload-link')
    .controller(async (req, res) => {
        const {asset, files} = req.body;

        const urls = [];

        if(!Array.isArray(files))
            return res.forbidden(i18n.__("FILES_NEED_ARRAY"));



        if (files.length > 15) 
            return res.forbidden(i18n.__("TOO_MUCH_FILES"));

        const create = async _ => {
            
            for (let index = 0; index < files.length; index++) {
                const image = new Image({
                    asset,
                    user:req.locals.user._id,
                });
    
    
                const params = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Expires: 120,
                    Key:`${req.locals.domain.name}/${asset}/${image._id.toString()}/${files[index]}`,
                    ContentType:mime.getType(files[index]),
                    ACL: 'public-read'
                };
    
                const signed = await S3.getSignedUrlPromise('putObject', params);
    
                image.url=signed.split('?')[0];
                await image.save();
                urls.push(signed);


            }
            
        };      

        await create();

        res.resolve(urls);

    });