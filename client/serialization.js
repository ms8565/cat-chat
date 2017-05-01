//function to deserialize our custom buffer back into a message
const decodeMessage = (data) => {
  //index in buffer
  let totalOffset = 0; 

  //decoder for decoding bytes into text
  const decoder = new TextDecoder();

  //cast our buffer to a dataview.
  const myData = new DataView(data);
  
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
  
  //grab a float64 from the buffer, date is a float64
  const timestamp = myData.getFloat64(totalOffset);
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

const encodeMessage = (value) => {
  const encoder = new TextEncoder();
  
  const attribute = encoder.encode(value);
  const attributeLength = attribute.byteLength;
  
  const lengthBuffer = new ArrayBuffer(1); //buffer for length
  const lengthView = new DataView(lengthBuffer);
  lengthView.setUint8(0,attributeLength); //Add length to the buffer
  
  let combinedBuffer = new Uint8Array(attributeLength + 1);
  combinedBuffer.set(new Uint8Array(lengthBuffer), 0);
  combinedBuffer.set(attribute, 1);
  
  return combinedBuffer.buffer;
};