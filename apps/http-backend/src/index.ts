import express from "express";
import { JWT_SECRET } from '@repo/backend-common/config';
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
 

 
const app = express();
app.use(express.json());


app.post("/signup", async(req,res)=>{
 
  const parsedData = CreateUserSchema.safeParse(req.body);
  if(!parsedData.success){
      res.json({
          message: " invalid inputs"
      })
      return;
  }
  // db call
  try{
   const user = await prismaClient.user.create({
      data:{
          email:parsedData.data?.username,
          // hash the password using bcrypt
          password:parsedData.data.password,
          name:parsedData.data.name,
      }
     
  })
  res.json({
    userId: user.id
     
  })
  }
  catch(e){
      res.status(411).json({  
          message: "User already exists"
      })
  }

  
})
app.post("/signin", async (req,res)=>{
   const parsedData = SigninSchema.safeParse(req.body);
   if(!parsedData.success){
       res.json({
           message: " invalid inputs"
       })
       return;
   }
    // compare the password with the hash
    const user = await prismaClient.user.findFirst({
        where:{
            email:parsedData.data.username,
            password:parsedData.data.password
        }
    })
if(!user){
    res.status(401).json({
        message:"Invalid Credentials"
    })
}
else{
    const token = jwt.sign({
        userId:user?.id
    }, JWT_SECRET)
    res.json({
        token
    })
}

})

app.post("/room",middleware, async (req,res)=>{
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if(!parsedData.success){
      res.json({
          message: " invalid inputs"
      })
      return;
  }
  //@ts-ignore
  const userId = req.userId;
  await prismaClient.room.create({
      data:{
           slug:parsedData.data.name,
           adminId:userId,
          
      }
  })
  // db call
   res.json({
    roomId:123,
    message:"room created"
  })
    
   
  })

app.listen(3001)