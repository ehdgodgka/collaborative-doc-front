import axios from 'axios';
import { convertToRaw } from 'draft-js';

// send the editor's text with axios to the server so it can be broadcasted by Pusher

// export const notifyPusher = (text) => {
//   console.log('noti text');
//   axios.post('http://localhost:5000/save-text', { text });
// };

// send the editor's current state with axios to the server so it can be broadcasted by Pusher
let socketId;

export const setSocketId = (id) => {
  socketId = id;
  console.log(socketId);
};
export const notifyPusherEditor = (editorState) => {
  console.log('noti editor change');

  const selection = editorState.getSelection();
  let text = convertToRaw(editorState.getCurrentContent());
  
  axios.post('http://localhost:5000/editor-text', { text, socketId, selection });
};
