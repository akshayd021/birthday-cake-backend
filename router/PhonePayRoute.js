const express = require("express");
const { newPayment, checkStatus } = require("../controller/paymentController");
const router = express();

router.post("/payment", newPayment);
router.post("/status/:txnId", checkStatus);
router.get("/message", (req, res) => {
  const message = req.session.message || null; // Retrieve the message
  req.session.message = null; // Clear the message after reading
  res.json({ message });
});

module.exports = router;
