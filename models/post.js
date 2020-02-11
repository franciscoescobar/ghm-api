const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    src: {
        type: String,
        required: true
    },
    signedSrc: {
        type: String,
        required: false,
    },
    lowSrc: {
        type: String,
        required: true
    },
    signedLowSrc: {
        type: String,
        required: false
    },
    watermarkSrc: {
        type: String,
        required: false
    },
    signedWatermarkSrc: {
        type: String,
        required: false
    },
    metadata: {
        type: Object,
        required: false
    },
    tags: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: false
        }
    ]
});

module.exports = mongoose.model('Post', postSchema);