const express = require("express");
const expenseRoutes = express.Router();
const { jwtAuth } = require("../auth/jwt");
const {
  addExpense,
  deleteExpense,
  allExpenses,
  updateExpense
} = require("../Controller/expenseController");

expenseRoutes.post("/tasks/add", jwtAuth, addExpense);
expenseRoutes.put("/tasks/update/:id", jwtAuth, updateExpense);
expenseRoutes.delete("/tasks/delete/:id", jwtAuth, deleteExpense);
expenseRoutes.get("/tasks/all", jwtAuth, allExpenses);

module.exports = expenseRoutes;
