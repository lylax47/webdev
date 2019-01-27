var Campground = require("../models/campground");
var Comment = require("../models/comment");
var Review = require("../models/review");

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                req.flash("error", "Campground not found...");
                res.redirect("back");
            } else{
                if (!foundCampground) {
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                }
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){ //will handle admin as well
                    next();
                } else{
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next){
        if(req.isAuthenticated()){
            Comment.findById(req.params.comment_id, function(err, foundComment){
                if(err){
                    res.redirect("back");
                } else{
                    if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                        next();
                    } else{
                        req.flash("error", "You don't have permission to do that");
                        res.redirect("back");
                    }
                }
            });
        } else{
            req.flash("error", "You need to be logged in to do that");
            res.redirect("back");
        }
};

middlewareObj.checkReviewOwnership = async function(req, res, next){
    if(req.isAuthenticated()){
        try{
            let foundReview = await Review.findById(req.params.review_id);
            if(foundReview.author.id.equals(req.user._id)){
                next();
            }
            
        } catch(err){
            req.flash("error", "You don't have permission to do that.");
            res.redirect("back");
        }
       
    } else{
        req.flash("error", "You must be logged in to do that.");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = async function(req, res, next){
    if(req.isAuthenticated){
        try{
            let foundCampground = await Campground.findById(req.params.id).populate("reviews");
            if(!foundCampground){
                req.flash("error", "campground does not exist.");
                res.redirect("back");
            } else{
                let foundUserReview = await foundCampground.reviews.some( function(review){
                    return review.author.id.equals(req.user._id);
                });
                if(foundUserReview){
                    req.flash("error", "You already wrote a review.");
                    res.redirect("/campgrounds/" + foundCampground._id);
                } else{
                    next();
                }
            }
        } catch(err){
            req.flash("error", err.message);
        }
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
};


module.exports = middlewareObj;