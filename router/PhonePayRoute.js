const express = require("express");
const { newPayment, checkStatus, checkStat } = require("../controller/paymentController");
const router = express();

router.post("/payment", newPayment);
router.get("/status/:txnId/:name/:msg/:age/:customUrl", checkStatus);
router.get("/status/:txnId", checkStat);
router.get("/message", (req, res) => {
  const message = req.session.message || null; // Retrieve the message
  req.session.message = null; // Clear the message after reading
  res.json({ message });
});

module.exports = router;
