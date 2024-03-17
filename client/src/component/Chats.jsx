import React, { useState } from 'react';
import '../App.css';
import Boxes from './Boxes';

function Chats() {
  const [selectedBox, setSelectedBox] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [message, setMessage] = useState('');

  const handleBoxClick = (boxId) => {
    setSelectedBox(boxId);
  };

  const handleJoinRoom = () => {
    console.log("Joining room with code:", roomCode);
    setRoomCode("")
  };


  const handleSendMessage = () => {
    console.log("Sending message:", message);
    setMessage("")
  };

  
  return (
    <div className='main'>
      <div className="main-inner">
        <div className="left">
          <div className="left-upper text-upper">
            <h2 className='text'>Chats</h2>
            <div>
              <input type="text" value={roomCode} onChange={(e)=>setRoomCode(e.target.value)} placeholder="Enter Room Code" />
              <button onClick={handleJoinRoom}>Join Room</button>
            </div>
          </div>
          <div>
          
          </div>
          <div className="left-lower-container">
            <div className="left-lower">
              <Boxes id={1} onClick={handleBoxClick} isSelected={selectedBox === 1} />
            </div>
          </div>
        </div>
        <div className="right">
          <div className="right-title text-upper">
            <h2 className='text'>
              {selectedBox ? `Data for Box ${selectedBox}` : 'Chat name'}
            </h2>
          </div>
          <div className="input">
            <input type="text" className='input-text' value={message} onChange={(e)=>setMessage(e.target.value)} onKeyDown={(e)=>{
              if(e.key==='Enter'){handleSendMessage()}
            }} />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chats;
