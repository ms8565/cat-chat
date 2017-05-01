'use strict';
const xxh = require('xxhashjs');
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

const sendMsg = (hash, message, name, color, avatar, catMsg, timestamp) => {
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
    hash: hash,
    name: nameTemp,
    msg: message,
    color: colorTemp,
    avatar: avatarTemp,
    catMsg: catMsgTemp,
    timestamp: timestampTemp,
  };
};

const encodeMessage = (message) => {
  
  let bufferObjs = [];
  //get the byte value from our hash (character string id)
    //This will convert the character hash to bytes that we can
    //send in our byte array
    const hashBuffer = Buffer.from(msgObj.hash, 'utf-8');
    //get the length of our buffer so we can add it to our total to allocate
    const hashLength = hashBuffer.byteLength;
    //add to our total length. We need to know the exact number of bytes we are sending.
    bufferObjs.push({
      buffer: hashBuffer,
      length: hashLength
    })
    
    
    const nameBuffer = Buffer.from(msgObj.name, 'utf-8');
    const nameLength = nameBuffer.byteLength;
    bufferObjs.push({
      buffer: nameBuffer,
      length: nameLength
    });
    
    const msgBuffer = Buffer.from(msgObj.msg, 'utf-8');
    const msgLength = msgBuffer.byteLength;
    totalLength += msgLength;
    bufferObjs.push({
      buffer: msgBuffer,
      length: msgLength
    });
  
    const colorBuffer = Buffer.from(msgObj.color, 'utf-8');
    const colorLength = colorBuffer.byteLength;
    bufferObjs.push({
      buffer: colorBuffer,
      length: colorLength
    });
  
    const avatarBuffer = Buffer.from(msgObj.avatar, 'utf-8');
    const avatarLength = avatarBuffer.byteLength;
    bufferObjs.push({
      buffer: avatarBuffer,
      length: avatarLength
    });
    
    const catMsgBuffer = Buffer.from(msgObj.catMsg, 'utf-8');
    const catMsgLength = catMsgBuffer.byteLength;
    bufferObjs.push({
      buffer: catMsgBuffer,
      length: catMsgLength
    });
    
    //allocate a buffer (byte array) of 8 bytes that we can store a date value in
    //Dates are stored as a double (8 bytes) so that tells us how much to allocate
    const dateBuffer = Buffer.alloc(8); //8 bytes in a double
    //write double, read on the client as getFloat64 from dataview
    
    dateBuffer.writeDoubleBE(msgObj.timestamp);
    //get the byte length of our date 
    const dateLength = dateBuffer.byteLength;
    bufferObjs.push({
      buffer: dateBuffer,
      length: dateLength
    });
    
    
    let totalLength = bufferObjs.length; //Add 1 per every element, since the length of the buffer will be sent
    for(let i = 0; i < bufferObjs.length; i++){
      totalLength += bufferObjs[i].length; //Add the lengths of all buffers
    }
    
    let offset = 0;
    let message = Buffer.alloc(totalLength);
    for(let i = 0; i < bufferObjs.length; i++){
      message.writeInt8(bufferObjs[i].length, offset);
      offset += 1;
      
      bufferObjs[i].buffer.copy(message, offset);
      offset += bufferObjs[i].length;
    }

    //return serialized message
    return message;
};

const decodeMessage = (data) => {
  //convert into a buffer
  const buffer = Buffer.from(data, 'utf-8');
  let totalOffset = 0;
  
  //Decode length of message
  const messageLength = buffer.readInt8(totalOffset);
  totalOffset += 1;

  //Decode message
  const message = buffer.toString('utf-8', totalOffset, totalOffset+messageLength);
  totalOffset += messageLength;
  
  //Decode length of date
  const dateLength = buffer.readInt8(totalOffset);
  totalOffset += 1;

  //Decode date
  const date = buffer.toString('utf-8', totalOffset, totalOffset+dateLength);
  
  return {msg: message, timestamp: date};
};

const decodeAttribute = (data) => {
  //convert into a buffer
  const buffer = Buffer.from(data, 'utf-8');
  let totalOffset = 0;
  
  //Decode length of attribute
  const attributeLength = buffer.readInt8(totalOffset);
  totalOffset += 1;

  //Decode attribute
  const attribute = buffer.toString('utf-8', totalOffset, totalOffset+attributeLength);
  
  return attribute;
}




const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', (data) => {
    socket.name = data.name;
    socket.color = data.color;
    socket.avatar = data.avatar;
    
    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);

    users[hash] = socket;
    
    socket.join('room1');

    socket.emit('msg', sendMsg(`There are ${Object.keys(users).length + 1} users`));

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
