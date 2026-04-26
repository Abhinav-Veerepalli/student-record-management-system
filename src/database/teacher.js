
import bcrypt from "bcrypt"

var password="456";
var hash=await bcrypt.hash(password,10);
export const teacher=[
    {
        id:"202501",
        username:"teacher@gmail.com",
        password:hash,
        role:"teacher"
    }
]


