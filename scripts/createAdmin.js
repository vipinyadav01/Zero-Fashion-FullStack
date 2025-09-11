const mongoose = require("mongoose")
const User = require("../models/User")
require("dotenv").config()

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce")
    console.log("Connected to MongoDB")

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@shophub.com" })
    if (existingAdmin) {
      console.log("Admin user already exists!")
      process.exit(0)
    }

    // Create admin user
    const adminUser = new User({
      name: "Vipin Yadav",
      email: "vipin@admin.com",
      password: "vipin123",
      role: "admin",
      address: {
        street: "123 Admin Street, New York",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "US",
      },
      phone: "+91-9876543210",
    })

    await adminUser.save()
    console.log("Admin user created successfully!")
    console.log("Email: vipin@admin.com")
    console.log("Password: vipin123")

    process.exit(0)
  } catch (error) {
    console.error("Error creating admin user:", error)
    process.exit(1) // Exit with error code 1
  }
}

// Run the function
createAdmin()
