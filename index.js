const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let clients = [];

app.set('view engine', 'ejs');

app.use((req, res, next) => {
  req.io = io;
  next();
});

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

  socket.on('join', function(room) {
    console.log('a user joined to ' + room + ' room');

    socket.join(room);
    socket.broadcast.to(room).emit('user-joined');
    // save new clients
    clients.push({ id: socket.id, room: room  });
  });

  socket.on('chat message', function(msg) {
    clients.map(client => {
      if (socket.id === client.id) {
        io.to(client.room).emit('chat message', msg);
      }
    });
  });

  socket.on('disconnect', function() {
    console.log('user disconnected');
    // delete client from clients
    clients = clients.filter(client => {
      if (client.id !== socket.id) {
        return true;
      } else {
        socket.leave(client.room);
        console.log('a user leaved ' + client.room + ' room');
        return false;
      }
    });
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
