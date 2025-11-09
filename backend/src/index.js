const express = require('express');
const app = express();
require('dotenv').config();
const main = require('./config/db');
const cookieParser = require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const aiRouter = require("./routes/aiChatting");
const videoRouter = require("./routes/videoCreator");
const cors = require('cors');

// ✅ CORS setup for local + Vercel frontend
app.use(cors({
  origin: [
    'http://localhost:5173', // local development
    'https://leetcode-clone.vercel.app', // Vercel main deploy
    'https://leetcode-clone-ten-blond.vercel.app', // Vercel preview
    'https://leetcode-clone-git-main-yashwantupadhyay-coders-projects.vercel.app' // alternate deploy
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ All Routes
app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use('/video', videoRouter);

// ✅ Default route (Render test)
app.get('/', (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.send('✅ Backend is running successfully on Render!');
});

// ✅ Initialize DB + Server
const InitalizeConnection = async () => {
  try {
    await Promise.all([main(), redisClient.connect()]);
    console.log('✅ Database & Redis connected successfully.');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log('🚀 Server listening at port number: ' + PORT);
    });

  } catch (err) {
    console.error('❌ Error: ', err);
  }
};

InitalizeConnection();


// const express = require('express')
// const app = express();
// require('dotenv').config();
// const main =  require('./config/db')
// const cookieParser =  require('cookie-parser');
// const authRouter = require("./routes/userAuth");
// const redisClient = require('./config/redis');
// const problemRouter = require("./routes/problemCreator");
// const submitRouter = require("./routes/submit")
// const aiRouter = require("./routes/aiChatting")
// const videoRouter = require("./routes/videoCreator");
// const cors = require('cors')

// // console.log("Hello")

// app.use(cors({
//     origin: 'http://localhost:5173',
//     credentials: true 
// }))

// app.use(express.json());
// app.use(cookieParser());

// app.use('/user',authRouter);
// app.use('/problem',problemRouter);
// app.use('/submission',submitRouter);
// app.use('/ai',aiRouter);
// app.use("/video",videoRouter);


// app.get("/", (req, res) => {
//   res.send("✅ Backend is running successfully on Render!");
// });

// const InitalizeConnection = async ()=>{
//     try{

//         await Promise.all([main(),redisClient.connect()]);
//         console.log("DB Connected");
        
//         app.listen(process.env.PORT, ()=>{
//             console.log("Server listening at port number: "+ process.env.PORT);
//         })

//     }
//     catch(err){
//         console.log("Error: "+err);
//     }
// }


// InitalizeConnection();

