var express = require("express");
var app = express();

app.get("/", function(req, res){
   res.send("Hi there!"); 
});

app.get("/bye", function(req, res){
   res.send("goodbye");
});

app.get("/dog", function(req, res){
    res.send("MEOW");
});

//including variables(route/path parameters)
app.get("/r/:subredditName", function(req, res) {
    var subreddit = req.params.subredditName
    res.send(`Welcome to the ${subreddit} subreddit`.toUpperCase())
})

app.get("/r/:subredditName/comments/:id/:title", function(req, res) {
    res.send("Welcome to the comments page!")
})

// Order of routes is important. Star should be at the end!!!
//first route that matches is the only one that matters.
//DRY - don't repeat yourself...
app.get("*", function(req, res){
    res.send("ALL")
})

// port coming from cloud 9
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started...")
});