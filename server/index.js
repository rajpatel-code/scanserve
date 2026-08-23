require("dotenv").config();

const express = require("express");
const cors = require("cors");

const paymentRoutes = require("./routes/paymentRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(
  cors({
 origin: [
  "http://localhost:5173",
  "https://scanserve-hczb.onrender.com",
  "capacitor://localhost",
],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/payment", paymentRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Running",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});