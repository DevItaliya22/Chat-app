import React, { useState ,useEffect} from 'react';

function Boxes({ id, onClick, isSelected }) {
  const [backgroundColor, setBackgroundColor] = useState('#0b141a');

  const handleClick = () => {
    setBackgroundColor('#2a3942');
    onClick(id);
  };

  
  useEffect(() => {
    setBackgroundColor(isSelected ? '#2a3942' : '#0b141a');
  }, [isSelected]);

  return (
    <div
      className='main-boxes'
      style={{ backgroundColor }}
      onClick={handleClick}
    >
      <div className="title">
        <h2 className="text">
          hello
        </h2>
      </div>
    </div>
  );
}

export default Boxes;
