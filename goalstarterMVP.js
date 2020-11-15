const MongoClient = require("mongodb").MongoClient;
var express = require("express"); 
var {AudienceClientID,client}=require("./app");
const { admin } =require( "./config");
var {notificationOptions}=require("./push");
const bodyParser=require("body-parser");
const cors=require("cors");
var app = express();
app.use(express.json()); 
app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


const months = ["January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"
];

const init = [
    {id: "test1",
    title: "I want to pass CPEN 331", 
    author: "Eric", 
    date: "October 22, 2020",
    content: "The class is extremely difficult. I will try my best to pass the course and not fail or get depression", 
    milestones: [],
    schedule: [], 
    tag: "undergraduate",
    comments: ["Good Job", "I hope I pass too"], 
    likes: 12,
    updates : [],
    status : 0,
    needupdate : 0
    }, 
    {id: "test2", 
    title: "I want to get Diamond in League", 
    author: "Jason", 
    date: "October 21, 2020",
    content: "I am a hardstuck Wood V Jax main. I want to climb the ladder with Annie and Zed", 
    milestones: [],
    schedule: [], 
    tag: "LoL",
    comments: ["Good Luck", "You suck"], 
    likes: 0,
    updates : [],
    status : 0,
    needupdate : 0
    }, 
    {id: "test3",
    title: "I want to become the Prime Minister of Canada", 
    author: "Steven", 
    date: "July 1, 2019",
    content: "I believe I should be the Prime Minister of Canada, Trudeau is a terrible and corrupt leader and I will do better", 
    milestones: [],
    schedule: [], 
    tag: "employment",
    comments: ["I voted for you", "What qualifies you for this position?"], 
    likes: 100,
    updates: [],
    status : 0,
    needupdate : 0
    }
];

const test_user = {
    "id":"123",
    "username":"Tor Ammodt",
    "email":"de1soc@gmail.com",
    "friendslist":[],
    "posts":[],
    "comments":[],
    "likes":[]
}; 

const tags= ["weightloss", "competitive sports", "running", "weight training", "medical school", "employment", "undergraduate", "masters/PhD", "diet", "LoL", "Valorant", "Overwatch"];

//connect mongoclient 
MongoClient.connect("mongodb://localhost:27017", {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
    if(err) {throw err;}  
    //create a database
    db = client.db("dbtest"); 
    console.log("starting"); 

    //create a collectiion for storing goals
    db.createCollection("goals", function(err, res) {
        if(err) {throw err;}  
    });
        //create a collection for storing users. 
    db.createCollection("users", function(err, res) {
        if(err) {throw err;}  
    });

    for(var i = 0; i < 3; i++) { 
        db.collection("goals").insertOne(init[i]); 
    }

    db.collection("users").insertOne(test_user); 
});  

app.get("/home/:userid", async (req, res) => {
    var userid = req.params.userid; 
    console.log(userid);

    var fetchUser = async (name) => {
        return db.collection("users").findOne({"id" : name}).then((user) => user); 
    };
    var fetchGoal = async (goal) => {
        return db.collection("goals").findOne({"id" : goal}).then((goal) => goal); 
    };
    var fetchGoalbyTag = async (goal_tag, limit) => {
        return db.collection("goals").findOne({"tag" : goal_tag}).limit(limit); 
    };
    var feed = []; 
    var limit = 10; 

    //first add the most recent goal of each friend
     
    let user = await fetchUser(userid); 
    console.log(user); 
    let friends = user.friendslist; 
    for(var i = 0; i < friends.length && feed.length < limit; i++) {
        let friend = await fetchUser(friends[i]);  
        var post = friend.posts[friend.posts.length - 1]; 
        feed.push(post); 
    }

    if(user.posts.length > 0 && feed.length < limit) {
        let id = user.posts[user.posts.length - 1]; 
        let post = await fetchGoal(id); 
        let tag = post.tag; 
        let posts = fetchGoalbyTag(tag, limit - feed.length); 
        feed.concat(posts);
    }   

    if(feed.length < limit) {
        feed.concat(init); 
    }

    res.send(feed); 
});

app.get("/home/view_goals/:userid", async (req, res) => { 
    var userid = req.params.userid;
    var fetchGoal = async (goalid) => {
        return db.collection("goals").findOne({"id" : goalid}).then((goal) => goal);
    };
    var fetchId = async (name) => {
        return db.collection("users").findOne({"id" : name}, {"posts":1}).then((user) => user.posts); 
    };
    let goalids = await fetchId(userid);  
    console.log(goalids);
    var goals = [];
    for(var i = 0; i < goalids.length; i++) {
        let goal = await fetchGoal(goalids[i]);
        // var d = Date.parse(goal.schedule[goal.status]);
        // var d_now = new Date(); 
        // if(d_now.now() >= d) {
        //     goal.needupdate = 1; 
        // }
        //console.log(goal); 
        JSON.stringify(goal); 
        goals.push(goal); 
    }
    res.send(goals); 
});

let newUser={
    "id":"",
    "username":"",
    "email":"",
    "friendslist":[],
    "posts":[],
    "comments":[],
    "likes":[]
  };

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: AudienceClientID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    }); 
    const payload = ticket.getPayload();
  
    newUser.id = ticket.getUserId();
     newUser.email=payload["email"];    
     newUser.username=payload["name"];
     
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
  }

app.post("/login",async (req,res) => {
    var token =req.body.idToken; 
     //console.log(token);
    
        try {
            await verify(token);
            console.log(newUser.id);
            console.log(newUser.email);
            console.log(newUser.username);
            res.status(200).send({
                method:"Post",
                idToken:token,
                userid:newUser.id,
                name:newUser.username,
                email:newUser.email
               
               }); 
               
        } catch (error) {
            res.status(401).send({
                error:error.message
               });
        }
        
      
    try {
        const result=await db.collection("users").findOne({"id":newUser.id});
        if(result==null){ 
        db.collection("users").insertOne(newUser);
        }
    }
    catch(err){
        res.status(404).send({
            err:err.message,
            message:"User did not insert successfully"
        }); 
    }
    
}); 


   app.post("/firebase/notification", (req, res ) => {
    const  registrationToken = req.body.registrationToken;  
    const message = req.body.message;
    const options =  notificationOptions;
    
      admin.messaging().sendToDevice(registrationToken, message, options)
      .then( (response) => {

       res.status(200).send("Notification sent successfully"); 
       
      })
      .catch((error) => {
          //console.log(error);
      });

});

app.post("/home/create_goal/:userid", (req, res) => {
    //generate date string 
    var now = new Date(Date.now()); 
    var dateString = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`; 
    //temporary postid is a concat of userid, date posted, and title of post. 
    var id = `${req.params.userid}${req.body.title}`;
    var userid = req.params.userid; 

    //fill in goal fields.
    var title = req.body.title; 
    var author = req.body.author; 
    var content = req.body.content; 
    var milestones = req.body.milestones; 
    var schedule = req.body.schedule; 
    var tag = req.body.tag; 
    var comments = [];
    var likes = 0; 
    var updates = []; 
    var status = 0; 
    var needupdate = 0; 

    if(!title || !author || !content || !tag) {
        res.status(400).send("request incomplete"); 
        return;
    }

    var goal = {
        id, 
        title, 
        author, 
        date : dateString, 
        content, 
        milestones, 
        schedule,
        tag, 
        comments, 
        likes,
        updates, 
        status,
        needupdate
    }; 
    db.collection("goals").insertOne(goal); 
    db.collection("users").updateOne({"id": userid}, {
        $push: {
            "posts": id
        }
    });

    res.status(200).send("goal created"); 
});

app.put("/home/comment/:userid", (req, res) => {

    var comment = `${req.body.author} : ${req.body.comment}`;
    var id = req.body.id; 
    var userid = req.params.userid; 
    var now = new Date(Date.now()); 
    var date = `${now.getMonth()} ${now.getDay()}, ${now.getFullYear()}`;

    db.collection("goals").updateOne({id}, {$push: {
        "comments": comment
    },
        $set: {
            date
        }
    });

    db.collection("users").updateOne({"id": userid}, {
        $push: {
            "comments": id
        }
    });

    res.send("comment inserted"); 
});

app.put("/home/like/:userid", (req, res) => {
    var id = req.body.id; 
    var userid = req.params.userid; 
    var now = new Date(Date.now()); 
    var date = `${now.getMonth()} ${now.getDay()}, ${now.getFullYear()}`;

    db.collection("goals").updateOne({id}, {$inc: {
        "likes" : 1
    },
        $set: {
            date 
        }
    });
    
    db.collection("users").updateOne({"id": userid}, {
        $push: {
            "likes": id 
        }
    });

    res.send("like recorded");  
});

// app.put("/home/update_goal/updateone", async (req, res) => {
//     var goalid = req.body.goalid; 
//     var update = req.body.update; 

//     var step = await db.collection("goals").findOne({"id" : goalid}).status; 
//     step = step + 1; 

//     db.collection("goals").updateOne({"id": goalid}, {
//         $push: {"updates" : update},
//         $set: {
//             "status" : step,
//             "needupdate" : 0 
//         }
//     });

// });

module.exports = app; 