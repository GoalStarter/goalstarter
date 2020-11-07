var admin = require("firebase-admin");

var serviceAccount = require("./goal-starter-firebase-adminsdk-ttj4z-20c84e7a06.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://goalstarter.firebaseio.com"
  });

module.exports.admin = admin; 