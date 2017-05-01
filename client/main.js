var socket;
let user;


let connected = false;

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


    var avatarImg = new Image(100,100);
    avatarImg.src = data.avatar;
    avatarImg.className = "avatar";

    var username = document.createElement("H4");
    username.style.color = data.color;
    var usernameText = document.createTextNode(data.name);
    username.appendChild(usernameText);

    var timestamp = document.createElement("P");
    timestamp.className = "timestamp";
    var timestampText = document.createTextNode(data.timestamp);
    timestamp.appendChild(timestampText);

    var catMsg = document.createElement("P");
    catMsg.className = "cat-text";
    catMsg.style.color = data.color;
    var catMsgText = document.createTextNode(data.catMsg);
    catMsg.appendChild(catMsgText);

    var translatedMsg = document.createElement("P");
    translatedMsg.className = "translated-text";
    var translatedMsgText = document.createTextNode("("+data.msg+")");
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