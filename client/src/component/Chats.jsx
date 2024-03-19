import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import Boxes from './Boxes';
import { useAuth } from "../context/AuthContext";
import axios from "axios"
import {io} from "socket.io-client"

function Chats() {
  const [selectedBox, setSelectedBox] = useState(null);
  const [message, setMessage] = useState('');
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showSettingRoom, setShowSettingRoom] = useState(false);
  const [joinRoomCode,setJoinRoomCode] =useState("");
  const [joinCreateCode,setJoinCreateCode] =useState("");
  const [deleteRoom,setDeleteRoom] = useState(false);
  const [rooms,setRooms] = useState([]);
  const [shouldGetRooms, setShouldGetRooms] = useState(false); 
  const [socketId,setSocketId] = useState("")
  const [socket,setSocket] = useState("")
  const [data,setData]=useState([]);

  const navigate = useNavigate(); 
  const { isLoggedIn, check } = useAuth();

  const token = localStorage.getItem('token');
  const config = {
      headers: {
          Authorization: `Bearer ${token}`
      }
  };

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socket.on("connect", () => {
        console.log(`Socket connected: ${socket.id}`);
    });
    setSocket(socket);

    return () => {
        socket.disconnect();
    };
}, []);

useEffect(() => {
    if (socket) {
        socket.on("send-to-room",(x)=>{
          setData(prevData => [...prevData, x]);
        })
    }
}, [socket]);

const handleSendMessage = () => {
    if (socket && selectedBox && message) {
        socket.emit("send-message", message, selectedBox);
        setMessage(''); // Clear message input after sending
    }
};

const handleBoxClick = (boxId) => {
    setSelectedBox(boxId);
    if (socket && boxId) {
        socket.emit("join-room", boxId);
        setData([])
        console.log(boxId);
    }
};


  useEffect(() => {
    check();
  }, [selectedBox,message,showJoinRoom,showCreateRoom,showSettingRoom,joinRoomCode,joinCreateCode]);

  const handleShowJoinRoom = () => {
    setShowJoinRoom(!showJoinRoom);
    setShowCreateRoom(false);
    setShowSettingRoom(false);
  };
  const handleShowCreateRoom = () => {
    setShowCreateRoom(!showCreateRoom);
    setShowJoinRoom(false);
    setShowSettingRoom(false);
  };
  const handleShowSettingRoom = () => {
    setShowSettingRoom(!showSettingRoom);
    setShowJoinRoom(false);
    setShowCreateRoom(false);
  };

  
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);


  const handleDeleteRoom= ()=>{
    setDeleteRoom(!deleteRoom);
  }

  const handleDeleteRoomFromBackend = async (id) => {
    try {
      const response = await axios.post("http://localhost:3000/deleteRoom", {
        roomSocketId: id
      }, config);
      const data = response.data;
      console.log(data);
      setShouldGetRooms(!shouldGetRooms); // Trigger fetching rooms
    } catch (error) {
      console.log("Error deleting room:", error);
      // Add error handling code here, such as displaying an error message to the user
    }
  }
  

  const handleJoinRoom =async () => {
    if(joinRoomCode===""){return;}
    try {
      const response = await axios.post("http://localhost:3000/joinRoom", {
        roomSocketId:joinRoomCode
      },config);

      const data = response.data;
      console.log(data);
      setShouldGetRooms(!shouldGetRooms); // Trigger fetching rooms
      setJoinRoomCode("");
    } catch (error) {
      setJoinRoomCode("");
      console.log(error);
    }
  };

  useEffect(() => {
    const getRooms = async () => {
      try {
        const response = await axios.get("http://localhost:3000/getRooms",config);
        setRooms(response.data.rooms);
        console.log(response.data.rooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    }
    getRooms();
  }, [shouldGetRooms]); // Fetch rooms whenever shouldGetRooms changes

  
  const handleCreateRoom = async()=>{
    if(joinCreateCode===""){return;}

    try {
      const response = await axios.post("http://localhost:3000/createRoom", {
        roomName:joinCreateCode
      },config);

      const data = response.data;
      console.log(data);
      setShouldGetRooms(!shouldGetRooms); // Trigger fetching rooms
      setJoinCreateCode("");
    } catch (error) {
      setJoinCreateCode("");
      console.log(error);
    }
  };

  return (
    <div className='main'>
      <div className="main-inner">
        <div className="left-bar">
          <div className="left-bar-inner">
            {showJoinRoom &&
              <div className="join-room">
                <div className="text-join-room">
                  <h3>Enter Rooms Id to Join Room </h3>
                  <input type="text" onChange={(e)=>setJoinRoomCode(e.target.value)} value={joinRoomCode} onKeyDown={(e) => {
                    if (e.key === 'Enter') { handleJoinRoom() }
                  }}/>
                  <button onClick={handleJoinRoom}>Join Room</button>
                </div>
              </div>
            }
            {showCreateRoom &&
              <div className="join-room">
                <div className="text-join-room">
                  <h3>Create a Room </h3>
                  <input type="text" onChange={(e)=>setJoinCreateCode(e.target.value)} value={joinCreateCode} onKeyDown={(e) => {
                    if (e.key === 'Enter') { handleCreateRoom() }
                  }}/>
                  <button onClick={handleCreateRoom}>Create Room</button>
                </div>
              </div>
            }
            {showSettingRoom &&
              <div className="join-room">
                <div className="text-join-room">
                  <h3>Settings </h3>
                  {/* Add setting options here */}
                </div>
              </div>
            }
            <button className='hover-effect-button' onClick={handleShowJoinRoom}>Join Room</button>
            <button className='hover-effect-button' onClick={handleShowCreateRoom}>Create Room</button>
            <button className='hover-effect-button' onClick={handleShowSettingRoom}>Setting</button>
          </div>
        </div>
        <div className="left">
          <div className="left-upper text-upper">
            <h2 className='text'>Chats</h2>
            <div>
            </div>
          </div>
          <div className="left-lower-container">
            <div className="left-lower">
            {rooms && rooms.map(room => (
                  <Boxes
                    key={room.socketId}
                    id={room.socketId}
                    roomName={room.roomName}
                    onClick={handleBoxClick}
                    isSelected={selectedBox === room.socketId}
                  />
              ))}

            </div>
          </div>
        </div>
        <div className="right">
          <div className="right-title text-upper">
            {selectedBox && deleteRoom && (
              <div className="right-delete-box">
                <h2>Are you sure you want to leave this room</h2>
                <div className="delete-sure-button">
                  <button onClick={() => handleDeleteRoomFromBackend(selectedBox)}>Yes</button> 
                  <button onClick={handleDeleteRoom}>No</button>
                </div>
              </div>
            )}
            <h6 style={{fontSize:"12px"}} className='text'>{selectedBox && rooms.find(room => room.socketId === selectedBox) ? rooms.find(room => room.socketId === selectedBox).socketId : 'Chat App'}</h6>
            
             
            {selectedBox && (
              <button className='hover-effect-button' onClick={handleDeleteRoom}>Delete Room</button>
            )}
          </div>
          <div className="messages" style={{zIndex:"999"}}>
          
            {data.map((message, index) => (
          <li key={index}>{message}</li>
          
        ))}
          </div>

          <div className="input">
            <input type="text" className='input-text' value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => {
              if (e.key === 'Enter') { handleSendMessage() }
            }} />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chats;
