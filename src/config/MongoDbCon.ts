import mongoose from "mongoose";

const ConnectDb = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_CONNECTION}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
export { ConnectDb };
