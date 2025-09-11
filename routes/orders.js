const express = require("express")
const router = express.Router()
const Order = require("../models/Order")
const Product = require("../models/Product")
const User = require("../models/User") // Import User model
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")

// Create new order
router.post("/", auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body

    // Validate products and calculate total
    let calculatedTotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await Product.findById(item.product)
      if (!product) {
        return res.status(400).json({ message: `Product ${item.product} not found` })
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` })
      }

      const itemTotal = product.price * item.quantity
      calculatedTotal += itemTotal

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      })

      // Update product stock
      product.stock -= item.quantity
      await product.save()
    }

    // Add shipping and tax
    const shippingCost = 9.99
    const tax = calculatedTotal * 0.08
    calculatedTotal += shippingCost + tax

    // Create order
    const order = new Order({
      user: req.user.userId,
      items: orderItems,
      totalAmount: calculatedTotal,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cash_on_delivery" ? "pending" : "completed",
    })

    await order.save()

    // Populate order details
    await order.populate("items.product", "name image")
    await order.populate("user", "name email")

    res.status(201).json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get user orders
router.get("/my-orders", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const orders = await Order.find({ user: req.user.userId })
      .populate("items.product", "name image")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Order.countDocuments({ user: req.user.userId })

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single order
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name image price")
      .populate("user", "name email")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.userId) {
      const user = await User.findById(req.user.userId)
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" })
      }
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get all orders (Admin only)
router.get("/", [auth, adminAuth], async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query

    const query = {}

    if (status && status !== "all") {
      query.status = status
    }

    if (search) {
      // Search in order ID or user email
      query.$or = [{ _id: { $regex: search, $options: "i" } }]
    }

    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("items.product", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Order.countDocuments(query)

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update order status (Admin only)
router.put("/:id/status", [auth, adminAuth], async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    order.status = status
    if (trackingNumber) order.trackingNumber = trackingNumber
    if (notes) order.notes = notes

    await order.save()

    await order.populate("user", "name email")
    await order.populate("items.product", "name")

    res.json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Cancel order
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" })
    }

    // Can only cancel pending or processing orders
    if (!["pending", "processing"].includes(order.status)) {
      return res.status(400).json({ message: "Cannot cancel this order" })
    }

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product)
      if (product) {
        product.stock += item.quantity
        await product.save()
      }
    }

    order.status = "cancelled"
    await order.save()

    res.json({ message: "Order cancelled successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get order statistics (Admin only)
router.get("/stats/overview", [auth, adminAuth], async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments()
    const pendingOrders = await Order.countDocuments({ status: "pending" })
    const completedOrders = await Order.countDocuments({ status: "delivered" })

    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ])

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          status: { $ne: "cancelled" },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ])

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
