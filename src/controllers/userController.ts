import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { ResultSetHeader, RowDataPacket } from "mysql2";

import { MySqlConnectDb } from "../config/MySqlDbCon";
import { mailOptions, transporter } from "../utils/nodemailerConfig";

const checkIfUserExist = async (email: string) => {
  try {
    const connection = await MySqlConnectDb();
    const checkIfUserExistQuery = `
            SELECT * FROM users WHERE email = ?
        `;
    const [row] = await connection.execute<RowDataPacket[]>(
      checkIfUserExistQuery,
      [email]
    );
    await connection.end();
    if (row.length === 1) {
      return true;
    }
    return false;
  } catch (error) {
    return error;
  }
};

const generatePassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const forgetPasswordEmailBody = (code: number) => {
  return {
    text: "this is just a test",
    html: `
          <!DOCTYPE html>
            <html>
    
            <head>
                <title></title>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <style type="text/css">
                  @media screen and (max-width: 600px) {
                    .content {
                        width: 100% !important;
                        display: block !important;
                        padding: 10px !important;
                    }
                    .header, .body, .footer {
                        padding: 20px !important;
                    }
                  }
                </style>
            </head>
    
            <body style="font-family: 'Poppins', Arial, sans-serif">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                      <td align="center" style="padding: 20px;">
                          <table class="content" width="600" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #222831;">
                              <!-- Header -->
                              <tr>
                                  <td class="header" style="background-color: #222831; padding: 40px; text-align: center; color: white; font-size: 24px;">
                                    <span style="color: #D3F0D1;">PhoneBook Management</span> Team
                                  </td>
                              </tr>
    
                              <!-- Body -->
                              <tr>
                                  <td class="body" style="padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;">
                                    Your password reset code: <span style="background-color: #000; color: #fff; padding: 0.3rem;">${code}</span> <br>
                                  </td>
                              </tr>
                              <!-- Footer -->
                              <tr>
                                  <td class="footer" style="background-color: #222831; padding: 40px; text-align: center; color: white; font-size: 14px;">
                                  Copyright &copy; 2025 | <span style="color: #D3F0D1;">Philip Mathew</span>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>
    
          </html>`,
  };
};
const approveAccountEmailBody = () => {
  return {
    text: "this is just a test",
    html: `
          <!DOCTYPE html>
            <html>
    
            <head>
                <title></title>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <style type="text/css">
                  @media screen and (max-width: 600px) {
                    .content {
                        width: 100% !important;
                        display: block !important;
                        padding: 10px !important;
                    }
                    .header, .body, .footer {
                        padding: 20px !important;
                    }
                  }
                </style>
            </head>
    
            <body style="font-family: 'Poppins', Arial, sans-serif">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                      <td align="center" style="padding: 20px;">
                          <table class="content" width="600" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #222831;">
                              <!-- Header -->
                              <tr>
                                  <td class="header" style="background-color: #222831; padding: 40px; text-align: center; color: white; font-size: 24px;">
                                    <span style="color: #D3F0D1;">PhoneBook Management</span> Team
                                  </td>
                              </tr>
    
                              <!-- Body -->
                              <tr>
                                  <td class="body" style="padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;">
                                    Good day! Your account on Phone Book Management has been approved.
                                  </td>
                              </tr>
                              <!-- Footer -->
                              <tr>
                                  <td class="footer" style="background-color: #222831; padding: 40px; text-align: center; color: white; font-size: 14px;">
                                  Copyright &copy; 2025 | <span style="color: #D3F0D1;">Philip Mathew</span>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>
    
          </html>`,
  };
};

const addUserThroughAdminEmailBody = (email: string, password: string) => {
  return {
    text: "this is just a test",
    html: `
          <!DOCTYPE html>
            <html>
    
            <head>
                <title></title>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <style type="text/css">
                  @media screen and (max-width: 600px) {
                    .content {
                        width: 100% !important;
                        display: block !important;
                        padding: 10px !important;
                    }
                    .header, .body, .footer {
                        padding: 20px !important;
                    }
                  }
                </style>
            </head>
    
            <body style="font-family: 'Poppins', Arial, sans-serif">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                      <td align="center" style="padding: 20px;">
                          <table class="content" width="600" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #222831;">
                              <!-- Header -->
                              <tr>
                                  <td class="header" style="background-color: #222831; padding: 40px; text-align: center; color: white; font-size: 24px;">
                                    <span style="color: #D3F0D1;">PhoneBook Management</span> Team
                                  </td>
                              </tr>
    
                              <!-- Body -->
                              <tr>
                                  <td class="body" style="padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;">
                                    Good day! You have an invite on Phone Book Management. Use the credentials below to login.
                                    Email: ${email}
                                    Password: ${password}
                                  </td>
                              </tr>
                              <!-- Footer -->
                              <tr>
                                  <td class="footer" style="background-color: #222831; padding: 40px; text-align: center; color: white; font-size: 14px;">
                                  Copyright &copy; 2025 | <span style="color: #D3F0D1;">Philip Mathew</span>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>
    
          </html>`,
  };
};

export const getUsers = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const getUsersQuery = `
            SELECT 
              users.id, 
              users.email, 
              users.first_name, 
              users.last_name, 
              users.username, 
              roles.id as role_id, 
              roles.name as role_name,
              status.id as status_id, 
              status.name as status_name
            FROM 
              users 
            INNER JOIN 
              roles ON users.role_id = roles.id
            INNER JOIN 
              status ON users.status_id = status.id
              `;
              // WHERE roles.id = 1
              // const getUsersQuery = `
    //         DELETE FROM users WHERE id = 16
    //     `;
    const [row] = await connection.execute<RowDataPacket[]>(getUsersQuery);
    res.status(200).json(row);
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
};

export const getAccountRequest = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const getUsersQuery = `
            SELECT 
              accountRequest.id, 
              accountRequest.email, 
              accountRequest.first_name, 
              accountRequest.last_name, 
              accountRequest.username, 
              roles.id as role_id, 
              roles.name as role_name
            FROM 
              account_request as accountRequest 
            INNER JOIN 
              roles ON accountRequest.role_id = roles.id
        `;
    const [row] = await connection.execute<RowDataPacket[]>(getUsersQuery);
    res.status(200).json(row);
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
};

export const approveAccountRequest = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const { id } = req.body;
    const approveAccountRequestQuery = `
            INSERT INTO users (username, email, first_name, last_name, password, role_id) 
            SELECT username, email, first_name, last_name, password, role_id FROM account_request WHERE id = ?;
        `;
    const [result] = await connection.execute<ResultSetHeader>(
      approveAccountRequestQuery,
      [id]
    );

    const newUserId = result.insertId;

    const getUserQuery = `
        SELECT 
          users.id, 
          users.email, 
          users.first_name, 
          users.last_name, 
          users.username, 
          roles.id as role_id, 
          roles.name as role_name,
          status.id as status_id, 
          status.name as status_name
        FROM 
          users
        INNER JOIN 
          roles ON users.role_id = roles.id
        INNER JOIN 
          status ON users.status_id = status.id 
        WHERE users.id = ?;
    `;
    const [row] = await connection.execute<RowDataPacket[]>(getUserQuery, [
      newUserId,
    ]);

    const deleteAccountRequestQuery = `
            DELETE FROM account_request WHERE id = ?;
        `;
    await connection.execute(deleteAccountRequestQuery, [id]);

    const emailContent: { text: string; html: string } =
      approveAccountEmailBody();
    const emails = {
      ...mailOptions,
      to: row[0].email,
    };
    await transporter.sendMail({
      ...emails,
      ...emailContent,
      subject: "Account Approval",
    });
    res
      .status(200)
      .json({
        Result: true,
        Message: "Account Request Approved!",
        user: row[0],
      });
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
};

export const registerUser = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const { username, email, firstName, lastName, password, roleId } = req.body;
    const userExist = await checkIfUserExist(email);
    if (userExist) {
      res
        .status(200)
        .json({
          Result: false,
          Message: `${roleId === 1 ? "User" : "Admin"} Already Exist!`,
        });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let registerUserQuery = "";
    if (roleId === 2) {
      registerUserQuery = `
            INSERT INTO users (username, email, first_name, last_name, password, role_id) VALUES (?, ?, ?, ?, ?, ?);
        `;
    } else {
      registerUserQuery = `
            INSERT INTO account_request (username, email, first_name, last_name, password, role_id) VALUES (?, ?, ?, ?, ?, ?);
        `;
    }
    await connection.execute(registerUserQuery, [
      username,
      email,
      firstName,
      lastName,
      hashedPassword,
      roleId,
    ]);
    res
      .status(200)
      .json({
        Result: true,
        Message: `${roleId === 1 ? "User" : "Admin"} Successfully Registered`,
      });
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end(); // Ensure connection is closed
  }
};

export const getUserRoles = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const getRolesQuery = `
            SELECT * FROM roles;
        `;
    const [rows] = await connection.execute(getRolesQuery);
    res.status(200).json({ rows });
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end(); // Ensure connection is closed
  }
};

export const userSignIn = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const { email, password } = req.body;
    const getUserQuery = `
            SELECT id, email, password, role_id FROM users WHERE email = ?
        `;
    const [user] = await connection.execute<RowDataPacket[]>(getUserQuery, [
      email,
    ]);

    if (user.length === 0) {
      res.status(200).json({ Result: false, Message: "Invalid Credentials!" });
      return;
    }

    const passwordIsValid = await bcrypt.compare(password, user[0].password);
    if (!passwordIsValid) {
      res.status(200).json({ Result: false, Message: "Invalid Credentials!" });
      return;
    }

    const token = jwt.sign(
      { userId: user[0].id },
      process.env.JWT_SECRET ||
        "9c7708264b359ca23c76e30114cf405ec9c6c1c69230acbb1284a578cbe392a7",
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 3600000, // 1 hour
    });

    res
      .status(200)
      .json({ Result: true, Message: "Signed In Successfully", Token: token, userId: user[0].id, roleId: user[0].role_id });
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
};

export const userSignOut = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    });
    res.clearCookie("sb-hkkdnmwhykefsuynnnqy-auth-token-code-verifier", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    });
    res.clearCookie("sb-hkkdnmwhykefsuynnnqy-auth-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    });

    res.json({ Result: true, message: "Logged out successfully" });
  } catch (error) {
    res.json(error);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const { email, code } = req.body;

    const getUserQuery = `
            SELECT email, password FROM users WHERE email = ?
        `;
    const [user] = await connection.execute<RowDataPacket[]>(getUserQuery, [
      email,
    ]);

    if (user.length === 0) {
      res.status(200).json({ Result: false, Message: "Email doesn't Exist!" });
      return;
    }

    const emailContent: { text: string; html: string } =
      forgetPasswordEmailBody(code);
    const emails = {
      ...mailOptions,
      to: email,
    };
    const response = await transporter.sendMail({
      ...emails,
      ...emailContent,
      subject: "Change Password",
    });
    res
      .status(200)
      .json({ Result: true, Message: "Email sent!", response: response });
  } catch (error) {
    res.json(error);
  }
};

export const changePassword = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const changePasswordQuery = `
            UPDATE users SET password = ? WHERE email = ?
        `;
    await connection.execute(changePasswordQuery, [hashedPassword, email]);
    res.status(200).json({ Result: true, Message: "Password Changed!" });
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
};

export const deactivateUser = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const { id } = req.body;

    const deactivateUserQuery = `
       UPDATE users SET status_id = ? WHERE id = ?
    `;

    await connection.execute(deactivateUserQuery, [2, id]);
    res.status(200).json({ Result: true, Message: "User Deactivated" });
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
};

export const activateUser = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const { id } = req.body;

    const activateUserQuery = `
       UPDATE users SET status_id = ? WHERE id = ?
    `;

    await connection.execute(activateUserQuery, [1, id]);
    res.status(200).json({ Result: true, Message: "User Activated" });
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
};

export const addUserThroughAdmin = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();

    const { username, email, firstName, lastName } = req.body;
    const password: string = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);
    const addUserThroughAdminQuery = `
            INSERT INTO users (username, email, first_name, last_name, password, role_id) VALUES (?, ?, ?, ?, ?, ?);
    `;
    const [result] = await connection.execute<ResultSetHeader>(
      addUserThroughAdminQuery,
      [username, email, firstName, lastName, hashedPassword, 1]
    );

    const newUserId = result.insertId;

    const getUserQuery = `
        SELECT 
          users.id, 
          users.email, 
          users.first_name, 
          users.last_name, 
          users.username, 
          roles.id as role_id, 
          roles.name as role_name,
          status.id as status_id, 
          status.name as status_name
        FROM 
          users
        INNER JOIN 
          roles ON users.role_id = roles.id
        INNER JOIN 
          status ON users.status_id = status.id 
        WHERE users.id = ?;
    `;
    const [row] = await connection.execute<RowDataPacket[]>(getUserQuery, [
      newUserId,
    ]);

    const emailContent: { text: string; html: string } =
      addUserThroughAdminEmailBody(row[0].email, password);
    const emails = {
      ...mailOptions,
      to: row[0].email,
    };
    console.log(emails);
    await transporter.sendMail({
      ...emails,
      ...emailContent,
      subject: "New Invite",
    });

    res
      .status(200)
      .json({ Result: true, Message: "User Added!", user: row[0] });
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
};

export const updateUser = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const { id, username, firstName, lastName, email } = req.body;

    const updateUserQuery = `
       UPDATE 
        users 
      SET 
        username = ?,
        email = ?,
        first_name = ?,
        last_name = ?
      WHERE 
        id = ?
    `;
    await connection.execute(updateUserQuery, [
      username,
      email,
      firstName,
      lastName,
      id,
    ]);
    res.status(200).json({ Result: true, Message: "User Updated" });
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const { id } = req.body;
    const deleteUserQuery = `
        DELETE FROM users WHERE id = ?;
    `;
    await connection.execute(deleteUserQuery, [id]);
    res.status(200).json({ Result: true, Message: "User Deleted" });
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
};
