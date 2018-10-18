var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/blog_demo_ref");
var Post = require("./models/post");
var User = require("./models/user");

// User.create({
//     email: "bob@gmail.com",
//     name: "Bob Belcher"
// });


// Post.create({
//     title:"How to Cook the Best Burger pt.4",
//     content:"Bdfokmvdkcdc ds sdcc sdzxc sfiov jsd ovjo cddc cdcdm"
// }, function(err, post){
//     if(err){
//         console.log(err);
//     } else{
//         User.findOne({email: "bob@gmail.com"}, function(err, foundUser){
//             if(err){
//                 console.log(err);
//             } else{
//                 foundUser.posts.push(post);
//                 foundUser.save(function(err, data){
//                     if(err){
//                         console.log(err);
//                     } else{
//                         console.log(data);
//                     }
//                 });
//             }
//         });
//     }
// });

User.findOne({email:"bob@gmail.com"}).populate("posts").exec(function(err, user){ //Will populate the data fields based off of the id references.
    if(err){
        console.log(err);
    } else{
        console.log(user);
    }
});


