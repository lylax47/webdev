var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware"); //will automatically require contents of index.js if not specified.
var NodeGeocoder = require("node-geocoder");

var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null,
};

var geocoder = NodeGeocoder(options);

//INDEX - list of all campgrounds
router.get("/", function(req, res){
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else{
            res.render("campgrounds/index", {campgrounds: allCampgrounds, page:'campgrounds'});
        }
    });
    
});

//CREATE - create new campground
router.post("/", middleware.isLoggedIn, function(req, res){
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    geocoder.geocode(req.body.location, function(err, data){
        if(err || !data.length){
           req.flash('error', 'invalid address');
           console.log(err);
           return res.redirect('back');
        } else{
            var lat = data[0].latitude;
            var lng = data[0].longitude;
            var location = data[0].formattedAddress;
            var newCampground = {name:name, price:price, image:image, description:desc, author: author, location: location, lat: lat, lng: lng};
            Campground.create(newCampground, function(err, newlyCreated){
                if(err){
                    console.log(err);
                } else {
                    console.log(newlyCreated);
                    res.redirect("/campgrounds"); //defaults to get request if repeat!
                }
            });
        }
    });
    
    
    
   
});

//NEW - form for new campground.
router.get("/new", middleware.isLoggedIn, function(req, res){ //should be defined before id as it would otherwise be interpreted as id!!!
    res.render("campgrounds/new");
});

//SHOW - shows specific info for one campground
router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else{
            res.render("campgrounds/show", {campground:foundCampground});
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            res.redirect("/campgrounds")
        }
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    geocoder.geocode(req.body.location, function(err, data){
        if(err || !data.length){
           req.flash('error', 'invalid address');
           return res.redirect('back');
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
           if(err){
               req.flash("error", err.message);
               res.redirect("back");
           } else{
               req.flash("success", "Successfully Updated!");
               res.redirect(`/campgrounds/${req.params.id}`);
           }
       }); 
    });
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
             res.redirect("/campgrounds");
        } else{
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;