import { useState, useEffect } from 'react';
import { EditorState, convertFromRaw, SelectionState } from 'draft-js';
import Pusher from 'pusher-js';

const usePusher = () => {
  const [text, setText] = useState('');
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    const pusher = new Pusher('ee6420439e43642e2b21', {
      cluster: 'ap3',
      encrypted: true
    });
    const channel = pusher.subscribe('editor');

    // listen to 'text-update' events
    channel.bind('text-update', (data) => {
      // update the text state with new data
      console.log('text-update', data);
      setText(data.text);
    });

    channel.bind('editor-update', (data) => {
      // create a new selection state from new data
      console.log('editor-update', data);

      let newSelection = new SelectionState({
        anchorKey: data.selection.anchorKey,
        anchorOffset: data.selection.anchorOffset,
        focusKey: data.selection.focusKey,
        focusOffset: data.selection.focusOffset
      });

      // create new editor state
      let editorState = EditorState.createWithContent(convertFromRaw(data.text));
      const newEditorState = EditorState.forceSelection(editorState, newSelection);

      // update the RichEditor's state with the newEditorState
      setEditor(newEditorState);
    });

    return () => channel.unsubscribe('editor');
  }, []);

  return { editor };
};

export default usePusher;
