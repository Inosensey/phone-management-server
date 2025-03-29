import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
    status?: number;
  }

const errorHandler = (err: CustomError, req:Request, res:Response, next:NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || "Server Error" });
  };
  
export default errorHandler