var faker = require("faker");

var products = Array.from({length:10}, () => faker.commerce.productName());
var prices = Array.from({length:10}, () => faker.commerce.price())

var strOut = "";
for(var i=0; i<10; i++){
    strOut += `${products[i]} - $${prices[i]} \n`
}

console.log('====================\n'+
'WELCOME TO MY SHOP!\n'+
'====================\n'+
`${strOut}`);