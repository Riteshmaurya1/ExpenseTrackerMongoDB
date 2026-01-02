const { Cashfree, CFEnvironment } = require("cashfree-pg");
require("dotenv").config();
const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  `${process.env.CASHFREE_FIRST_API}`,
  `${process.env.CASHFREE_SECOND_API}`
);

// Create Order
const createOrder = async (
  orderId,
  orderAmount,
  orderCurrency = "INR",
  customerID,
  customerEmail,
  customerName
) => {
  try {
    const customer_phone = "9685741230";
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000);
    const formattedExpiryDate = expiryDate.toISOString();

    const request = {
      order_amount: orderAmount,
      order_currency: orderCurrency,
      order_id: orderId,
      customer_details: {
        customer_id: customerID,
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone,
      },
      order_meta: {
        return_url: `${process.env.PAYMENT_SUCCESS_RETURN_URL}?orderId=${orderId}`,
        payment_methods: "cc,dc,upi",
      },
      order_expiry_time: formattedExpiryDate,
    };

    const response = await cashfree.PGCreateOrder(request);
    if (!response?.data?.payment_session_id) {
      throw new Error("No payment_session_id returned from Cashfree");
    }
    return response.data.payment_session_id;
  } catch (error) {
  }
};

// Check order status with userId
const orderStatus = async (orderId) => {
  try {
    // Step 1: Fetch order status from Cashfree
    const response = await cashfree.PGOrderFetchPayments(orderId);
    const payments = response?.data || [];

    if (!payments || payments.length === 0) {
      throw new Error("No payment records found in Cashfree");
    }

    // Step 2: Get the most recent payment
    const latestPayment = payments[0];
    const { payment_status, payment_message, payment_amount } = latestPayment;

    return {
      payment_status,
      payment_message,
      payment_amount,
    };
  } catch (error) {
    throw error;
    }
};

module.exports = { createOrder, orderStatus };
