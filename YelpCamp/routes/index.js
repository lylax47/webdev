var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");


//ROUTE ROUTE
router.get("/", function(req, res){
    res.render("landing");
});



// REGISTER ROUTES
router.get("/register", function(req, res){
    res.render("auth/register");
});

router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("auth/register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/campgrounds");
        });
    });
});


//LOGIN ROUTES
router.get("/login", function(req, res){
    res.render("auth/login");
});

router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
});

//LOGOUT ROUTE
router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;