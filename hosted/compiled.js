"use strict";

var socket;
var user = void 0;

var connected = false;

var connectSocket = function connectSocket(e) {
    var message = document.querySelector("#message");
    var chat = document.querySelector("#chat");

    socket = io.connect();

    socket.on('connect', function () {

        user = document.querySelector("#username").value;

        //Get current cat avatar
        var avatarId = document.querySelector('input[name="AvatarIcons"]:checked').id;
        var avatarImg = "https://people.rit.edu/ms8565/realtime/images/" + avatarId + ".jpg";

        //Get current color
        var currentColor = document.querySelector("#colorPicker").value;

        if (!user) {
            user = 'unknown';
        }
        socket.emit('join', { name: user, avatar: avatarImg, color: currentColor });

        document.querySelector("#usernameBtn").value = 'Change Name';
        document.querySelector("#usernameBtn").onclick = changeName;

        connected = true;
    });

    socket.on('msg', function (data) {

        var msgObj = decodeMessage(data);

        var avatarImg = new Image(100, 100);
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
        var translatedMsgText = document.createTextNode("(" + msgObj.msg + ")");
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

var sendMessage = function sendMessage(e) {
    var msgValue = document.querySelector("#message").value;
    var date = new Date();
    var encodedMsg = encodeMessage(msgValue);
    socket.emit('msgToServer', { msg: encodedMsg });
};
var changeName = function changeName(e) {
    var newName = document.querySelector("#username").value;
    var encodedMsg = encodeMessage(newName);
    socket.emit('changeName', { name: encodedMsg });
};
var setColor = function setColor(e) {
    if (connected) {
        var newColor = document.querySelector("#colorPicker").value;
        var encodedMsg = encodeMessage(newColor);
        socket.emit('changeColor', { color: encodedMsg });
    }
};
var changeAvatar = function changeAvatar(catImg) {

    //If user has connected
    if (connected) {
        var encodedMsg = encodeMessage(catImg);
        socket.emit('changeAvatar', { avatar: encodedMsg });
    }
};
var getTime = function getTime(e) {
    socket.emit('getTime');
};

var init = function init(e) {
    var connect = document.querySelector("#usernameBtn");
    connect.onclick = connectSocket;

    var send = document.querySelector("#sendMessageBtn");
    send.addEventListener('click', sendMessage);

    var color = document.querySelector("#colorPicker");
    color.onchange = setColor;

    var _loop = function _loop(i) {
        var currentId = "cat" + i;
        var avatarOption = document.querySelector("#" + currentId);
        var avatarOptionLabel = document.querySelector("#" + currentId + "Label");

        var catImg = "https://people.rit.edu/ms8565/realtime/images/" + currentId + ".jpg";
        avatarOptionLabel.style.background = "url(" + catImg + ")";

        avatarOption.onclick = function () {
            changeAvatar(catImg);
        };
    };

    for (var i = 1; i < 15; i++) {
        _loop(i);
    }
};
window.onload = init;
"use strict";

//function to deserialize our custom buffer back into a message
var decodeMessage = function decodeMessage(data) {
  //index in buffer
  var totalOffset = 0;

  //decoder for decoding bytes into text
  var decoder = new TextDecoder();

  //cast our buffer to a dataview.
  var myData = new DataView(data);

  //Read in user hash
  //Read out the first byte: the hash length
  var hashLength = myData.getInt8(totalOffset);
  //Add the size of the length variable
  totalOffset += 1;

  //cast hash into a dataview
  //and ask the dataview to decode its value
  var hashView = new DataView(data, totalOffset, hashLength);
  var hash = decoder.decode(hashView);
  totalOffset += hashLength; //add the length of hash to our offset

  //Read in user name
  var nameLength = myData.getInt8(totalOffset);
  totalOffset += 1;

  var nameView = new DataView(data, totalOffset, nameLength);
  var name = decoder.decode(nameView);
  totalOffset += nameLength; //add the length of hash to our offset

  //Read in message
  var msgLength = myData.getInt8(totalOffset);
  totalOffset += 1;
  var msgView = new DataView(data, totalOffset, msgLength);
  var msg = decoder.decode(msgView);
  totalOffset += msgLength;

  //Read in color
  var colorLength = myData.getInt8(totalOffset);
  totalOffset += 1;
  var colorView = new DataView(data, totalOffset, colorLength);
  var color = decoder.decode(colorView);
  totalOffset += colorLength;

  //Read in avatar src
  var avatarLength = myData.getInt8(totalOffset);
  totalOffset += 1;
  var avatarView = new DataView(data, totalOffset, avatarLength);
  var avatar = decoder.decode(avatarView);
  totalOffset += avatarLength;

  //Read in cat msg
  var catMsgLength = myData.getInt8(totalOffset);
  totalOffset += 1;
  var catMsgView = new DataView(data, totalOffset, catMsgLength);
  var catMsg = decoder.decode(catMsgView);
  totalOffset += catMsgLength;

  //Read in date timestamp
  //Read out length of the date variable
  var dateLength = myData.getInt8(totalOffset);
  totalOffset += 1; //add the size of the length variable

  //grab a float64 from the buffer, date is a float64
  var timestamp = myData.getFloat64(totalOffset);
  totalOffset += dateLength; //add to our offset


  return {
    hash: hash,
    name: name,
    msg: msg,
    color: color,
    avatar: avatar,
    catMsg: catMsg,
    timestamp: timestamp
  };
};

var encodeMessage = function encodeMessage(value) {
  var encoder = new TextEncoder();

  var attribute = encoder.encode(value);
  var attributeLength = attribute.byteLength;

  var lengthBuffer = new ArrayBuffer(1); //buffer for length
  var lengthView = new DataView(lengthBuffer);
  lengthView.setUint8(0, attributeLength); //Add length to the buffer

  var combinedBuffer = new Uint8Array(attributeLength + 1);
  combinedBuffer.set(new Uint8Array(lengthBuffer), 0);
  combinedBuffer.set(attribute, 1);

  return combinedBuffer.buffer;
};
