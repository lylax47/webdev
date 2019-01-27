var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Review = require("../models/review");
var middleware = require("../middleware");

//REVIEW INDEX
router.get("/", async function(req, res){
    try {
        let campground = await Campground.findById(req.params.id).populate({
            path: "reviews",
            options: {sort: {createdAt: -1}}
        }).exec();
        res.render("reviews/index", {campground: campground});
        
    } catch(err){
        req.flash("error", err.message);
        return res.redirect("back");
    }
});

//REVIEW NEW
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, async function(req, res){
    try {
        let campground = await Campground.findById(req.params.id);
        res.render("reviews/new", {campground: campground});
    } catch(err){
        req.flash("error", err.message);
        return res.redirect("back");
    }
});

//REVIEWS CREATE
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, async function(req, res){
    try{
        let campground = await Campground.findById(req.params.id).populate("reviews").exec();
        let review = await Review.create(req.body.review);
        review.author.id = req.user._id;
        review.author.username = req.user.username;
        review.campground = campground;
        review.save();
        campground.reviews.push(review); //make sure to push new material to connects dbs.
        campground.rating = calculateAverage(campground.reviews);
        campground.save();
        res.redirect("/campgrounds/" + campground._id);
        
    } catch(err){
        req.flash("error", err.message);
        return res.redirect("back");
    }
    
});

//EDIT ROUTE
router.get("/:reviewId/edit", middleware.checkReviewOwnership, async function(req, res){
    try{
        let foundReview = await Review.findById(req.params.review_id);
        res.render("reviews/edit", {campground_id: req.params.id, review: foundReview});
    } catch(err){
        req.flash("error", err.message);
        res.redirect("back");
    }
});

//UPDATE ROUTE
router.put("/:review_id", middleware.checkReviewOwnership, async function(req, res){
    try{
        let updatedReview = await Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true});
        let campground = await Campground.findById(req.params.id).populate("reviews").exec();
        campground.rating = calculateAverage(campground.reviews);
        campground.save();
        req.flash("success", "Your review was successfully edited.");
        res.redirect("/campgrounds/" + campground._id);
    } catch(err){
        req.flahs("error", err.messsage);
        res.redirect("back");
    }
});

//DELETE ROUTE
router.delete("/:review_id", middleware.checkReviewOwnership, function(req, res){
    try{
        let review = Review.findByIdAndRemove(req.params.review_id);
        let campground = Campground.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec();
        campground.calculateAverage(campground.reviews);
        campground.save();
        req.flash("success", "Your review was deleted successfully.");
        res.redirect("/campgrounds/" + req.params.id);
    } catch(err){
        req.flash("error", err.message);
        res.redirect("back");
    }
});

//Calculate avg function
function calculateAverage(reviews){
    if (reviews.length === 0){
        return 0;
    } else {
        var sum = 0;
        reviews.forEach(function(element){
            sum += element.rating;
        });
        var avg = sum/reviews.length;
        return avg;
    }
}

module.exports = router;