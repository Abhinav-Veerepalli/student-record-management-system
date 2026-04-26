import bcrypt from "bcrypt"
var password='123'


var hash=await bcrypt.hash(password,10)
export const user=[
    {
        id:"202101",
        role:"admin",
        username:"admin@gmail.com",
        password:hash
    }
    
];
