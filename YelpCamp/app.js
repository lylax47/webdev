var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser:true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
    name:String,
    image:String,
    description:String,
});

var Campground = mongoose.model("Campground", campgroundSchema);

// Campground.create({name: "Willow Rest", image: "https://c1.staticflickr.com/5/4082/4756767667_fe48b8e42a.jpg"}, function(err, campground){
//     if(err){
//         console.log(err);
//     } else{
//         console.log(campground);
//     }
// });

app.get("/", function(req, res){
    res.render("landing");
});

//INDEX - list of all campgrounds
app.get("/campgrounds", function(req, res){
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else{
            res.render("index", {campgrounds: allCampgrounds});
        }
    });
    
});

//CREATE - create new campground
app.post("/campgrounds", function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = {name:name, image:image, description:desc};
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            res.redirect("/campgrounds"); //defaults to get request if repeat!
        }
    });
   
});

//NEW - form for new campground.
app.get("/campgrounds/new", function(req, res){ //should be defined before id as it would otherwise be interpreted as id!!!
    res.render("new");
});

//SHOW - shows specific info for one campground
app.get("/campgrounds/:id", function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
        } else{
            res.render("show", {campground:foundCampground});
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The YelpCamp server has started...");
});