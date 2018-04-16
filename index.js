const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  const rooms = [
      { title: 'Room 1', name: 'room1' },
      { title: 'Room 2', name: 'room2' },
      { title: 'Room 3', name: 'room3' }
    ];

  res.render('./index', { rooms });
});

app.get('/rooms/*', (req, res) => {
  res.render('./chat');
});

io.on('connection', function(socket) {
  console.log('a user connected');

  let room;
  app.get('/rooms/:room', (req, res) => {
    room = req.params.room;
  });

  socket.join(room);

  socket.broadcast.to(room).emit('user-joined');

  socket.on('chat message', function(msg) {
    io.to(room).emit('chat message', msg)
  });

  socket.on('disconnect', function() {
    console.log('user disconnected');

    socket.leave(room);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
