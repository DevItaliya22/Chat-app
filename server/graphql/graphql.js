
const typeDefs = `
    type Room {
        roomName: String!
        members: [User]
        messages: [Message]
        socketId: String!
    }
    type User {
        email: String!
        password: String!
        rooms: [Room]
        socketId: String!
    }
    type Message {
        content: String!
        sender: String!
        
    }
    type Query {
        hello: String
        getAllUsers: [User]
        getMessages(content: String!): [Message]
    }
`;

const resolvers = {
    Query: {
        hello: () => 'Hello world!',
        getAllUsers: () => [{ email: 'user1@example.com', password: 'password1', socketId: 'socketId1' },{ email: 'user2@example.com', password: 'password2', socketId: 'socketId1' }],
        getMessages: (parent, args) => [{ content: args.content, sender: 'sender1' }]
    },
    Room: {
        roomName: () => 'Sample Room',
        members: () => [{ email: 'user1@example.com', password: 'password1', socketId: 'socketId1' },{ email: 'user2@example.com', password: 'password2', socketId: 'socketId2' }],
        messages: () => [{ content: 'content1', sender: 'sender1' },{ content: 'content1', sender: 'sender1' },{ content: 'content1', sender: 'sender1' },{ content: 'content1', sender: 'sender1' },{ content: 'content1', sender: 'sender1' }],
        socketId: () => 'socketId1'
    },
    User: {
        email: () => 'user1@example.com',
        password: () => 'password1',
        rooms: () => [{ roomName: 'Sample Room1', socketId: 'socketId1' },{ roomName: 'Sample Room2', socketId: 'socketId2' }],
        socketId: () => 'socketId1'
    },
    Message: {
        content: () => 'hello form content',
        sender: () => 'sender1'
    }
};

export { resolvers, typeDefs };
