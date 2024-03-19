import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import { createServer } from "http";
import { Server } from 'socket.io';
import session from "express-session";
import jwt from "jsonwebtoken";
import bodyParser from 'body-parser';
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from '@apollo/server/express4';
import { resolvers, typeDefs } from './graphql/graphql.js';
import { userSignUpSchema,roomNameSchema,roomSocketIdSchema } from "./models/type.js";
import { Users, Rooms, Messages } from "./models/model.js";


const app = express();
dotenv.config();

const jwtSecret = process.env.SECRET;

const startServer = async () => {
    const server = createServer(app);
    const io = new Server(server, {
        cors: {
          origin: "*",
          credentials: true,
          methods: ["GET", "POST"]
        }
      });

    io.on("connection", (socket) => {
        console.log(`Socket started ${socket.id}`);
        socket.on("connect", (message) => {
            console.log("Connected");
            console.log(message);
        });
        socket.on("clientEvent",(data)=>{
            console.log(data);
        })
        socket.on("join-room",async(roomSocketId)=>{
            socket.join(roomSocketId)//custom room id
            console.log(roomSocketId," Joined");
        })
        socket.on("send-message",(data,roomId)=>{
            io.to(roomId).emit("send-to-room", data);
            console.log(data);
            const 
        })
    });
    server.listen(process.env.PORT, () => {
        console.log(`Listening on port : ${process.env.PORT}`);
    });

    app.use(cors({
        origin: '*'
    }));

    
    app.use(bodyParser.json());

    const graphql = new ApolloServer({ typeDefs, resolvers });
    await graphql.start();

    app.use("/graphql", expressMiddleware(graphql));
};

app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ["GET", "POST"]
}));

app.use(cookieParser());
app.use(express.json());
app.use(session({
    secret: "hjkwfk",
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 30,
        rolling: true
    }
}));

// Self invoke database connection
(async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("Database connected");
    } catch (error) {
        console.log("Error in database connection:", error);
    }
})();

// Authetication Midddleware
 const authenticateJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.SECRET, (err, user) => {
            if (err) {
                console.log("Authentication failed in middleware");
                return res.sendStatus(403);
            } else {
                console.log("Authentication completed in middleware");
                req.user = user;
                next();
            }
        });
    } else {
        res.json({ message: "Token not found" });
    }
};

// Routes
app.get("/health", (req, res) => {
    res.json({ message: "Server is up and running" });
});

app.get('/', (req, res) => {
    if (req.session.views) {
        req.session.views++;
        res.json({ message: `You have visited this page ${req.session.views} times` });
    } else {
        req.session.views = 1;
        res.send('Welcome to the page for the first time!');
    }
});

app.post("/signup", async (req, res) => {
    const data = req.body;
    const parsedData = userSignUpSchema.safeParse(data);

    if (parsedData.success) {
        const { email, password } = parsedData.data;

        const alreadyExist = await Users.findOne({ email });
        if (alreadyExist) {
            return res.json({ message: "User already exists" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = new Users({
            email: email,
            password: hashedPassword,
            socketId:"-1",
            customSocketId:bcrypt.hashSync(email,10)
        });
        await user.save();

        const token = jwt.sign({ email: email }, jwtSecret, { expiresIn: '1000h' });

        res.cookie('token', token, { httpOnly: true, secure: false });
        res.json({ message: "SignUp Successful", token });
    } else {
        console.log("Invalid input from user");
        return res.json({ message: "Invalid input from user", errors: parsedData.error });
    }
});

app.post("/login", async (req, res) => {
    const payload = req.body;
    const parsedData = userSignUpSchema.safeParse(payload);
    console.log(parsedData.data);

    if (parsedData.success) {
        const { email, password } = parsedData.data;

        try {
            const user = await Users.findOne({ email });

            if (user && bcrypt.compareSync(password, user.password)) {
                const token = jwt.sign({ email }, jwtSecret, { expiresIn: "1000h" });
                res.cookie('token', token, { httpOnly: true, secure: false });
                console.log("User logged in successfully");
                return res.status(200).json({ message: "User logged in", token });
            } else {
                console.log("Invalid email or password in login");
                return res.status(200).json({ message: "Invalid email or password" });
            }
        } catch (error) {
            console.error("Error logging in:", error);
            return res.status(200).json({ message: "Error logging in" });
        }
    } else {
        console.log("Invalid input from user");
        return res.status(200).json({ message: "Invalid input from user", errors: parsedData.error });
    }
});

app.post("/createRoom", authenticateJwt, async (req, res) => {
    const payload = req.body;
    const parsedData = roomNameSchema.safeParse(payload);

    if (parsedData.success) {
        try {
            const user = await Users.findOne({ email: req.user.email });
            const roomName = parsedData.data.roomName; 
            // console.log(user.rooms);/

            const user2 = await Users.findOne({ email: req.user.email }).populate('rooms');
            // console.log(user2.rooms);

            for (let i = 0; i < user2.rooms.length; i++) {
                if (user2.rooms[i].roomName === roomName) {
                    return res.status(400).json({ message: "Cannot create room with the same name" });
                }
            }
            const timestamp = Date.now().toString();
            const socketIdForRoom = bcrypt.hashSync(roomName + timestamp, 10);

            const members = [user.customSocketId];
            const obj = {
                roomName: roomName,
                members: members,
                messages: [],
                socketId: socketIdForRoom
            };

            const room = new Rooms(obj);
            await room.save();

            user.rooms.push(room._id);
            await user.save();

            res.json(obj);
            console.log("Room created");
        } catch (error) {
            console.error("Error creating room:", error);
            return res.status(500).json({ message: "Error creating room" });
        }
    } else {
        console.log("Invalid input from user");
        return res.status(400).json({ message: "Invalid input from user", errors: parsedData.error });
    }
});

app.post("/joinRoom", authenticateJwt, async (req, res) => {
    const payload = req.body;
    const parsedData = roomSocketIdSchema.safeParse(payload);

    if (parsedData.success) {
        try {
            const user = await Users.findOne({ email: req.user.email });
            const roomSocketId = parsedData.data.roomSocketId;

            const room = await Rooms.findOne({ socketId: roomSocketId });
            if (!room) {
                return res.status(404).json({ message: "Room does not exist" });
            }

            

            room.members.push(user.customSocketId);
            user.rooms.push(room._id);
            await room.save();
            await user.save();
            
            return res.status(200).json({ message: "Room joined successfully" });

        } catch (error) {
            console.error("Error joining room:", error);
            return res.status(500).json({ message: "Error joining room" });
        }
    } else {
        console.log("Invalid input from user");
        return res.status(400).json({ message: "Invalid input from user", errors: parsedData.error });
    }
});

app.post("/deleteRoom", authenticateJwt, async (req, res) => {
    const roomId = req.body;
    const parsedData = roomSocketIdSchema.safeParse(roomId);

    if (parsedData.success) {
        try {
            const roomSocketId = parsedData.data.roomSocketId;
            const user = await Users.findOne({ email: req.user.email });
            try {
                const room = await Rooms.findOne({ socketId: roomSocketId });
                if (!room) {
                    return res.status(404).json({ message: "Room does not exist" });
                }

                if (!room.members.includes(user.customSocketId)) {
                    return res.status(403).json({ message: "User is not a member of this room" });
                }

                const updatedRooms = user.rooms.filter(id => id.toString() !== room._id.toString());
                const updatedMembers = room.members.filter(memberId => memberId !== user.customSocketId);

                user.rooms = updatedRooms;
                room.members = updatedMembers;

                await user.save();
                await room.save();

                if (room.members.length === 0) {
                    await Rooms.deleteOne({ _id: room._id });
                    return res.status(200).json({ message: `Room ${room.socketId} deleted successfully` });
                }

                return res.status(200).json({ message: `User removed from room ${room.socketId} successfully` });
            } catch (error) {
                console.error("Error deleting room:", error);
                return res.status(500).json({ message: "Error deleting room" });
            }
        } catch (error) {
            console.error("Error deleting room:", error);
            return res.status(500).json({ message: "Error deleting room" });
        }
    } else {
        console.log("Invalid input from user");
        return res.status(400).json({ message: "Invalid input from user", errors: parsedData.error });
    }
});


app.get("/getRooms", authenticateJwt, async (req, res) => {
    try {
        const user = await Users.findOne({ email: req.user.email }).populate({
            path: 'rooms',
            populate: {
                path: 'messages',
                model: 'Message'
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const rooms = user.rooms.map(room => ({
            roomName: room.roomName,
            socketId: room.socketId,
            messages: room.messages.map(message => ({
                content: message.content,
                sender: message.sender
            }))
        }));

        res.status(200).json({ rooms: rooms });

    } catch (error) {
        console.error("Error fetching user's rooms:", error);
        return res.status(500).json({ message: "Error fetching user's rooms" });
    }
});


app.post("/fake-message",authenticateJwt,async(req,res)=>{
    const roomId = req.body;
    const parsedData = roomSocketIdSchema.safeParse(roomId);

    if(parsedData.success)
    {
        const roomSocketId = parsedData.data.roomSocketId;
        const user = await Users.findOne({ email: req.user.email });
        const room = await Rooms.findOne({socketId: roomSocketId });

        for(let i=0;i<5;i++)
        {
            const obj = {
                content : `Message ${i}`,
                sender : user.customSocketId
            }
            const message = new Messages(obj)
            await message.save();

            room.messages.push(message._id);
        }
        await room.save();
        res.status(200).json({message:"Messages sent"})
        
    }else{
        console.log("Invalid input from user");
        return res.status(400).json({ message: "Invalid input from user", errors: parsedData.error });
    }
})

startServer();