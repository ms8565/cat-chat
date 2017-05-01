var socket;
let user;


let connected = false;


//function to deserialize our custom buffer back into a message
const parseMessage = (data) => {
  //index in buffer
  let totalOffset = 0; 

  //decoder for decoding bytes into text
  const decoder = new TextDecoder();

  //cast our buffer to a dataview.
  const myData = new DataView(data); //cast to data view
  
  //Read in user hash
  //Read out the first byte: the hash length
  const hashLength = myData.getInt8(totalOffset);
  //Add the size of the length variable
  totalOffset += 1; 

  //cast hash into a dataview
  //and ask the dataview to decode its value
  const hashView = new DataView(data, totalOffset, hashLength);
  const hash = decoder.decode(hashView);
  totalOffset += hashLength; //add the length of hash to our offset
  
  //Read in user name
  const nameLength = myData.getInt8(totalOffset);
  totalOffset += 1; 

  const nameView = new DataView(data, totalOffset, nameLength);
  const name = decoder.decode(nameView);
  totalOffset += nameLength; //add the length of hash to our offset
  
  //Read in message
  const msgLength = myData.getInt8(totalOffset);
  totalOffset += 1; 
  const msgView = new DataView(data, totalOffset, msgLength);
  const msg = decoder.decode(msgView);
  totalOffset += msgLength;
  
  //Read in color
  const colorLength = myData.getInt8(totalOffset);
  totalOffset += 1;
  const colorView = new DataView(data, totalOffset, colorLength);
  const color = decoder.decode(colorView);
  totalOffset += colorLength;
  
  //Read in avatar src
  const avatarLength = myData.getInt8(totalOffset);
  totalOffset += 1;
  const avatarView = new DataView(data, totalOffset, avatarLength);
  const avatar = decoder.decode(avatarView);
  totalOffset += avatarLength;
  
  //Read in cat msg
  const catMsgLength = myData.getInt8(totalOffset);
  totalOffset += 1;
  const catMsgView = new DataView(data, totalOffset, catMsgLength);
  const catMsg = decoder.decode(catMsgView);
  totalOffset += catMsgLength;
  

  //Read in date timestamp
  //Read out length of the date variable
  const dateLength = myData.getInt8(totalOffset);
  totalOffset += 1; //add the size of the length variable

  //grab a float64 from the buffer date is a float64
  const timestamp = myData.getFloat64(totalOffset);
  totalOffset += dateLength; //add to our offset

  
  return {
    hash: hash,
    name: name,
    msg: msg,
    color: color,
    avatar: avatarTemp,
    catMsg: catMsg,
    timestamp: timestamp
  };
};

const encodeMessage = (msgObj) => {
  //Send length of message
  //send message
  
  //Send length of date
  //Send date
  
  let totalLength = 0;
  
  //decoder for decoding bytes into text
  const decoder = new TextDecoder();

  //cast our buffer to a dataview.
  const myData = new DataView(data); //cast to data view
  
  //Read in user hash
  //Read out the first byte: the hash length
  const hashLength = myData.getInt8(totalOffset);
  
  const msgBuffer = Buffer.from(msgObj.msg, 'utf-8');
  const msgLength = msgBuffer.byteLength;
  totalLength += msgLength + 1; //Add message length and byte for length variable
    
  //allocate a buffer (byte array) of 8 bytes that we can store a date value in
  //Dates are stored as a double (8 bytes) so that tells us how much to allocate
  const dateBuffer = Buffer.alloc(8); //8 bytes in a double
  //write double, read on the client as getFloat64 from dataview

  dateBuffer.writeDoubleBE(msgObj.timestamp);
  //get the byte length of our date 
  const dateLength = dateBuffer.byteLength;
  totalLength += dateLength + 1; //Add date length and byte for length variable
    
  let offset = 0;
  let message = Buffer.alloc(totalLength);
  
  //Write message
  message.writeInt8(msgLength, offset);
  offset += 1;
  
  msgBuffer.copy(message, offset);
  offset += msgLength;
  
  //Write date
  message.writeInt8(dateLength, offset);
  offset += 1;
  
  dateBuffer.copy(message, offset);
};

const encodeAttribute = (attribute) => {
  //Send length of attribute
  //Send attribute
};


const connectSocket = (e) => {
  var message = document.querySelector("#message");
  var chat = document.querySelector("#chat");

  socket = io.connect();

  socket.on('connect', () => {
    console.log('connecting');

    user = document.querySelector("#username").value;

    //Get current cat avatar
    let avatarId = document.querySelector('input[name="AvatarIcons"]:checked').id;
    let avatarImg = "https://people.rit.edu/ms8565/realtime/images/"+avatarId+".jpg";

    //Get current color
    let currentColor = document.querySelector("#colorPicker").value;

    if(!user){
        user = 'unknown';
    }
    socket.emit('join', {name: user, avatar: avatarImg, color:currentColor});

    document.querySelector("#usernameBtn").value = 'Change Name';
    document.querySelector("#usernameBtn").onclick = changeName;



    connected = true;
  });

  
  socket.on('msg', (data) => {
    console.log("message");
    
    const message = parseMessage(data);

    var avatarImg = new Image(100,100);
    avatarImg.src = message.avatar;
    avatarImg.className = "avatar";

    var username = document.createElement("H4");
    username.style.color = message.color;
    var usernameText = document.createTextNode(data.name);
    username.appendChild(usernameText);

    var timestamp = document.createElement("P");
    timestamp.className = "timestamp";
    var timestampText = document.createTextNode(message.timestamp);
    timestamp.appendChild(timestampText);

    var catMsg = document.createElement("P");
    catMsg.className = "cat-text";
    catMsg.style.color = message.color;
    var catMsgText = document.createTextNode(data.catMsg);
    catMsg.appendChild(catMsgText);

    var translatedMsg = document.createElement("P");
    translatedMsg.className = "translated-text";
    var translatedMsgText = document.createTextNode("("+message.msg+")");
    translatedMsg.appendChild(translatedMsgText);



    var floatLeft = document.createElement("div");
    floatLeft.className = "left";
    floatLeft.appendChild(avatarImg);

    var floatRight = document.createElement("div");
    floatRight.className = "right";
    floatRight.appendChild(username);
    floatRight.appendChild(timestamp);
    floatRight.appendChild(catMsg);
    floatRight.appendChild(translatedMsg);

    var message = document.createElement("div");
    message.className = "chatMessage";
    message.appendChild(floatLeft);
    message.appendChild(floatRight);

    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
  });


};



const sendMessage = (e) => {
  let msgValue = document.querySelector("#message").value;
  let date = new Date();
  socket.emit('msgToServer', {msg: msgValue, timestamp:date });
};
const changeName = (e) => {
  let newName = document.querySelector("#username").value;
  console.log("change name");
  socket.emit('changeName', {name: newName});
};
const setColor = (e) => {
  if(connected){
      let newColor = document.querySelector("#colorPicker").value;
      socket.emit('changeColor', {color: newColor});
  }
};
const changeAvatar = (catImg) => {

  //If user has connected
  if(connected){
      socket.emit('changeAvatar', {avatar: catImg});
  }

}
const getTime = (e) => {
  socket.emit('getTime');
};

const init = (e) => {
  const connect = document.querySelector("#usernameBtn");
  connect.onclick = connectSocket;

  const send = document.querySelector("#sendMessageBtn");
  send.addEventListener('click', sendMessage);

  const color = document.querySelector("#colorPicker");
  color.onchange = setColor;


  for(let i = 1; i < 15; i++){
      let currentId = "cat"+i;
      let avatarOption = document.querySelector("#"+currentId);
      let avatarOptionLabel = document.querySelector("#"+currentId+"Label");

      let catImg = "https://people.rit.edu/ms8565/realtime/images/"+currentId+".jpg";
      avatarOptionLabel.style.background = "url("+catImg+")";

      avatarOption.onclick = (function(){
          changeAvatar(catImg);
      });
  }

};
window.onload = init;