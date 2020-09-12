import React from 'react';
import StyleButton from './StyleButton';

const COLORS = [
  { label: 'Orange', style: 'orange' },
  { label: 'grey', style: 'grey' },
  { label: 'Red', style: 'red' },
  { label: 'Green', style: 'green' },
  { label: 'Blue', style: 'blue' },
  { label: 'Black', style: 'Black' }
];

const ColorControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div>
      {COLORS.map((control) => (
        <StyleButton
          key={control.label}
          active={currentStyle.has(control.style)}
          label={control.label}
          onToggle={props.onToggle}
          style={control.style}
          type='color'
        />
      ))}
    </div>
  );
};

export default ColorControls;
