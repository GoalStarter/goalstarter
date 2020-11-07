const express=require('express')

const {OAuth2Client} = require('google-auth-library');

ClientID="270283078640-b1n995h94o3jm1oevmqo4slthg6orhbu.apps.googleusercontent.com"
AudienceClientID="534895538157-17o22r3tq7fn6g6pnhoe0rpl4qskq5ng.apps.googleusercontent.com"
const client = new OAuth2Client(ClientID);
//Middlewares





module.exports= {AudienceClientID,client}
