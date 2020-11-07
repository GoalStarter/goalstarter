const request = require("supertest");
const app = require('./goalstarterMVP');
const request = supertest(app); 

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

describe('testing feed maanger mock', function () {
    it('responds to GET /home', async (done) => {
    const response = await request.get('/home'); 

    expect(response.status).toBe(200); 
    expect(response.body).toBe(list); 
    done();
  });
}); 
