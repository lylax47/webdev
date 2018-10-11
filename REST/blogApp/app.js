var express = require("express"),
app = express(),
mongoose = require("mongoose"),
bodyParser = require("body-parser");

mongoose.connect("mongodb://localhost:27017/rest_blog_app", {useNewUrlParser:true});

//APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

//MONGOOSE MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type:Date, default: Date.now}, //Can set default value if not provided!
});

var Blog = mongoose.model("Blog", blogSchema); //setup the blog data model.

//INDEX ROUTES
app.get("/", function(req, res){ //will redirect to blogs if just main page is entered
    res.redirect("/blogs");
});


app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else{
            res.render("index", {blogs:blogs});
        }
    });
});

//NEW ROUTE
app.get("/blogs/new", function(req, res) {
   res.render("new"); 
});

//CREATE ROUTE
app.post("/blogs", function(req, res){
    var data = req.body.blog;
    Blog.create(data, function(err, newBlog){
       if(err){
           console.log(err);
       } else{
           res.redirect("blogs");
       }
    });   
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
   Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
           console.log(err);
       } else{
           res.render("show", {blog: foundBlog});
       }
   }); 
});


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Blog app is running...");
});