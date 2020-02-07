const AWS = require("aws-sdk");

AWS.config.update({
    secretAccessKey: 'NCGPXTsAlkUT90ccFXPVGzjFFE7Vkx8L4A1NFmiI',
    accessKeyId: 'AKIAZETXKKH3ZBTGVMOJ',
    region: 'us-east-2'
});

module.exports = getDownloadUrl;


const s3 = new AWS.S3() //new S3 client

async function getDownloadUrl (key) {
    let realKey;
    if(key.includes('.com/')){
        realKey = key.split('.com/')[1];
    }
    else {
        realKey = key;
    }
    const params = {
        Bucket: 'ghm-gallery',
        Key: realKey, //the directory in S3
        Expires: 60
    }

    try {
        const url = await new Promise((resolve, reject) => {
            s3.getSignedUrl('getObject', params, function (err, url) {
                if (err) {
                    reject(err)
                }
                resolve(url)
            })
        })

        return url
    } catch (err) {
        logger.error('s3 getObject,  get signedUrl failed')
        throw err
    }
}