const Jimp = require('jimp');
const aws = require("aws-sdk");
const fs = require("fs");
aws.config.update({
    secretAccessKey: 'NCGPXTsAlkUT90ccFXPVGzjFFE7Vkx8L4A1NFmiI',
    accessKeyId: 'AKIAZETXKKH3ZBTGVMOJ',
    region: 'us-east-2'
});

const s3 = new aws.S3({});

const reduceQuality = (imageUrl, imageName) => {
    Jimp.read(imageUrl)
        .then(image => {
            return image
            .quality(60) // set JPEG quality
            .resize(475,Jimp.AUTO) // set JPEG quality
            .write(`images-lowres/${imageName}`); // save
        })
        .then(() => {
            fs.readFile(`images-lowres/${imageName}`, (error, fileContent) => {
                var base64data = new Buffer(fileContent, 'binary');

                const params = {
                    Bucket: 'ghm-gallery',
                    Key: `low-${imageName}`, // File name you want to save as in S3
                    Body: base64data,
                    Metadata: {
                        'Content-Type': "image/jpeg"
                    }
                };
                // Uploading files to the bucket
                s3.upload(params, function(err, data) {
                    if (err) {
                        throw err;
                    }
                    console.log(`File uploaded successfully. ${data.Location}`);
                });
            });
            
        })
        .catch(err => {
            console.error(err);
        });
        return `low-${imageName}`;
}
const addWatermark = (imageUrl) => {
    Jimp.read(imageUrl)
        .then(image => {
            return image
            .quality(60) // set JPEG quality
            .greyscale() // set greyscale
            .write(`active/${imageUrl}`); // save
        })
        .catch(err => {
            console.error(err);
        });
}
module.exports.reduceQuality = reduceQuality;
module.exports.addWatermark = addWatermark;