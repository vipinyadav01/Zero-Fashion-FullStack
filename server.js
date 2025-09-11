const express = require("express")
const cors = require("cors")
const path = require("path")
const mongoose = require("mongoose")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

// MongoDB Connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI)
      console.log("MongoDB Atlas connected successfully")
    } else {
      console.log("MongoDB URI not found. Please add MONGODB_URI to environment variables.")
    }
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

// Connect to database
connectDB()

// Routes
app.use("/api/products", require("./routes/products"))
app.use("/api/users", require("./routes/users"))
app.use("/api/orders", require("./routes/orders"))
app.use("/api/auth", require("./routes/auth"))

// Serve static files in production
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
