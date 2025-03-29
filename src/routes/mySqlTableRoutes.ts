import express from "express";

import {
  createUsersTable,
  createRoleTable,
  showAllTablesWithColumns,
  createContactSharesTable,
  alterUserTable,
  createStatusTable,
  getStatus,
  insertStatus,
  updateStatus,
  createAccountRequestTable,
  displayData,
} from "../controllers/mySqlTableController";

const router = express.Router();

router.get("/", displayData);
router.get("/createRoleTable", createRoleTable);
router.get("/createUsersTable", createUsersTable);
router.get("/createAccountRequestTable", createAccountRequestTable);
router.get("/createContactSharesTable", createContactSharesTable);
router.get("/createStatusTable", createStatusTable);
// router.get("/updateStatus", updateStatus);
router.get("/getStatus", getStatus);
// router.get("/alterUserTable", alterUserTable);

export default router;
