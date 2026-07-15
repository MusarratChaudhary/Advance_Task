import jwt from "jsonwebtoken";

const generateToken = (userId: string): string => {
  const token = jwt.sign(
    {
      id: userId,
    },

    process.env.JWT_SECRET as string,

    {
      expiresIn: "7d",
    },
  );

  return token;
};

export default generateToken;
