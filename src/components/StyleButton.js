import React from 'react';
const StyleButton = (props) => {
  let className = 'RichEditor-styleButton';
  if (props.active) {
    className += ' RichEditor-activeButton';
  }
  const onToggle = (e) => {
    e.preventDefault();
    props.onToggle(props.style);
  };
  return (
    <span className={className} onMouseDown={onToggle}>
      {props.label}
    </span>
  );
};

export default StyleButton;
