const MongoClient = require("mongodb").MongoClient;
var express = require("express"); 
var {AudienceClientID,client}=require('./app')
const { admin } =require( './config')
var {notification_options}=require('./push')
const bodyParser=require('body-parser')
const cors=require('cors');
var app = express();
app.use(express.json()); 
app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())


const months = ["January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"
];

const list = [
    {id: "test1",
    title: "I want to pass CPEN 331", 
    author: "Eric", 
    date: "October 22, 2020",
    content: "The class is extremely difficult. I will try my best to pass the course and not fail or get depression", 
    milestones: [],
    schedule: [], 
    tag: "undergraduate",
    comments: ["Good Job", "I hope I pass too"], 
    likes: 12
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
    likes: 0
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
    likes: 100
    }
];

//connect mongoclient 
MongoClient.connect("mongodb://localhost:27017", {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
    if(err) throw err; 
    console.log("GoalStarter Database created\n");
    //create a database
    db = client.db("dbtest"); 

    //create a collectiion for storing goals
    db.createCollection("goals", function(err, res) {
        if(err) throw err; 
        console.log("Goal Collection Created\n"); 
    });
        //create a collection for storing users. 
    db.createCollection("users", function(err, res) {
        if(err) throw err; 
        console.log("User Collection Created\n"); 
    });

 

});  


app.get('/home', (req, res) => {
    var userid = req.params.userid; 
    //var list = feed.getFeed(userid);
    res.send(list); 
});

app.get('/home/view_goals/:userid', async (req, res) => { 
    var userid = req.params.userid; 
    console.log("v3");  
    fetchId = async (name) => {
        return db.collection("users").findOne({"id" : name}, {"posts":1}).then(user=>user.posts); 
    }
    fetchGoal = async (goalids, i) => {
        return db.collection("goals").findOne({"id" : goalids[i]}).then(goal=>goal);
    }
    let goalids = await fetchId(userid); 
    console.log(goalids);
    var goals = [];
    var post_length = 0; 
    if(undefined != goalids && goalids.length) {
        post_length = goalids.length; 
    }
    console.log(post_length); 
    for(var i = 0; i < post_length; i++) {
        let goal = await fetchGoal(goalids, i);
        // var d = Date.parse(goal.schedule[goal.status]);
        // var d_now = new Date(); 
        // if(d_now.now() >= d) {
        //     goal.needupdate = 1; 
        // }
        console.log(goal); 
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
  }

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: AudienceClientID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    })
    const payload = ticket.getPayload();
  
    newUser.id = ticket.getUserId()
     newUser.email=payload['email']
     newUser.username=payload['name']
     
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
  }

app.post('/login',async (req,res)=>{
    var token =req.body.idToken
     console.log(token)
    
        try {
            await verify(token)
            console.log(newUser.id)
            console.log(newUser.email)
            console.log(newUser.username)
            res.status(200).send({
                method:'Post',
                idToken:token,
                userid:newUser.id,
                name:newUser.username,
                email:newUser.email
               
               })
               
        } catch (error) {
            res.status(401).send({
                error:error.message
               })
        }
        
      
     try{
        const result=await db.collection("users").findOne({"id":newUser.id});
       if(result==null){ 
      db.collection("users").insertOne(newUser);
       }
    }
    catch(err){
        res.status(404).send({
            err:err.message,
            message:'User did not insert successfully'
        })
    }
    
}); 


   app.post('/firebase/notification', (req, res)=>{
    const  registrationToken = req.body.registrationToken
    const message = req.body.message
    const options =  notification_options
    
      admin.messaging().sendToDevice(registrationToken, message, options)
      .then( response => {

       res.status(200).send("Notification sent successfully")
       
      })
      .catch( error => {
          console.log(error);
      });

});

app.post('/home/create_goal/:userid', (req, res) => {
    //generate date string 
    var now = new Date(Date.now()); 
    var date_string = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`; 
    console.log(req); 
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
        "id": id, 
        "title": title, 
        "author": author, 
        "date": date_string, 
        "content": content, 
        "milestones": milestones, 
        "schedule": schedule,
        "tag": tag, 
        "comments": comments, 
        "likes": likes,
        "updates" : updates, 
        "status" : status,
        "needupdate" : needupdate
    }
    db.collection("goals").insertOne(goal); 
    db.collection("users").updateOne({"id": userid}, {
        $push: {
            "posts": id
        }
    });

    res.status(200).send("goal created"); 
});

app.put('/home/comment/:userid', (req, res) => {

    var comment = `${req.body.author} : ${req.body.comment}`;
    var id = req.body.id; 
    var userid = req.params.userid; 
    var now = new Date(Date.now()); 
    var date = `${now.getMonth()} ${now.getDay()}, ${now.getFullYear()}`;

    db.collection("goals").updateOne({"id": id}, {$push: {
        "comments": comment
    },
        $set: {
            "date": date
        }
    });

    db.collection("users").updateOne({"id": userid}, {
        $push: {
            "comments": id
        }
    });

    res.send("comment inserted"); 
});

app.put('/home/like/:userid', (req, res) => {
    var id = req.body.id; 
    var userid = req.params.userid; 
    var now = new Date(Date.now()); 
    var date = `${now.getMonth()} ${now.getDay()}, ${now.getFullYear()}`;

    db.collection("goals").updateOne({"id": id}, {$inc: {
        "likes" : 1
    },
        $set: {
            "date" : date 
        }
    });
    
    db.collection("users").updateOne({"id": userid}, {
        $push: {
            "likes": id 
        }
    });

    res.send("like recorded");  
});

app.put('/home/update_goal/updateone', async (req, res) => {
    var goalid = req.body.goalid; 
    var update = req.body.update; 

    var step = await db.collection("goals").findOne({"id" : goalid}).status; 
    step = step + 1; 

    db.collection("goals").updateOne({"id": goalid}, {
        $push: {"updates" : update},
        $set: {
            "status" : step,
            "needupdate" : 0 
        }
    });

});

module.exports = app; 