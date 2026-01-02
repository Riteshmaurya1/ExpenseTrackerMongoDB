require("dotenv").config({ quiet: true });
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT;

const userRouter = require("./src/Routes/userRoutes");
const expenseRouter = require("./src/Routes/expenseRoutes");
const paymentRouter = require("./src/Routes/paymentRoutes");
const premiumRouter = require("./src/Routes/premiumFeatureRoutes");
const forgetPasswordRouter = require("./src/Routes/forgetPasswordRoutes");
const connectDB = require("./src/Config/db-connection");

// Associations for the user and expenses.
// User.hasMany(Expense);
// Expense.belongsTo(User);

// Associations for the user and ForgotPasswordRouter.
// User.hasMany(ForgotPasswordRequests);
// ForgotPasswordRequests.belongsTo(User);

// create log stream.
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

// Middleware for parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(compression());
app.use(
  morgan("combined", {
    stream: accessLogStream,
    skip: (req, res) => res.statusCode < 400,
  })
);

app.get("/", (req, res) => {
  res.send("Home Page");
});

// Custom routes.
app.use("/user", userRouter);
app.use("/api/tasks", expenseRouter);
app.use("/payment", paymentRouter);
app.use("/premium", premiumRouter);
app.use("/password", forgetPasswordRouter);

//
(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
})();
