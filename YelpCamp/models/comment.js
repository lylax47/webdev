var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
    createdOn: {type: Date, default: Date.now},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        avatar: String,
    }
});

var Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;