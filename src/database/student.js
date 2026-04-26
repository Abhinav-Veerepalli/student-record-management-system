import {data} from "./data.js"
import bcrypt from "bcrypt"
export var student=[]
var username;
var password;
for(var i of data){

  username=String(i.phone)
  password=await bcrypt.hash(i.id,10)
  student.push({
    id:i.id,
    username:username,
    password:password,
    role:'student'
  })
}
