import mysql from "mysql2/promise";

import * as dotenv from "dotenv";
dotenv.config();

export const MySqlConnectDb = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MySqlHost!,
      port: parseInt(process.env.MySqlPort!),
      user: process.env.MySqlUser!,
      password: process.env.MySqlPassword!,
      database: process.env.MySqlDatabase!,
    });
    return connection
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
