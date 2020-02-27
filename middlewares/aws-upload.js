const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

aws.config.update({
    secretAccessKey: 'NCGPXTsAlkUT90ccFXPVGzjFFE7Vkx8L4A1NFmiI',
    accessKeyId: 'AKIAZETXKKH3ZBTGVMOJ',
    region: 'us-east-2'
});

const s3 = new aws.S3({});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/gif"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: multerS3({
        s3,
        bucket: "ghm-gallery",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req ,file, cb) => {
            console.log(file);
            cb(null, {fieldName: file.fieldname});
        },
        key:(req, file, cb) => {
            cb(null, file.originalname);
        }
    }),
    fileFilter
});

module.exports.upload = upload;