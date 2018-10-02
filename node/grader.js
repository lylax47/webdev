
function average(grades){
    console.log(Math.round(grades.reduce(function(p,c,i,a){return p + (c/a.length)}, 0)));
}



var scores = [90, 98, 89, 100, 100, 86, 94];
average(scores);

var scores = [40, 65, 77, 82, 80, 54, 73, 63, 95, 49];
average(scores);