const Expense = require("../Model/expense");
const User = require("../Model/user");
const makeCategory = require("../Config/gemini-category");

// ===== ADD EXPENSE =====
const addExpense = async (req, res) => {
  try {
    const userId = req.payload.id;
    const { amount, description, category, note } = req.body;

    // Validation
    if (!amount || !description || !note) {
      return res.status(400).json({ message: "Provide all fields." });
    }

    // Auto-generate category if missing or empty
    let finalCategory =
      category && category.trim() ? category : await makeCategory(description);
    console.log("finalCategory:", finalCategory);

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Create expense
    const expense = await Expense.create({
      amount,
      description,
      category: finalCategory,
      userId,
      note,
    });

    // Update total expense for the user
    const totalExpense = (user.totalExpenses || 0) + parseFloat(amount);
    await User.findByIdAndUpdate(
      userId,
      { totalExpenses: totalExpense },
      { new: true }
    );

    res.status(201).json({
      data: expense,
      message: "Expense added successfully",
    });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({
      err: error.message,
      message: "Something went wrong",
    });
  }
};

// ===== UPDATE EXPENSE =====
const updateExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const userId = req.payload.id;
    const { amount, description, category, note } = req.body;

    // Validation
    if (!amount || !description || !note) {
      return res.status(400).json({ message: "Provide all fields." });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find the existing expense
    const existingExpense = await Expense.findOne({ _id: expenseId, userId });
    if (!existingExpense) {
      return res
        .status(404)
        .json({ message: "Expense not found or not authorized." });
    }

    // Calculate the difference in amount
    const amountDifference = parseFloat(amount) - existingExpense.amount;

    // Update the expense
    const updatedExpense = await Expense.findByIdAndUpdate(
      { _id: expenseId, userId },
      { amount, description, category, note },
      { new: true }
    );

    // Update total expenses for the user
    const updatedTotalExpenses = user.totalExpenses + amountDifference;
    await User.findByIdAndUpdate(
      userId,
      { totalExpenses: updatedTotalExpenses },
      { new: true }
    );

    res.status(200).json({
      data: updatedExpense,
      message: "Expense updated successfully",
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({
      err: error.message,
      message: "Something went wrong",
    });
  }
};

// ===== DELETE EXPENSE =====
const deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const userId = req.payload.id;

    // 1. Find expense to get the amount
    const expenseDeleted = await Expense.findOne({ _id: expenseId, userId });

    // 2. Check if expense exists
    if (!expenseDeleted) {
      return res.status(404).json({
        message: "Expense not found or not authorized",
      });
    }

    // 3. Extract amount
    const amountToSubtract = expenseDeleted.amount;

    // 4. Delete the expense
    await Expense.deleteOne({ _id: expenseId, userId });

    // 5. Find the user and update total expenses
    const user = await User.findById(userId);
    if (user) {
      const updatedTotal = user.totalExpenses - amountToSubtract;
      await User.findByIdAndUpdate(
        userId,
        { totalExpenses: updatedTotal },
        { new: true }
      );
    }

    res.status(200).json({
      message: "Expense deleted successfully and total amount updated",
      userId,
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ===== GET ALL EXPENSES (PAGINATED) =====
const allExpenses = async (req, res) => {
  try {
    const userId = req.payload.id;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Count total records
    const totalItems = await Expense.countDocuments({ userId });

    // Fetch limited data for current page
    const expenseList = await Expense.find({ userId })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate("userId", "username email");

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      totalItems,
      totalPages,
      currentPage: page,
      perPage: limit,
      hasPrevPage,
      hasNextPage,
      prevPage: hasPrevPage ? page - 1 : null,
      nextPage: hasNextPage ? page + 1 : null,
      expenses: expenseList,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

module.exports = {
  addExpense,
  deleteExpense,
  allExpenses,
  updateExpense,
};
