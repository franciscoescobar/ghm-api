const Jimp = require("jimp");
const aws = require("aws-sdk");
const fs = require("fs");
aws.config.update({
  secretAccessKey: "NCGPXTsAlkUT90ccFXPVGzjFFE7Vkx8L4A1NFmiI",
  accessKeyId: "AKIAZETXKKH3ZBTGVMOJ",
  region: "us-east-2"
});

const s3 = new aws.S3({});

const reduceQuality = (imageUrl, imageName) => {
  Jimp.read(imageUrl)
    .then(image => {
      return image
        .quality(40) // set JPEG quality
        .resize(475, Jimp.AUTO) // set JPEG quality
        .write(`images-lowres/${imageName}`, () => {
          fs.readFile(`images-lowres/${imageName}`, (error, fileContent) => {
            var base64data = new Buffer.from(fileContent, "binary");

            const params = {
              Bucket: "ghm-gallery",
              Key: `low-${imageName}`, // File name you want to save as in S3
              Body: base64data,
              Metadata: {
                "Content-Type": "image/jpeg"
              }
            };
            // Uploading files to the bucket
            s3.upload(params, function(err, data) {
              if (err) {
                throw err;
              }
              console.log(`File uploaded successfully. ${data.Location}`);
              fs.unlink(`images-lowres/${imageName}`, err => {
                if (err) {
                  console.error(err);
                  return;
                }
                console.log("Local image deleted successfully");
                //file removed
              });
            });
          });
        }); // save
    })
    .catch(err => {
      console.error(err);
    });
  return `low-${imageName}`;
};
const addWatermark = async (imageUrl, imageName) => {
  const LOGO =
    "https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Australian_Defence_Force_Academy_coat_of_arms.svg/1200px-Australian_Defence_Force_Academy_coat_of_arms.svg.png";
  const LOGO_MARGIN_PERCENTAGE = 50;
    try {
    const [image, logo] = await Promise.all([
      Jimp.read(imageUrl),
      Jimp.read(LOGO)
    ]);
    logo.resize(image.bitmap.width / 5, Jimp.AUTO);

    const xMargin = (image.bitmap.width * LOGO_MARGIN_PERCENTAGE) / 100;
    const yMargin = (image.bitmap.width * LOGO_MARGIN_PERCENTAGE) / 100;
  
    const X = image.bitmap.width - logo.bitmap.width - xMargin;
    const Y = image.bitmap.height - logo.bitmap.height - yMargin;

    image
      .quality(60)
      .composite(logo, X, Y, [
        {
          mode: Jimp.BLEND_SOURCE_OVER,
          opacityDest: 1,
          opacitySource: 0.5
        }
      ]);
    await image.write(`watermarked/${imageName}`, () => {
      fs.readFile(`watermarked/${imageName}`, (error, fileContent) => {
        var base64data = new Buffer.from(fileContent, "binary");

        const params = {
          Bucket: "ghm-gallery",
          Key: `water-${imageName}`, // File name you want to save as in S3
          Body: base64data,
          Metadata: {
            "Content-Type": "image/jpeg"
          }
        };
        // Uploading files to the bucket
        s3.upload(params, function(err, data) {
          if (err) {
            throw err;
          }
          console.log(`File uploaded successfully. ${data.Location}`);
          fs.unlink(`watermarked/${imageName}`, err => {
            if (err) {
              console.error(err);
              return;
            }
            console.log("Local image deleted successfully");
            return `water-${imageName}`;
            //file removed
          });
        });
      }); // save
    });
  } catch (err) {
    console.error(err);
  }
  return `water-${imageName}`;
};

module.exports.reduceQuality = reduceQuality;
module.exports.addWatermark = addWatermark;
