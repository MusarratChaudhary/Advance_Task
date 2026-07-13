export const env = {

 PORT:Number(process.env.PORT),

 MONGODB_URI:
 process.env.MONGODB_URI as string,


 CLIENT_URL:
 process.env.CLIENT_URL as string,


 JWT_SECRET:
 process.env.JWT_SECRET as string,


 JWT_EXPIRE:
 process.env.JWT_EXPIRE || "7d"

};