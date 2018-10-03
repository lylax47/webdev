var express = require("express");
var app = express();

app.get("/", function(req, res){
   res.send("Hi there, welcome to my assignment!");
});

app.get("/speak/:animal", function(req, res){
    var animal = req.params.animal;
    var stdOut = `The ${animal} says `;
    if (animal === "pig"){
        res.send(stdOut + "'Oink'");
    } else if (animal === "cow"){
        res.send(stdOut + "'Moo'");
    } else {
        res.send(stdOut + "'Woof Woof!");
    }
});

app.get("/repeat/:word/:number", function(req, res){
    var word = req.params.word;
    var number = req.params.number;
    res.send(`${word} `.repeat(number));
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("starting app...");
});