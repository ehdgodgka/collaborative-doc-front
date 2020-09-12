import React from 'react';
const StyleButton = (props) => {
  let className = 'RichEditor-styleButton';
  if (props.active) {
    className += ' RichEditor-activeButton';
  }
  if (props.type === 'color') className += ' RichEditor-colorButton';
  const onToggle = (e) => {
    e.preventDefault();
    console.log(props);
    props.onToggle(props.style);
  };
  return props.type === 'color' ? (
    <div className={className} style={{ backgroundColor: props.style }} onMouseDown={onToggle}>
      A
    </div>
  ) : (
    <span className={className} onMouseDown={onToggle}>
      {props.label}
    </span>
  );
};

export default StyleButton;
