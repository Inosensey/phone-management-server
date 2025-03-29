import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";

import { MySqlConnectDb } from "../config/MySqlDbCon";

export const createRoleTable = async (req: Request, res: Response) => {
  try {
    const connection = await MySqlConnectDb();
    const createRoleTableQuery = `
            CREATE TABLE IF NOT EXISTS roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name ENUM('User', 'Admin') NOT NULL UNIQUE
            );
        `;
    await connection.execute(createRoleTableQuery);
    res.status(200).json("Roles table created!");
    await connection.end();
  } catch (error) {
    res.json(error);
  }
};

export const createStatusTable = async (req: Request, res: Response) => {
  try {
    const connection = await MySqlConnectDb();
    const createRoleTableQuery = `
            CREATE TABLE IF NOT EXISTS status (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name ENUM('Activate', 'Deactivated') NOT NULL UNIQUE
            );
        `;
    await connection.execute(createRoleTableQuery);
    res.status(200).json("Status table created!");
    await connection.end();
  } catch (error) {
    res.json(error);
  }
};

export const getStatus = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const getStatusQuery = `
            SELECT * FROM status
        `;
    const [row] = await connection.execute<RowDataPacket[]>(getStatusQuery);
    res.status(200).json(row);
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
}
export const displayData = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const getStatusQuery = `
            SELECT * FROM contact_shares
        `;
    const [row] = await connection.execute<RowDataPacket[]>(getStatusQuery);
    res.status(200).json(row);
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
}

export const insertStatus = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const { name } = req.body;
    const insertStatusQuery = `
            INSERT INTO status (name) VALUES ('Activate'), ('Deactivated');
        `;
        await connection.execute(insertStatusQuery);
    res.status(200).json("Status inserted!");
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
}

export const updateStatus = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const { id, name } = req.body;
    const updateStatusQuery = `
            UPDATE status SET name = 'Active' WHERE id = 1;
        `;
    await connection.execute(updateStatusQuery);
    res.status(200).json("Status updated!");
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
}

export const createUsersTable = async (req: Request, res: Response) => {
  try {
    const connection = await MySqlConnectDb();
    const createUsersTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
            );
        `;
    await connection.execute(createUsersTableQuery);
    res.status(200).json("Users table created!");
    await connection.end();
  } catch (error) {
    res.json(error);
  }
};

export const createAccountRequestTable = async (req: Request, res: Response) => {
  try {
    const connection = await MySqlConnectDb();
    const createUsersTableQuery = `
            CREATE TABLE IF NOT EXISTS account_request (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username  VARCHAR(100) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                first_name  VARCHAR(100) NOT NULL UNIQUE,
                last_name  VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
            );
        `;
    await connection.execute(createUsersTableQuery);
    res.status(200).json("Users table created!");
    await connection.end();
  } catch (error) {
    res.json(error);
  }
};

export const alterUserTable = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const alterUserTable = `
         ALTER TABLE contact_shares 
        MODIFY COLUMN contact_information_id VARCHAR(255) NOT NULL;
     `;
    await connection.execute(alterUserTable);
    res.status(200).json("Users table altered!");
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
};

export const createContactSharesTable = async (req: Request, res: Response) => {
  try {
    const connection = await MySqlConnectDb();
    const createContactSharesTableQuery = `
            CREATE TABLE IF NOT EXISTS contact_shares (
                id INT AUTO_INCREMENT PRIMARY KEY,
                contact_share_to INT(11) NOT NULL,
                contact_owner_id INT(11) NOT NULL,
                contact_information_id INT(11) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (contact_share_to) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (contact_owner_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_share (contact_share_to, contact_owner_id, contact_information_id)
            );
        `;
    await connection.execute(createContactSharesTableQuery);
    res.status(200).json("Contact Shares table created!");
    await connection.end();
  } catch (error) {
    res.json(error);
  }
};

export const showAllTablesWithColumns = async (req: Request, res: Response) => {
  try {
    const connection = await MySqlConnectDb();

    const [tables] = await connection.execute<RowDataPacket[]>("SHOW TABLES;");
    const tableNames = tables.map((table: any) => Object.values(table)[0]);

    const tablesWithColumns: Record<string, any[]> = {};

    for (const tableName of tableNames) {
      const [columns] = await connection.execute<RowDataPacket[]>(
        `SHOW COLUMNS FROM \`${tableName}\`;`
      );
      tablesWithColumns[tableName as string] = columns;
    }

    res.status(200).json({ tables: tablesWithColumns });

    await connection.end();
  } catch (error) {
    res.status(500).json({ error });
  }
};
