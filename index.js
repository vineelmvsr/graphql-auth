import { GraphQLServer } from 'graphql-yoga'
import users from "../src/db"
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken'



const typeDefs = `
type Query {
       users(name:String, id:ID):[Users!]!
       logindetails(data:Login):AuthUsers!
       
}
type Mutation{
    createUser(data:UserInfo!):AuthUsers!
}
type Users
{
    id:ID
    name:String!
    email:String!
}
input Login
{
    email:String!
    password:String!
}
input UserInfo 
{

    name:String!
    email:String!
    password:String!
}
type AuthUsers
{
    token:String!
    user:Users!
}
`
const resolvers = {
    Query: {
             users(parents,args,ctx,info) {
                        if(args.name)
                        {
                            const displaybyName = users.filter((user)=> args.name === user.name)
                            return displaybyName
                        }
                        else if(args.id)
                        {
                            const displaybyid = users.filter((user)=> args.id === user.id)
                            return displaybyid
                        }
                        return users
                     },
              logindetails(parents,args,ctx,info)
              {
                  const authuser = users.find((user)=> user.email===args.data.email)
                  const found= users.some((user)=> user.email===args.data.email)
                  if(!found)
                  {
                      throw new Error("email not found");
                  }
                   
                  if(authuser.password===args.data.password)
                  {
                      return{
                          user:authuser,
                          token:jwt.sign({userid:authuser.id},'secret')
                      }
                  }
                  else
                  throw new Error("not authorized")
        
              }

                     
            },
       Mutation : {
               createUser(parents,args,ctx,info)
               {
                  const etaken =users.some((user)=> user.email===args.data.email)

                   if(!etaken)
                   {
                     
                    const newuser={
                        id:uuidv4(),
                        name:args.data.name,
                        email:args.data.email,
                        password:args.data.password
                    }
                   users.push(newuser)
                   return {
                       user:newuser,
                       token:jwt.sign({userid:newuser.id},'secret')
                   }
                }
                
                   else
                   throw new Error("email already in use")
                  
               }

       }
    }


    const server = new GraphQLServer({
        typeDefs,
        resolvers
        })

        server.start(() => {
            console.log('The server is up!')
            })    