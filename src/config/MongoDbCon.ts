import mongoose from "mongoose";

const ConnectDb = async () => {
  try {
    const conn = await mongoose.connect(`${process.env.MONGO_CONNECTION}`);

    console.log(`Mongo DB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
export { ConnectDb };
