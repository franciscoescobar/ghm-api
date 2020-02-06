const Jimp = require('jimp');

const reduceQuality = (imageUrl, imageName) => {
    Jimp.read(imageUrl)
        .then(image => {
            return image
            .quality(60) // set JPEG quality
            .greyscale() // set greyscale
            .write(`images-lowres/${imageName}`); // save
        })
        .catch(err => {
            console.error(err);
        });
    return(`images-lowres/${imageName}`);
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