const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(`E:\\Personal Stylist App\\Public\\index.html`);
});

module.exports = router;
