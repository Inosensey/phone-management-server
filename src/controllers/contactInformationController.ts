import { Response, Request } from "express";
import { v2 as cloudinary } from "cloudinary";
import { MySqlConnectDb } from "../config/MySqlDbCon";
import streamifier from "streamifier";

// Schema
import phoneBook from "../mongoDbSchema/phoneBooksSchema";
import { contactInfoTypes } from "../types/ContactType";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const uploadStream = async (fileBuffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "phone-book-images" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url as string);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const getContactInformation = async (req: Request, res: Response) => {
  res.status(200).json("Contact Information");
};

export const addContactInformation = async (req: Request, res: Response) => {
  try {
    let imageUrl = "";
    if (!req.file) {
      imageUrl = "";
    } else {
      imageUrl = await uploadStream(req.file.buffer);
    }
    const contactData = JSON.parse(req.body.contactData);
    const newContactInformation = await phoneBook.create({
      user_id: contactData.user_id,
      first_name: contactData.first_name,
      last_name: contactData.last_name,
      contact_number: contactData.contact_number,
      email_address: contactData.email_address,
      contact_profile_photo: imageUrl,
    });
    res.status(201).json({
      Result: true,
      Message: "A new contact has been added.",
      Data: newContactInformation,
    });
  } catch (error) {
    console.log(`Unable to post review: ${error}`);
  }
};

export const getUserContactInformation = async (
  req: Request,
  res: Response
) => {
  try {
    const contactInformation = await phoneBook.find({
      user_id: parseInt(req.params.userId),
    });
    const updatedContactType: Array<
      contactInfoTypes & { profileBlob: string | null }
    > = await Promise.all(
      contactInformation.map(async (info: contactInfoTypes) => {
        if (!info.contact_profile_photo) {
          return { ...info, profileBlob: null };
        }

        const response = await fetch(info.contact_profile_photo);
        const buffer = await response.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString("base64");

        const fileName =
          info.contact_profile_photo.split("/").pop() || "unknown.jpg";
        const updatedInformation: contactInfoTypes & {
          profileBlob: string | null;
          filename: string;
        } = {
          __v: info.__v,
          _id: info._id,
          contact_number: info.contact_number,
          contact_profile_photo: info.contact_profile_photo,
          email_address: info.email_address,
          first_name: info.first_name,
          last_name: info.last_name,
          user_id: info.user_id,
          profileBlob: base64Image,
          filename: fileName,
        };
        return updatedInformation;
      })
    );
    res.status(200).json({
      Result: true,
      contacts: updatedContactType,
    });
  } catch (error) {
    res.json(error);
  }
};

export const updateContactInformation = async (req: Request, res: Response) => {
  try {
    const contactData = JSON.parse(req.body.contactData);
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    let imageUrl = "";
    if (req.file && !allowedMimeTypes.includes(req.file.mimetype)) {
      imageUrl = await uploadStream(req.file.buffer);
    } else {
      imageUrl = req.body.contact_profile_photo;
    }
    const updatedContact = await phoneBook.findOneAndUpdate(
      { _id: contactData._id },
      {
        $set: {
          first_name: contactData.first_name,
          last_name: contactData.last_name,
          contact_number: contactData.contact_number,
          email_address: contactData.email_address,
          contact_profile_photo: imageUrl,
        },
      },
      { new: true }
    );
    res.status(201).json({
      Result: true,
      Message: "A new contact has been added.",
      Data: updatedContact,
    });
  } catch (error) {
    res.json(error);
  }
};

export const deleteContactInformation = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    await phoneBook.deleteOne({ _id: id });
    res.status(201).json({
      Result: true,
      Message: "Contact Deleted",
    });
  } catch (error) {
    res.json(error);
  }
};

export const shareInformationToAUser = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const { contactOwnerId, contactShareTo, contactId } = req.body;
    const shareInformationToAUserQuery = `
            INSERT INTO contact_shares (contact_share_to, contact_owner_id, contact_information_id)  VALUES (?, ?, ?)
        `;
    const [result] = await connection.execute<ResultSetHeader>(
      shareInformationToAUserQuery,
      [contactShareTo, contactOwnerId, contactId]
    );

    res
      .status(200)
      .json({ Result: true, Message: "Contact Successfully Shared!" });
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
};

export const getSharedContactInformation = async (
  req: Request,
  res: Response
) => {
  let connection = await MySqlConnectDb();
  const contactShareTo = parseInt(req.params.contactShareTo);
  try {
    const getSharedContactQuery = `
        SELECT
            contact_information_id
        FROM
          contact_shares
        WHERE contact_share_to = ?;
    `;
    const [row] = await connection.execute<RowDataPacket[]>(
      getSharedContactQuery,
      [contactShareTo]
    );

    const contactIds = row.map((r) => r.contact_information_id);

    const contactInformation = await phoneBook.find({
      _id: { $in: contactIds },
    });
    const updatedContactType: Array<
      contactInfoTypes & { profileBlob: string | null }
    > = await Promise.all(
      contactInformation.map(async (info: contactInfoTypes) => {
        if (!info.contact_profile_photo) {
          return { ...info, profileBlob: null };
        }

        const response = await fetch(info.contact_profile_photo);
        const buffer = await response.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString("base64");

        const fileName =
          info.contact_profile_photo.split("/").pop() || "unknown.jpg";
        const updatedInformation: contactInfoTypes & {
          profileBlob: string | null;
          filename: string;
        } = {
          __v: info.__v,
          _id: info._id,
          contact_number: info.contact_number,
          contact_profile_photo: info.contact_profile_photo,
          email_address: info.email_address,
          first_name: info.first_name,
          last_name: info.last_name,
          user_id: info.user_id,
          profileBlob: base64Image,
          filename: fileName,
        };
        return updatedInformation;
      })
    );
    res.status(200).json({
      Result: true,
      contacts: updatedContactType,
    });
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
};


export const getMySharedContactInformation = async (
  req: Request,
  res: Response
) => {
  let connection = await MySqlConnectDb();
  const contactShareTo = parseInt(req.params.contactOwnerId);
  try {
    const getSharedContactQuery = `
        SELECT
          contactShares.id as contactSharesId,
          contactShares.contact_information_id,
          users.id as userId,
          users.first_name,
          users.last_name,
          users.email
        FROM
          contact_shares as contactShares
        INNER JOIN
          users as users
        ON 
          users.id = contactShares.contact_share_to
        WHERE contact_owner_id = ?;
    `;
    const [row] = await connection.execute<RowDataPacket[]>(
      getSharedContactQuery,
      [contactShareTo]
    );

    const userDetailsMap = new Map(
      row.map((r) => [r.contact_information_id, { contactSharesId: r.contactSharesId, userId: r.userId, first_name: r.first_name, last_name: r.last_name, email: r.email }])
    );
    const contactIds = row.map((r) => r.contact_information_id);

    const contactInformation = await phoneBook.find({
      _id: { $in: contactIds },
    });
    const updatedContactType: Array<
      contactInfoTypes & { profileBlob: string | null }
    > = await Promise.all(
      contactInformation.map(async (info: contactInfoTypes) => {
        if (!info.contact_profile_photo) {
          return { ...info, profileBlob: null };
        }

        const userDetails = userDetailsMap.get(info._id.toString()) || {
          userId: null,
          contactSharesId: null,
          first_name: "Unknown",
          last_name: "Unknown",
          email: "Unknown",
        };

        const response = await fetch(info.contact_profile_photo);
        const buffer = await response.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString("base64");

        const fileName =
          info.contact_profile_photo.split("/").pop() || "unknown.jpg";
        const updatedInformation: contactInfoTypes & {
          profileBlob: string | null;
          filename: string;
          contactSharesId: number;
          userShareToEmail: string;
          userShareToFirstName: string;
          userShareToLastName: string;
          userShareToUserId: number;
        } = {
          __v: info.__v,
          _id: info._id,
          contact_number: info.contact_number,
          contact_profile_photo: info.contact_profile_photo,
          email_address: info.email_address,
          first_name: info.first_name,
          last_name: info.last_name,
          user_id: info.user_id,
          profileBlob: base64Image,
          filename: fileName,
          userShareToEmail: userDetails.email,
          contactSharesId: userDetails.contactSharesId,
          userShareToFirstName: userDetails.first_name,
          userShareToLastName: userDetails.last_name,
          userShareToUserId: userDetails.userId,
        };
        return updatedInformation;
      })
    );
    res.status(200).json({
      Result: true,
      contacts: updatedContactType,
    });
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
};


export const deleteSharedContact = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await MySqlConnectDb();
    const { id } = req.body;
    const deleteUserQuery = `
        DELETE FROM contact_shares WHERE id = ?;
    `;
    await connection.execute(deleteUserQuery, [id]);
    res.status(200).json({ Result: true, Message: "Contact Share Deleted" });
  } catch (error) {
    res.json(error);
  } finally {
    if (connection) await connection.end();
  }
};