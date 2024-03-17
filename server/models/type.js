import zod from 'zod'

const userSignUpSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(4).max(56),
    
});
export {
    userSignUpSchema
};
