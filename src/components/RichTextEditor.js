import React, { useState, useRef, useEffect } from 'react';
import { Editor, EditorState, RichUtils, getDefaultKeyBinding } from 'draft-js';
// import { stateToHTML } from 'draft-js-export-html';

import BlockStyleControls from './BlockStyleControls';
import InlineStyleControls from './InlineStlyeControls';

import usePusher from '../hooks/usePusher';
import { notifyPusher, notifyPusherEditor } from '../services/pusher.js';

import './RichTextEditor.css';
import 'draft-js/dist/Draft.css';

const RichTextEditor = (props) => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  // const [text, setText] = useState('');
  const { editor: newEditor } = usePusher();

  let className = 'RichEditor-editor';
  var contentState = editorState.getCurrentContent();
  if (!contentState.hasText()) {
    if (contentState.getBlockMap().first().getType() !== 'unstyled') {
      className += ' RichEditor-hidePlaceholder';
    }
  }
  const editorRef = useRef(null);
  const focus = () => editorRef.current.focus();

  const onChange = (editorState) => {
    setEditorState(editorState);
    // call the function to notify Pusher of the new editor state
    notifyPusherEditor(editorState);
    // notifyPusher(stateToHTML(editorState.getCurrentContent()));
  };

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      onChange(newState);
      return true;
    }
    return false;
  };

  const mapKeyToEditorCommand = (e) => {
    if (e.key === 'Tab') {
      const newEditorState = RichUtils.onTab(e, editorState, 4 /* maxDepth */);
      if (newEditorState !== editorState) {
        onChange(newEditorState);
      }
      return;
    }
    return getDefaultKeyBinding(e);
  };

  const toggleBlockType = (blockType) => {
    onChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  const toggleInlineStyle = (inlineStyle) => {
    onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  useEffect(() => {
    newEditor && setEditorState(newEditor);
  }, [newEditor]);
  return (
    <div className='RichEditor-root'>
      <BlockStyleControls editorState={editorState} onToggle={toggleBlockType} />
      <InlineStyleControls editorState={editorState} onToggle={toggleInlineStyle} />
      <div className={className} onClick={focus}>
        <Editor
          blockStyleFn={getBlockStyle}
          customStyleMap={styleMap}
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={mapKeyToEditorCommand}
          onChange={onChange}
          placeholder='Tell a story...'
          ref={editorRef}
          // spellCheck={true}
        />
      </div>
    </div>
  );
};

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2
  }
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote';
    default:
      return null;
  }
}

export default RichTextEditor;
