var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/cat_app", {useNewUrlParser:true}); //db created automatically

var catSchema = new mongoose.Schema({
   name: String,
   age: Number,
   temperament: String,
});

var Cat = mongoose.model("Cat", catSchema); //Creates the cat object on which you can use mongo methods. Use caps for var. Should be singular version of collection name.

// var george = new Cat({
//     name: "Mrs. Norris",
//     age: 3000,
//     temperament: "Anxious",
// });

// george.save(function(err, cat){
//     if(err){
//         console.log("Something went wrong.");
//     } else{
//         console.log("Cat saved sucessfully!\n", cat);
//     }
// });

// new and save all at once!
Cat.create({
    name: "Snow White",
    age: 47,
    temperament: "Eloquent"
}, function(err, cat){
    if(err){
        console.log("Error\n", err);
    } else{
        console.log("Cat saved\n", cat);
    }
})

Cat.find({}, function(err, cats){
   if(err){
       console.log("error");
       console.log(err);
   } else{
       console.log("All cats...\n", cats);
   }
});