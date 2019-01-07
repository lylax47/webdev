var express = require("express");
var router = express.Router();
var passport = require("passport");
var async = require("async");
var { google } = require("googleapis");
var OAuth2 = google.auth.OAuth2;
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var Notification = require("../models/notification");
var User = require("../models/user");
var Campground = require("../models/campground");



//ROUTE ROUTE
router.get("/", function(req, res){
    res.render("landing");
});



// REGISTER ROUTES
router.get("/register", function(req, res){
    res.render("auth/register", {page:'register'});
});

router.post("/register", function(req, res){
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatarUrl,
    });
    if(req.body.adminCode === "admin"){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", `${err.message}`)
            return res.redirect("back");
            
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", `You have successfully signed up! Welcome to YelpCamp, ${user.username}`);
            res.redirect("/campgrounds");
        });
    });
});


//LOGIN ROUTES
router.get("/login", function(req, res){
    res.render("auth/login", {page:'login'});
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
    req.flash("success", "You've Been Logged Out!");
    res.redirect("/campgrounds");
});

//FORGOT PASSWORD ROUTE
router.get("/forgot", function(req, res){
    res.render("auth/forgot");
});

router.post("/forgot", function(req, res, next){
    async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err, buf){ //create hash
                var token = buf.toString("hex");
                done(err, token);
            });
        },
        function(token, done){
            User.findOne({email:req.body.email}, function(err, user){
                if(err){
                    req.flash("error", err.message);
                    res.redirect("back");
                }
                if (!user){
                    req.flash("error", "No account with that email address exists.");
                    return res.redirect("/forgot");
                }
               
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000;
               
                user.save(function(err){
                    done(err, token, user);
                });
            });
        },
        function(token, user, done){
            var smtpTransport = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth:{
                    type: "OAuth2",
                    user: "jjlyell@gmail.com",
                    clientId: process.env.CLIENTID,
                    clientSecret: process.env.CLIENTSECRET,
                    refreshToken: process.env.REFRESHTOKEN,
                    accessToken: process.env.ACCESSTOKEN,
                    expires:3600
                }
            });
            var mailOptions = {
                to: user.email,
                from: "jjlyell@gmail.com",
                subject: "YelpCamp Password Reset",
                text: `You are receiving this because you (or someone else) has requested a password reset.\n\n
                Please click on the link, or paste into your browser to complete the reset\n\n
                http://${req.headers.host}/reset/${token}\n\n
                If you did not request this please ignore this email and your password will remain the same.`
            };
            smtpTransport.sendMail(mailOptions, function(err){
                console.log("email was sent!");
                req.flash("success", `An email has been sent to ${user.email} with further instructions.`);
                done(err, done);
            });
        }
     ], function(err){
         if(err) return next(err);
         res.redirect("/forgot");
    }); 
});

//RESET ROUTE
router.get("/reset/:token", function(req, res){
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()} }, function(err, user){
        if(!user){
            req.flash("error", "Password reset token is invalid or has expired.");
            res.redirect("/forgot");
        }
        res.render("auth/reset", {token: req.params.token});
    });
});

router.post("/reset/:token", function(req, res){
    async.waterfall([
        function(done){
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()} }, function(err, user){
                if(!user){
                    req.flash("error", "Password reset token is invalid or has expired.");
                    return res.redirect("back");
                }
                if(req.body.newPassword == req.body.confirm){
                    user.setPassword(req.body.newPassword, function(err){ //mongoose function for hashing etc.
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
                        
                        user.save(function(err){
                            req.logIn(user, function(err){
                                done(err, user);
                            });
                        });
                    });
                } else{
                    req.flash("error", "passwords do not match");
                    return res.redirect("back");
                }
            });
        },
        function(user, done){
            var smtpTransport = nodemailer.createTransport({
               host: "smtp.gmail.com",
               port: 465,
               secure: true,
               auth:{
                   type: "OAuth2",
                   user: "jjlyell@gmail.com",
                   clientId: process.env.CLIENTID,
                   clientSecret: process.env.CLIENTSECRET,
                   refreshToken: process.env.REFRESHTOKEN,
                   accessToken: process.env.ACCESSTOKEN,
                   expires:3600
               }
            });
            var mailOptions = {
               to: user.email,
               from: "jjlyell@gmail.com",
               subject: "YelpCamp Password Has Been Changed",
               text: `This is confirmation that the password for ${user.email} has been changed.`,
           };
           smtpTransport.sendMail(mailOptions, function(err){
               console.log("email was sent!");
               req.flash("success", `Your password has been changed.`);
               done(err);
           });
        }
    ], function(err){
        res.redirect("/campgrounds");
    });
});


//USER PROFILE ROUTE
router.get("/users/:id", async function(req, res){
    User.findById(req.params.id, function(err, foundUser){
       if(err){
           req.flash("error", `${err.message}`);
           res.redirect("back");
       } else{
           Campground.find({"author.id": foundUser._id}, function(err, campgrounds){
               if(err){
                   req.flash("error", `${err.message}`);
                   res.redirect("back");
                } else{
                    res.render("users/show", {user:foundUser, campgrounds:campgrounds});
                }
           });
       }
    });
});

//FOLLOW ROUTE
router.get("/follow/:id", isLoggedIn, async function(req, res){
    try {
        let user = await User.findById(req.params.id);
        user.followers.push(req.user._id);
        user.save();
        req.flash("success", `Successfully followed ${user.username}!`);
        res.redirect(`/users/${req.params.id}`);
    } catch(err){
        req.flash("error", err.message);
        res.redirect("back");
    }
});

//VIEW NOTIFICATIONS ROUTE
router.get("/notifications", isLoggedIn, async function(req, res){
    try{
        let user = await User.findById(req.user._id).populate({
            path: "notifications",
            options: {sort: {"_id": -1}}
        }).exec();
        let allNotifications = user.notifications;
        res.render("notifications/index", {allNotifications});
    } catch(err){
        req.flash("error", err.message);
        res.redirect("back");
    }
});

//HANDLE NOTIFICATIONS ROUTE
router.get("/notifications/:id", isLoggedIn, async function(req, res){
    try{
        let notification = await Notification.findById(req.params.id);
        notification.isRead = true;
        notification.save();
        res.redirect(`/campgrounds/${notification.campgroundId}`);
    } catch(err){
        req.flash("error", err.message);
        res.dedirect("back");
    }
})

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}



module.exports = router;