const handleSockets = (socket) => {
    console.log(`Socket started ${socket.id}`);
    socket.on("connect", (message) => {
        console.log("Connected");
        console.log(message);
    });
    socket.on("clientEvent",(data)=>{
        console.log(data);
    })
};

export { handleSockets }; 


// const socket = io("http://localhost:3000");
// do this in your frontend then only socket will start ofc ofc