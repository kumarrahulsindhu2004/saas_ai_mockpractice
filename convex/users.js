import { mutation, query } from "./_generated/server";
import {v} from "convex/values"
export const CreateNewUser=mutation({
    args:{
        name:v.string(),
        email:v.string(),
        imageUrl:v.string()
    },
    handler:async(ctx,args)=>{
        // if user already exist
        const user = await ctx.db.query('UserTable')
        .filter(q=>q.eq(q.field('email'),args.email)).collect();

            // if user not then insert new user to db

            if(user?.length==0){
                const data ={
                    email:args.email,
                    imageUrl:args?.imageUrl,
                    name:args.name
                }
                const result = await ctx.db.insert('UserTable',{
                    ...data
                });
                console.log(result)
                return {
                    ...data,
                    result
        
                }
            }
            return user[0];
    }
})

export const GetUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const res = await ctx.db.query("UserTable")
      .filter(q => q.eq(q.field("email"), args.email))
      .collect();

    return res[0] || null;
  },
});
