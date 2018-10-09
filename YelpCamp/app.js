var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


var campgrounds = [
   {name: "Bass River", image: "https://c2.staticflickr.com/8/7215/7182369178_5572295ce0.jpg"},
   {name: "Badger Prairie", image: "https://c1.staticflickr.com/5/4044/4175370953_5488caf554.jpg"},
   {name: "Willow Rest", image: "https://c1.staticflickr.com/5/4082/4756767667_fe48b8e42a.jpg"},
   ]; 


app.get("/", function(req, res){
    res.render("landing");
});

app.get("/campgrounds", function(req, res){
    res.render("campgrounds", {campgrounds: campgrounds});
});

app.post("/campgrounds", function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var newCampground = {name:name, image:image};
    campgrounds.push(newCampground);
    res.redirect("/campgrounds") //defaults to get request!
});

app.get("/campgrounds/new", function(req, res){
    res.render("new")
})

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The YelpCamp server has started...");
});