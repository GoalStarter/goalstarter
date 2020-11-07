const app = require('./goalstarterMVP');

const port = process.env.PORT || 3000; 
var server = app.listen(port, () => console.log(`Hello, Listening on port ${port}`));