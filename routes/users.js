const express = require("express")
const router = express.Router()
const User = require("../models/User")
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")

// Get all users (Admin only)
router.get("/", [auth, adminAuth], async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query

    const query = {}

    if (role && role !== "all") {
      query.role = role
    }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Address Management Routes

// Get user addresses
router.get("/addresses", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    // Ensure addresses field exists
    if (!user.addresses) {
      user.addresses = []
      await user.save()
    }
    
    res.json(user.addresses || [])
  } catch (error) {
    console.error("Error getting addresses:", error)
    res.status(500).json({ message: error.message })
  }
})

// Add new address
router.post("/addresses", auth, async (req, res) => {
  try {
    const { label, street, city, state, zipCode, country, isDefault } = req.body

    const user = await User.findById(req.user.userId)
    
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    // Ensure addresses field exists
    if (!user.addresses) {
      user.addresses = []
    }
    
    // If this is set as default, unset all other defaults
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false)
    }

    const newAddress = {
      label,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || false,
    }

    user.addresses.push(newAddress)
    await user.save()

    res.status(201).json(newAddress)
  } catch (error) {
    console.error("Error adding address:", error)
    res.status(400).json({ message: error.message })
  }
})

// Update address
router.put("/addresses/:addressId", auth, async (req, res) => {
  try {
    const { label, street, city, state, zipCode, country, isDefault } = req.body
    const user = await User.findById(req.user.userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    // Ensure addresses field exists
    if (!user.addresses) {
      user.addresses = []
    }

    const address = user.addresses.id(req.params.addressId)
    if (!address) {
      return res.status(404).json({ message: "Address not found" })
    }

    // If this is set as default, unset all other defaults
    if (isDefault) {
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== req.params.addressId) {
          addr.isDefault = false
        }
      })
    }

    address.label = label
    address.street = street
    address.city = city
    address.state = state
    address.zipCode = zipCode
    address.country = country
    address.isDefault = isDefault || false

    await user.save()
    res.json(address)
  } catch (error) {
    console.error("Error updating address:", error)
    res.status(400).json({ message: error.message })
  }
})

// Delete address
router.delete("/addresses/:addressId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    // Ensure addresses field exists
    if (!user.addresses) {
      user.addresses = []
    }
    
    const address = user.addresses.id(req.params.addressId)
    if (!address) {
      return res.status(404).json({ message: "Address not found" })
    }

    address.remove()
    await user.save()
    
    res.json({ message: "Address deleted successfully" })
  } catch (error) {
    console.error("Error deleting address:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get single user
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if user is accessing their own profile or is admin
    if (user._id.toString() !== req.user.userId) {
      const currentUser = await User.findById(req.user.userId)
      if (currentUser.role !== "admin") {
        return res.status(403).json({ message: "Access denied" })
      }
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update user profile
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if user is updating their own profile or is admin
    if (user._id.toString() !== req.user.userId) {
      const currentUser = await User.findById(req.user.userId)
      if (currentUser.role !== "admin") {
        return res.status(403).json({ message: "Access denied" })
      }
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" })
      }
    }

    // Update user fields
    if (name) user.name = name
    if (email) user.email = email
    if (phone) user.phone = phone
    if (address) user.address = address

    await user.save()

    // Return user without password
    const updatedUser = await User.findById(user._id).select("-password")
    res.json(updatedUser)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update user role (Admin only)
router.put("/:id/role", [auth, adminAuth], async (req, res) => {
  try {
    const { role } = req.body

    if (!["customer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.role = role
    await user.save()

    const updatedUser = await User.findById(user._id).select("-password")
    res.json(updatedUser)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Toggle user active status (Admin only)
router.put("/:id/status", [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.isActive = !user.isActive
    await user.save()

    const updatedUser = await User.findById(user._id).select("-password")
    res.json(updatedUser)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete user (Admin only)
router.delete("/:id", [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({ message: "Cannot delete your own account" })
    }

    await User.findByIdAndDelete(req.params.id)
    res.json({ message: "User deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Change password
router.put("/:id/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if user is updating their own password or is admin
    if (user._id.toString() !== req.user.userId) {
      const currentUser = await User.findById(req.user.userId)
      if (currentUser.role !== "admin") {
        return res.status(403).json({ message: "Access denied" })
      }
    }

    // Verify current password (skip for admin)
    const requestingUser = await User.findById(req.user.userId)
    if (requestingUser.role !== "admin") {
      const isMatch = await user.comparePassword(currentPassword)
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" })
      }
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: "Password updated successfully" })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get user statistics (Admin only)
router.get("/stats/overview", [auth, adminAuth], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isActive: true })
    const adminUsers = await User.countDocuments({ role: "admin" })
    const customerUsers = await User.countDocuments({ role: "customer" })

    // Users registered this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thisMonth },
    })

    res.json({
      totalUsers,
      activeUsers,
      adminUsers,
      customerUsers,
      newUsersThisMonth,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
