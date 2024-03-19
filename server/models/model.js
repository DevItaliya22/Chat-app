import mongoose,{model,Schema} from "mongoose"

const user = new Schema({
   email:{
    type:String,
    require:true,
    unique:true
   },
   password:{
    type:String,
    require:true
   },
   rooms:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Room'
   }],
   customSocketId:{
    type:String
   }

})

const rooms = new Schema({
    roomName : {
        type:String
    },
    members:[{
        type:String,
    }],
    messages:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Message'
    }],
    socketId:{
        type:String,
        require:true
    }
})

// Socket ids will be stored here
const messages = new Schema({
    content:{
        type:String
    },
    sender:{
        type:String,
        require:true,
    }
})

const Users = model('User',user)
const Messages = model('Message',messages)
const Rooms = model('Room',rooms)

export {
    Users,
    Messages,
    Rooms
}