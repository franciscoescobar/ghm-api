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