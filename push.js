const express=require("express"); 
const bodyparser= require( "body-parser");


const app = express();
app.use(bodyparser.json());


const notificationOptions = {
    priority: "high",
    timeToLive: 60 * 60 * 24
  };

module.exports={notificationOptions};