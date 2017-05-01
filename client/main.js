var socket;
let user;


let connected = false;

const connectSocket = (e) => {
  var message = document.querySelector("#message");
  var chat = document.querySelector("#chat");

  socket = io.connect();

  socket.on('connect', () => {

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
    
    const msgObj = decodeMessage(data);

    var avatarImg = new Image(100,100);
    avatarImg.src = msgObj.avatar;
    avatarImg.className = "avatar";

    var username = document.createElement("H4");
    username.style.color = msgObj.color;
    var usernameText = document.createTextNode(msgObj.name);
    username.appendChild(usernameText);

    var timestamp = document.createElement("P");
    timestamp.className = "timestamp";
    var timestampText = document.createTextNode(msgObj.timestamp);
    timestamp.appendChild(timestampText);

    var catMsg = document.createElement("P");
    catMsg.className = "cat-text";
    catMsg.style.color = msgObj.color;
    var catMsgText = document.createTextNode(msgObj.catMsg);
    catMsg.appendChild(catMsgText);

    var translatedMsg = document.createElement("P");
    translatedMsg.className = "translated-text";
    var translatedMsgText = document.createTextNode("("+msgObj.msg+")");
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
  const encodedMsg = encodeMessage(msgValue);
  socket.emit('msgToServer', {msg: encodedMsg });
};
const changeName = (e) => {
  let newName = document.querySelector("#username").value;
  const encodedMsg = encodeMessage(newName);
  socket.emit('changeName', {name: encodedMsg});
};
const setColor = (e) => {
  if(connected){
      let newColor = document.querySelector("#colorPicker").value;
      const encodedMsg = encodeMessage(newColor);
      socket.emit('changeColor', {color: encodedMsg});
  }
};
const changeAvatar = (catImg) => {

  //If user has connected
  if(connected){
      const encodedMsg = encodeMessage(catImg);
      socket.emit('changeAvatar', {avatar: encodedMsg});
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