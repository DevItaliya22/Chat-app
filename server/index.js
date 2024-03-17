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
import { handleSockets } from './socket/socket.js';
import { resolvers, typeDefs } from './graphql/graphql.js';
import { userSignUpSchema } from "./models/type.js";
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

    io.on("connection", handleSockets);
    server.listen(process.env.PORT, () => {
        console.log(`Listening on port : ${process.env.PORT}`);
    });

    
    app.use(bodyParser.json());

    const graphql = new ApolloServer({ typeDefs, resolvers });
    await graphql.start();

    app.use("/graphql", expressMiddleware(graphql));
};

app.use(cors({
    origin: process.env.FRONTEND_URL,
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
            password: hashedPassword
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
                return res.status(401).json({ message: "Invalid email or password" });
            }
        } catch (error) {
            console.error("Error logging in:", error);
            return res.status(500).json({ message: "Error logging in" });
        }
    } else {
        console.log("Invalid input from user");
        return res.status(400).json({ message: "Invalid input from user", errors: parsedData.error });
    }
});



startServer();
