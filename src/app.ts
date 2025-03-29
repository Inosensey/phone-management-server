import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import * as dotenv from "dotenv";
dotenv.config();

import { ConnectDb } from "./config/MongoDbCon";
ConnectDb();

const app: Application = express();
const port = process.env.PORT;

// Routes
import userRoutes from "./routes/userRoutes";
import mySqlRoutes from "./routes/mySqlTableRoutes";
import contactInformationRoutes from "./routes/contactInformationRoutes";

// Middlewares
import errorHandler from "./middlewares/errorMiddleware";

app.set("json spaces", 4);
app.use(
  cors({
    origin: ["http://localhost:5000", "http://localhost:5173, https://phone-management-site.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/user", userRoutes);
app.use("/api/mySqlTable", mySqlRoutes);
app.use("/api/contact-information", contactInformationRoutes);
app.use("*", (req: express.Request, res: express.Response) => {
  res.status(404).json({ Error: "Not found" });
});

app.use(errorHandler);

app.listen(port, () => console.log(`Server is running`));
