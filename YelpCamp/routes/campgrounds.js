var express = require("express");
var router = express.Router();
var NodeGeocoder = require("node-geocoder");
var request = require("request");
var multer = require("multer");
var middleware = require("../middleware"); //will automatically require contents of index.js if not specified.
var Campground = require("../models/campground");
var Notification = require("../models/notification");
var User = require("../models/user");


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
router.post("/", middleware.isLoggedIn, upload.single("image"), async function(req, res){
    try{
        //geoData
        let geoData = await geocoder.geocode(req.body.campground.location);
        req.body.campground.lat = geoData[0].latitude;
        req.body.campground.lng = geoData[0].longitude;
        req.body.campground.location = geoData[0].formattedAddress;
        
        //image + author data
        let cloudinaryRes = await cloudinary.uploader.upload(req.file.path);
        req.body.campground.image = cloudinaryRes.secure_url;
        req.body.campground.imageId = cloudinaryRes.public_id;
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username
        };
        
        let newlyCreated = await Campground.create(req.body.campground);
        
        //notification
        let user = await User.findById(req.user._id).populate("followers").exec();
        let newNotification = {
            username: req.user.username,
            campgroundId: newlyCreated.id
        }
        for(const follower of user.followers){
            let notification = await Notification.create(newNotification);
            follower.notifications.push(notification);
            follower.save();
        }
        
        res.redirect(`/campgrounds/${newlyCreated.id}`);
        
    } catch(err){
        req.flash('error', err.message);
        return res.redirect('back');
    }
    
});


//     geocoder.geocode(req.body.campground.location, function(err, data){
//         if(err || !data.length){
//           req.flash('error', 'invalid address');
//           return res.redirect('back');
//         } else{
//             req.body.campground.lat = data[0].latitude;
//             req.body.campground.lng = data[0].longitude;
//             req.body.campground.location = data[0].formattedAddress;
//             // var newCampground = {name:name, price:price, image:image, description:desc, author: author, location: location, lat: lat, lng: lng};
//             //cloudinary image upload
//             cloudinary.uploader.upload(req.file.path, function(result){ //bad to have multiple callbcaks??? YES!
//                 req.body.campground.image = result.secure_url;
//                 req.body.campground.imageId = result.public_id;
//                 req.body.campground.author = {
//                     id: req.user._id,
//                     username: req.user.username
//                 };
//                 Campground.create(req.body.campground, function(err, newlyCreated){
//                     if(err){
//                         req.flash("error", err.message);
//                         return res.redirect("back");
//                     } else {
//                         console.log(newlyCreated);
//                         res.redirect(`/campgrounds/${newlyCreated.id}`); //defaults to get request if repeat!
//                     }
//                 });
//             });
//         }
//     });
// });

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

        Campground.findByIdAndUpdate(req.params.id, req.body.campground, async function(err, updatedCampground){
            if(err){
                
            } else{
                if (req.file){
                    
                    try {
                        await cloudinary.v2.uploader.destroy(updatedCampground.imageId);
                        var result = await cloudinary.v2.uploader.upload(req.file.path);
                        updatedCampground.imageId = result.public_id;
                        updatedCampground.image = result.secure_url; //anything outside of campground needs to be updated separately.
                    } catch(err) {
                        req.flash("error", err.message);
                        res.redirect("back");
                    }
                    
                }
                updatedCampground.save();
                req.flash("success", "Successfully Updated!");
                res.redirect(`/campgrounds/${req.params.id}`);
            }
        }); 
    });
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, async function(deletedCampground){
        try{
            await cloudinary.v2.uploader.destroy(deletedCampground.imageId);
            res.redirect("/campgrounds");
        } catch(err){
            if(err){
                req.flash("error", err.message);
                return res.redirect("back");
            }
        }
    });
});


function escapeRegex(text){ //hoisting
    return text.replace(/[-[\]{}()*+?.,\\^$!#\s]/g, "\\$&");
}


module.exports = router;