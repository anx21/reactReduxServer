const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const router = require('./router');
const mongoose = require('mongoose');
const cors = require('cors');

//DB setup
mongoose.connect('mongodb://localhost:auth/auth');

//App
app.use(morgan('combined'));
app.use(bodyParser.json({ type: '*/*' }))
app.use(cors());
router(app);

//Server
const port = process.env.PORT || 3090;
const server = http.createServer(app);
const socket_io = require('socket.io');

server.listen(port);

var io = socket_io();
io.attach(server);
io.on('connection', function(socket){
  console.log("Socket connected: " + socket.id);
  socket.on('action', (action) => {
    if(action.type === 'server/hello'){
      console.log("Socket ID: " + socket.id);
      console.log('Got hello data!', action.data);
      socket.emit('action', {type:'message', data:'good day!'});
    }
  });
});

console.log('Server listening on:', port);
