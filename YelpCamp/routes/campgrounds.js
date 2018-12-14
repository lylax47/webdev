var express = require("express");
var router = express.Router();
var NodeGeocoder = require("node-geocoder");
var request = require("request");
var multer = require("multer");
var middleware = require("../middleware"); //will automatically require contents of index.js if not specified.
var Campground = require("../models/campground");

//GEOCODER SETUP
var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null,
};

var geocoder = NodeGeocoder(options);

//MULTER SETUP
//name for file upload
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});

var imageFilter = function(req, file, cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
       return cb(new Error("Only image files are are allowed!"), false); 
    }
    cb(null, true);
}

var upload = multer({storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: "dpvwbzizw",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


//INDEX - list of all campgrounds
router.get("/", function(req, res){
    if(req.query.search){
        var regex = new RegExp(escapeRegex(req.query.search), "gi"); //just title, ignore case
        escapeRegex(req.query.search);
        Campground.find({name:regex}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            } else{
                if(allCampgrounds.length < 1){
                    
                    req.flash("error", "Sorry, no campgrounds match that query. Please try a again.");
                    return res.redirect("back");
                }
                res.render("campgrounds/index", {campgrounds: allCampgrounds, page:'campgrounds'});
            } 
        });
    } else{
        Campground.find({}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            } else{
                res.render("campgrounds/index", {campgrounds: allCampgrounds, page:'campgrounds'});
            }
        });
    }
});

//CREATE - create new campground
router.post("/", middleware.isLoggedIn, upload.single("image"), function(req, res){

    geocoder.geocode(req.body.campground.location, function(err, data){
        if(err || !data.length){
           req.flash('error', 'invalid address');
           return res.redirect('back');
        } else{
            req.body.campground.lat = data[0].latitude;
            req.body.campground.lng = data[0].longitude;
            req.body.campground.location = data[0].formattedAddress;
            // var newCampground = {name:name, price:price, image:image, description:desc, author: author, location: location, lat: lat, lng: lng};
            //cloudinary image upload
            cloudinary.uploader.upload(req.file.path, function(result){ //bad to have multiple callbcaks??? YES!
                req.body.campground.image = result.secure_url;
                req.body.campground.author = {
                    id: req.user._id,
                    username: req.user.username
                };
                Campground.create(req.body.campground, function(err, newlyCreated){
                    if(err){
                        req.flash("error", err.message);
                        return res.redirect("back");
                    } else {
                        console.log(newlyCreated);
                        res.redirect(`/campgrounds/${newlyCreated.id}`); //defaults to get request if repeat!
                    }
                });
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
router.put("/:id", middleware.checkCampgroundOwnership, upload.single("image"), function(req, res){
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


function escapeRegex(text){ //hoisting
    return text.replace(/[-[\]{}()*+?.,\\^$!#\s]/g, "\\$&");
}


module.exports = router;