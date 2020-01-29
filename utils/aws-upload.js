const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

aws.config.update({
    secretAccessKey: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    accessKeyId: 'XXXXXXXXXXXXXXX',
    region: 'us-east-1'
});

const s3 = new aws.S3({});

const fileFilter = (req, file, cb) => {
    if (
        file === "image/png" ||
        file === "image/jpg" ||
        file === "image/jpeg" 
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
        metadata: (req,file,cb) => {
            cb(null, {fieldName: file.fieldname});
        },
        key:(req, file, cb) => {
            cb(null, Date.now().toString());
        }
    }),
    fileFilter
}).single('image')

module.exports = upload;