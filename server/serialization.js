
const encodeMessage = (msgObj) => {
  const bufferObjs = [];
  // get the byte value from our hash (character string id)
    // This will convert the character hash to bytes that we can
    // send in our byte array
  const hashBuffer = Buffer.from(msgObj.hash, 'utf-8');
    // get the length of our buffer so we can add it to our total to allocate
  const hashLength = hashBuffer.byteLength;
    // add to our total length. We need to know the exact number of bytes we are sending.
  bufferObjs.push({
    buffer: hashBuffer,
    length: hashLength,
  });


  const nameBuffer = Buffer.from(msgObj.name, 'utf-8');
  const nameLength = nameBuffer.byteLength;
  bufferObjs.push({
    buffer: nameBuffer,
    length: nameLength,
  });

  const msgBuffer = Buffer.from(msgObj.msg, 'utf-8');
  const msgLength = msgBuffer.byteLength;
  bufferObjs.push({
    buffer: msgBuffer,
    length: msgLength,
  });

  const colorBuffer = Buffer.from(msgObj.color, 'utf-8');
  const colorLength = colorBuffer.byteLength;
  bufferObjs.push({
    buffer: colorBuffer,
    length: colorLength,
  });

  const avatarBuffer = Buffer.from(msgObj.avatar, 'utf-8');
  const avatarLength = avatarBuffer.byteLength;
  bufferObjs.push({
    buffer: avatarBuffer,
    length: avatarLength,
  });

  const catMsgBuffer = Buffer.from(msgObj.catMsg, 'utf-8');
  const catMsgLength = catMsgBuffer.byteLength;
  bufferObjs.push({
    buffer: catMsgBuffer,
    length: catMsgLength,
  });

    // allocate a buffer (byte array) of 8 bytes that we can store a date value in
    // Dates are stored as a double (8 bytes) so that tells us how much to allocate
  const dateBuffer = Buffer.alloc(8); // 8 bytes in a double
    // write double, read on the client as getFloat64 from dataview

  dateBuffer.writeDoubleBE(msgObj.timestamp);
    // get the byte length of our date
  const dateLength = dateBuffer.byteLength;
  bufferObjs.push({
    buffer: dateBuffer,
    length: dateLength,
  });

  // Add 1 per every element, since the length of the buffer will be sent
  // So, start at the length of all elements
  let totalLength = bufferObjs.length;
  for (let i = 0; i < bufferObjs.length; i++) {
    totalLength += bufferObjs[i].length; // Add the lengths of all buffers
  }

  let offset = 0;
  const message = Buffer.alloc(totalLength);
  for (let i = 0; i < bufferObjs.length; i++) {
    message.writeInt8(bufferObjs[i].length, offset);
    offset += 1;

    bufferObjs[i].buffer.copy(message, offset);
    offset += bufferObjs[i].length;
  }

    // return serialized message
  return message;
};

const decodeMessage = (data) => {
  // convert into a buffer
  const buffer = Buffer.from(data);
  let totalOffset = 0;

  // Decode length of attribute
  const attributeLength = buffer.readInt8(totalOffset);
  totalOffset += 1;

  // Decode attribute
  const attribute = buffer.toString('utf-8', totalOffset, totalOffset + attributeLength);

  return attribute;
};

module.exports.encodeMessage = encodeMessage;
module.exports.decodeMessage = decodeMessage;
