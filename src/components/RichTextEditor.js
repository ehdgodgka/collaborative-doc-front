import React, { useState, useRef, useEffect } from 'react';
import { Editor, EditorState, RichUtils, getDefaultKeyBinding, Modifier, convertToRaw } from 'draft-js';
import { create } from 'jsondiffpatch';
// import { stateToHTML } from 'draft-js-export-html';

import BlockStyleControls from './BlockStyleControls';
import InlineStyleControls from './InlineStlyeControls';
import ColorControls from './ColorControls';

import usePusher from '../hooks/usePusher';
import { notifyPusher, notifyPusherEditor } from '../services/pusher.js';

import './RichTextEditor.css';
import 'draft-js/dist/Draft.css';

const RichTextEditor = (props) => {
  const jsondiffpatch = create();
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

  const onChange = (updateEditorState) => {
    const contentBefore = convertToRaw(editorState.getCurrentContent());
    const contentAfter = convertToRaw(updateEditorState.getCurrentContent());
    const delta = jsondiffpatch.diff(contentBefore, contentAfter);

    setEditorState(updateEditorState);
    // call the function to notify Pusher of the new editor state

    if (delta) {
      notifyPusherEditor(updateEditorState);
    }
    //    // notifyPusher(stateToHTML(editorState.getCurrentContent()));
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
  const toggleColor = (toggledColor) => {
    const selection = editorState.getSelection();
    console.log(selection);

    // Let's just allow one color at a time. Turn off all active colors.
    const nextContentState = Object.keys(colorStyleMap).reduce((contentState, color) => {
      return Modifier.removeInlineStyle(contentState, selection, color);
    }, editorState.getCurrentContent());

    let nextEditorState = EditorState.push(editorState, nextContentState, 'change-inline-style');

    const currentStyle = editorState.getCurrentInlineStyle();

    // Unset style override for current color.
    if (selection.isCollapsed()) {
      nextEditorState = currentStyle.reduce((state, color) => {
        return RichUtils.toggleInlineStyle(state, color);
      }, nextEditorState);
    }

    // If the color is being toggled on, apply it.
    if (!currentStyle.has(toggledColor)) {
      nextEditorState = RichUtils.toggleInlineStyle(nextEditorState, toggledColor);
    }

    onChange(nextEditorState);
  };

  useEffect(() => {
    newEditor && setEditorState(newEditor);
  }, [newEditor]);
  return (
    <div className='RichEditor-root'>
      <BlockStyleControls editorState={editorState} onToggle={toggleBlockType} />
      <InlineStyleControls editorState={editorState} onToggle={toggleInlineStyle} />
      <ColorControls editorState={editorState} onToggle={toggleColor} />
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
  },
  red: {
    color: 'rgba(255, 0, 0, 1.0)'
  },
  orange: {
    color: 'rgba(255, 127, 0, 1.0)'
  },
  green: {
    color: 'rgba(0, 180, 0, 1.0)'
  },
  blue: {
    color: 'rgba(0, 0, 255, 1.0)'
  },
  indigo: {
    color: 'rgba(75, 0, 130, 1.0)'
  },
  violet: {
    color: 'rgba(127, 0, 255, 1.0)'
  }
};

const colorStyleMap = {
  red: {
    color: 'rgba(255, 0, 0, 1.0)'
  },
  orange: {
    color: 'rgba(255, 127, 0, 1.0)'
  },
  green: {
    color: 'rgba(0, 180, 0, 1.0)'
  },
  blue: {
    color: 'rgba(0, 0, 255, 1.0)'
  },
  indigo: {
    color: 'rgba(75, 0, 130, 1.0)'
  },
  violet: {
    color: 'rgba(127, 0, 255, 1.0)'
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
