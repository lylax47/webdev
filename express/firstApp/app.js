var express = require("express");
var app = express();

app.get("/", function(req, res){
   res.send("Hi there!"); 
});

app.get("/bye", function(req, res){
   res.send("goodbye");
});

app.get("/dog", function(req, res){
    res.send("MEOW");
});

// port coming from cloud 9
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started...")
});