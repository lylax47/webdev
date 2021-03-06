require('dotenv').config();

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    flash = require("connect-flash"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    User = require ("./models/user"),
    seedDB = require("./seeds");
    
var commentRoutes = require("./routes/comments"),
    reviewRoutes = require("./routes/reviews"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index");


mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser:true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(`${__dirname}/public`));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); //Seed database if needed. Will remove current data.


app.locals.moment = require("moment");
//PASSPORT CONFIG
app.use(require("express-session")({
    secret:"This is a secret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware for every route.
app.use(async function(req, res, next){
    res.locals.currentUser = req.user;
    if(req.user){
        try{
            let user = await User.findById(req.user._id).populate("notifications", null, {isRead: false}).exec();
            console.log(user)
            res.locals.notifications = user.notifications.reverse();
       } catch(err){
           console.log(err.message);
       }
   }
   res.locals.error = req.flash("error"); //will always pass some variable to routes
   res.locals.success = req.flash("success");
   next();
});

app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The YelpCamp server has started...");
});