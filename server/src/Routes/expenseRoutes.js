const express = require("express");
const expenseRoutes = express.Router();
const { jwtAuth } = require("../Auth/jwt");
const {
  addExpense,
  getSingleExpense,
  updateExpense,
  deleteExpense,
  allExpenses,
} = require("../Controller/expenseController");

// Public health check
expenseRoutes.get("/", (req, res) => res.json({ message: "Expense API" }));

// Protected routes
expenseRoutes.post("/add", jwtAuth, addExpense); // POST /tasks/add
expenseRoutes.get("/:id", jwtAuth, getSingleExpense); // GET /tasks/2
expenseRoutes.put("/update/:id", jwtAuth, updateExpense); // PUT /tasks/update/2
expenseRoutes.delete("/delete/:id", jwtAuth, deleteExpense); // DELETE /tasks/delete/7
expenseRoutes.get("/all", jwtAuth, allExpenses); // GET /tasks/all with pagination

module.exports = expenseRoutes;
