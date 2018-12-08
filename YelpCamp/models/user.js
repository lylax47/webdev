var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var userSchema = mongoose.Schema({
    username: {type:String, unique:true, required:true},
    password: String,
    avatar: String,
    firstName: String,
    lastName: String,
    email: {type:String, unique:true, required:true},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {type: Boolean, defualt: false}
});

userSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", userSchema);

module.exports = User;