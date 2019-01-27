var mongoose = require("mongoose");

var reviewSchema = mongoose.Schema({
    rating: {
        type: Number,
        min:1,
        max:5,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} is not an integer value"
        }
        
    },
    text: {
        type: String
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    campground:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campground"
    }
},
{
    timestamps: true
});

var Review = mongoose.model("Review", reviewSchema);

module.exports = Review;