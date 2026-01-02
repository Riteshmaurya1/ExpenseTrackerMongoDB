const { createOrder, orderStatus } = require("../Services/cashfreeService");
const Payment = require("../Model/payment");
const User = require("../Model/user");

// ===== PROCESS PAYMENT =====
const processPayment = async (req, res) => {
  try {
    const orderAmount = 2000;
    const orderCurrency = "INR";

    // Extract from payload
    const { id, username, email } = req.payload;
    const { orderId } = req.body;

    // Create order and get payment sessionId
    const paymentSessionId = await createOrder(
      orderId,
      orderAmount,
      orderCurrency,
      String(id),
      username,
      email
    );

    // Check if sessionId exists
    if (!paymentSessionId) {
      console.error("Failed to create Cashfree order. Session ID missing.");
      return res.status(400).json({
        message: "Failed to create payment session",
      });
    }

    // Save payment details to the database
    await Payment.create({
      orderId,
      userId: id,
      paymentSessionId,
      orderAmount,
      orderCurrency,
      paymentStatus: "pending",
    });

    res.json({ paymentSessionId, orderId });
  } catch (error) {
    console.log("Error processing payment:", error.message);
    res.status(500).json({
      message: "Error processing payment",
    });
  }
};

// ===== GET PAYMENT STATUS =====
// const getPaymentStatus = async (req, res) => {
//   const { orderId } = req.params;
//   console.log("orderId:", orderId);
//   const userId = req.payload.id;

//   try {
//     // Step 1: Invoke OrderStatus function
//     let paymentStatus, paymentMessage, paymentAmount;
//     ({ paymentStatus, paymentMessage, paymentAmount } = await orderStatus(
//       orderId
//     ));

//     // Step 2: Update user isPremium if payment is successful
//     let user = await User.findById(userId);

//     if (paymentStatus === "SUCCESS") {
//       // Update isPremium status if transaction is successful
//       await User.findByIdAndUpdate(userId, { isPremium: 1 }, { new: true });
//       console.log("User updated with premium status");
//     }

//     // Align Order Status with payment status
//     let paymentOrderStatus;
//     if (paymentStatus === "SUCCESS") {
//       paymentOrderStatus = "Success";
//     } else if (paymentStatus === "PENDING") {
//       paymentOrderStatus = "Pending";
//     } else {
//       paymentOrderStatus = "Failed";
//       paymentMessage = "TRANSACTION FAILED.";
//     }

//     // Step 3: Update payment in DB
//     await Payment.findOneAndUpdate(
//       { orderId },
//       {
//         paymentStatus: paymentOrderStatus,
//         paymentMessage,
//         orderAmount: paymentAmount,
//       },
//       { new: true }
//     );

//     // Step 4: Respond to client
//     return res.status(200).json({
//       orderId,
//       paymentStatus,
//       message: paymentMessage,
//       amount: paymentAmount,
//       isPremium: user.isPremium,
//     });
//   } catch (error) {
//     if (error.response?.data?.code === "ORDER_NOT_FOUND") {
//       return res.status(404).json({
//         message: "Order not found in Cashfree",
//       });
//     }

//     console.error(
//       "Error fetching payment status:",
//       error.response?.data || error.message
//     );
//     res.status(500).json({
//       message: "Error fetching payment status",
//     });
//   }
// };

const getPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.payload.id;

    console.log(
      "Fetching payment status for orderId:",
      orderId,
      "userId:",
      userId
    );

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    // Step 1: Invoke OrderStatus function
    const { payment_status, payment_message, payment_amount } =
      await orderStatus(orderId);

    console.log("Payment status from Cashfree:", payment_status);

    // Step 2: Update user isPremium if payment is successful
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (payment_status === "SUCCESS") {
      await User.findByIdAndUpdate(userId, { isPremium: 1 }, { new: true });
      console.log("User updated with premium status");
    }

    // Step 3: Map payment status
    let paymentOrderStatus;
    let messageToSend = payment_message;

    if (payment_status === "SUCCESS") {
      paymentOrderStatus = "Success";
    } else if (payment_status === "PENDING") {
      paymentOrderStatus = "Pending";
    } else {
      paymentOrderStatus = "Failed";
      messageToSend = "TRANSACTION FAILED.";
    }

    // Step 4: Update payment in DB
    await Payment.findOneAndUpdate(
      { orderId },
      {
        paymentStatus: paymentOrderStatus,
        paymentMessage: messageToSend,
        orderAmount: payment_amount,
      },
      { new: true }
    );

    console.log("Payment record updated in DB");

    // Step 5: Respond to client
    return res.status(200).json({
      success: true,
      orderId,
      paymentStatus: payment_status,
      message: messageToSend,
      amount: payment_amount,
      isPremium: user.isPremium,
    });
  } catch (error) {
    console.error("Error fetching payment status:", error.message);

    // Handle specific Cashfree errors
    if (error.response?.data?.code === "ORDER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Order not found in Cashfree",
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching payment status",
    });
  }
};

module.exports = { getPaymentStatus };

module.exports = { processPayment, getPaymentStatus };
