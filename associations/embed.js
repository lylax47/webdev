var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/blog_demo");

var postSchema = new mongoose.Schema({
    title: String,
    content: String
});

var Post = mongoose.model("Post", postSchema);

var userSchema = new mongoose.Schema({
    email: String,
    name: String,
    posts: [postSchema] //make an array of posts. Should be name of schema
});

var User = mongoose.model("User", userSchema);

var newUser = new User({
    email: "hermione@hogwarts.edu",
    name: "Hermione Granger"
});

newUser.posts.push({
    title: "How to brew poyljuise potion",
    content: "Nope. Go to class."
})

newUser.save(function(err, user){
    if (err){
        console.log(err);
    } else{
        console.log(user);
    }
});

// var newPost = new Post({
//     title:"Reflections on Life",
//     content:"It is interesting."
// });

// newPost.save(function(err, post){
//   if(err){
//       console.log(err);
//   } else{
//       console.log(post);
//   }
// });

User.findOne({name: "Hermione Granger"}, function(err, user){
    if(err){
        console.log(err);
    } else{
        user.posts.push({
            title:"3 Things I Really Hate",
            content:"Harry, Harry, Harry"
        });
        user.save(function(err, user){  //callback hell...
            if(err){
                console.log(err);
            } else{
                console.log(user);
            }
        });
    }
});