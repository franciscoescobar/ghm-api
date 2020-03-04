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
    size: {
        type: Number,
        required: true
    },
    pixels: {
        type: String,
        required: false,
    },
    place: {
        type: String,
        required: false,
    },
    action: {
        type: String,
        required: false,
    },
    tags: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Tag',
            required: false
        }
    ],
    categories: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: false
        }
    ],
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
        required: true
    },
    signedWatermarkSrc: {
        type: String,
        required: false
    },
    metadata: {
        type: Object,
        required: false
    }
});

module.exports = mongoose.model('Post', postSchema);