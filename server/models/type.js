import zod from 'zod'

const userSignUpSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(4).max(56),
    
});
const roomNameSchema = zod.object({
    roomName : zod.string(),
})
const roomSocketIdSchema = zod.object({
    roomSocketId : zod.string(),
})
const saveDataSchema = zod.object({
    message:zod.array(),
    roomId:zod.string()

})
export {
    userSignUpSchema,
    roomNameSchema,
    roomSocketIdSchema,
    saveDataSchema
};
