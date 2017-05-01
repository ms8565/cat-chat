
const users = {};

let io;

const catPhrases = [
  'Meow meow meow meow meow meow.',
  'MrOOOOw!',
  '*Blep*',
  '*Blinks once*',
  '*Blinks twice*',
  'Meow.',
  '*Judgmental stare*',
  'Meow meow meow!',
  'Nya~',
  'Meow, meow meow meow, meow meow!',
  '*Flips tail*',
  '*Chases own tail*',
  '*Infernal caterwauling*',
  'JELLICLE SONGS FOR JELLICLE CATS! *does a handstand dance routine',
  'PuuurrrrrrRRrrr.',
  'HHHIIIIiiiSSSSSSS',
  'Meeooooooow.',
  '*soft yawn*',
  '*Kneads lap*',
  '*Kneads lap wITH CLAWS OW*',
  '*Attacks you unexpectedly, even though you were JUST PETTING THEM?? WHY??*',
  'Shimmy shimmy *pounce*',
  'Chirp chirrppp (but in that weird cat way)',
  'MEOW. MEOW MEOW. Meeooowww... MEOW!',
  'MeeeeOW???',
];

const serverAvatar = 'https://people.rit.edu/ms8565/realtime/images/serverCat.jpg';

const sendMsg = (message, name, color, avatar, catMsg, timestamp) => {
  let nameTemp = name;
  let catMsgTemp = catMsg;
  let timestampTemp = timestamp;
  let avatarTemp = avatar;
  let colorTemp = color;

  if (name === undefined) nameTemp = 'Server Cat';
  if (color === undefined) colorTemp = 'black';
  if (catMsg === undefined) catMsgTemp = '0101011010 :3 0101010';
  if (timestamp === undefined) timestampTemp = new Date();
  if (avatar === undefined) avatarTemp = serverAvatar;

  return {
    name: nameTemp,
    msg: message,
    color: colorTemp,
    avatar: avatarTemp,
    catMsg: catMsgTemp,
    timestamp: timestampTemp,
  };
};

const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', (data) => {
    socket.name = data.name;
    socket.color = data.color;
    socket.avatar = data.avatar;

    users[socket.id] = socket;

    socket.emit('msg', sendMsg(`There are ${Object.keys(users).length + 1} users`));

    socket.join('room1');

    socket.broadcast.to('room1').emit('msg', sendMsg(`${data.name} has joined the room.`));
    console.log(`${data.name} joined`);

    socket.emit('msg', sendMsg('You joined the room!'));
  });
};

const onMsg = (sock) => {
  const socket = sock;
  const date = new Date();

  socket.on('msgToServer', (data) => {
    const catPhrase = catPhrases[Math.floor(Math.random() * catPhrases.length)];
    const message = sendMsg(data.msg, socket.name, socket.color, socket.avatar, catPhrase, date);
    io.sockets.in('room1').emit('msg', message);
  });
};

const onTime = (sock) => {
  const socket = sock;

  socket.on('getTime', () => {
    const date = new Date();

    io.to(socket.id).emit('msg', sendMsg(`The date is ${date}`));
  });
};


const onChangeAttributes = (sock) => {
  const socket = sock;

  socket.on('changeName', (data) => {
    socket.emit('msg', sendMsg(`${socket.name} is now ${data.name}`));
    socket.name = data.name;
  });
  socket.on('changeColor', (data) => {
    socket.color = data.color;
  });
  socket.on('changeAvatar', (data) => {
    socket.avatar = data.avatar;
  });
};

const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    socket.broadcast.to('room1').emit('msg', sendMsg(`${socket.name} has left`));

    socket.leave('room1');

    delete users[socket.id];
  });
};

const setupSockets = (ioServer) => {
  // set our io server instance
  io = ioServer;

  io.sockets.on('connection', (socket) => {
    console.log('started');

    onJoined(socket);
    onMsg(socket);
    onChangeAttributes(socket);
    onTime(socket);
    onDisconnect(socket);
  });
};

module.exports.setupSockets = setupSockets;
