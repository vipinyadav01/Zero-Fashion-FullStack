const mongoose = require("mongoose");
const Product = require("../models/Product");
require("dotenv").config();

const products = [
  {
    name: "Classic White Cotton T-Shirt",
    description: "Premium quality cotton t-shirt, perfect for everyday wear. Breathable fabric and comfortable fit.",
    price: 499,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=60",
    stock: 50,
    featured: true,
    ratings: { average: 4.5, count: 120 }
  },
  {
    name: "Slim Fit Blue Jeans",
    description: "Stylish slim fit jeans made from durable denim. Features a modern cut and comfortable stretch.",
    price: 1299,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1542272617-08f086302542?auto=format&fit=crop&w=500&q=60",
    stock: 35,
    featured: true,
    ratings: { average: 4.2, count: 85 }
  },
  {
    name: "Floral Summer Dress",
    description: "Beautiful floral print dress, ideal for summer outings. Light and airy fabric.",
    price: 1599,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=500&q=60",
    stock: 20,
    featured: true,
    ratings: { average: 4.8, count: 200 }
  },
  {
    name: "Leather Biker Jacket",
    description: "Classic leather biker jacket with zipper details. Adds an edge to any outfit.",
    price: 4999,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1551028919-ac66c5f8b955?auto=format&fit=crop&w=500&q=60",
    stock: 10,
    featured: false,
    ratings: { average: 4.6, count: 45 }
  },
  {
    name: "Professional Running Shoes",
    description: "High-performance running shoes with cushioned soles for maximum comfort and support.",
    price: 2499,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=60",
    stock: 25,
    featured: true,
    ratings: { average: 4.7, count: 150 }
  },
  {
    name: "Non-Slip Yoga Mat",
    description: "Eco-friendly yoga mat with non-slip surface. Perfect for yoga, pilates, and floor exercises.",
    price: 899,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a9?auto=format&fit=crop&w=500&q=60",
    stock: 40,
    featured: false,
    ratings: { average: 4.3, count: 60 }
  },
  {
    name: "Adjustable Dumbbell Set",
    description: "Set of adjustable dumbbells for home workouts. Durable and easy to grip.",
    price: 1999,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=500&q=60",
    stock: 15,
    featured: false,
    ratings: { average: 4.5, count: 30 }
  },
  {
    name: "Wireless Noise-Cancelling Headphones",
    description: "Immersive sound quality with active noise cancellation. Long battery life.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=60",
    stock: 30,
    featured: true,
    ratings: { average: 4.6, count: 210 }
  },
  {
    name: "Smart Fitness Watch",
    description: "Track your health and fitness goals with this advanced smart watch. Water-resistant.",
    price: 3499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=60",
    stock: 20,
    featured: true,
    ratings: { average: 4.4, count: 95 }
  },
  {
    name: "Portable Bluetooth Speaker",
    description: "Compact speaker with powerful sound. Waterproof design for outdoor use.",
    price: 1499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=500&q=60",
    stock: 45,
    featured: false,
    ratings: { average: 4.2, count: 70 }
  },
  {
    name: "Hydrating Face Moisturizer",
    description: "Lightweight moisturizer for all skin types. Keeps skin hydrated and glowing.",
    price: 599,
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=500&q=60",
    stock: 60,
    featured: false,
    ratings: { average: 4.5, count: 110 }
  },
  {
    name: "Matte Red Lipstick",
    description: "Long-lasting matte lipstick in a stunning red shade. Smooth application.",
    price: 399,
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=500&q=60",
    stock: 80,
    featured: false,
    ratings: { average: 4.3, count: 130 }
  },
  {
    name: "Luxury Perfume",
    description: "Elegant fragrance with floral and woody notes. Long-lasting scent.",
    price: 1999,
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=500&q=60",
    stock: 25,
    featured: true,
    ratings: { average: 4.7, count: 90 }
  },
  {
    name: "Ceramic Plant Pot",
    description: "Minimalist ceramic pot for indoor plants. Adds a touch of greenery to your home.",
    price: 499,
    category: "Home & Garden",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=500&q=60",
    stock: 40,
    featured: false,
    ratings: { average: 4.6, count: 55 }
  },
  {
    name: "Modern Table Lamp",
    description: "Stylish table lamp with warm light. Perfect for reading or bedside use.",
    price: 1299,
    category: "Home & Garden",
    image: "https://images.unsplash.com/photo-1507473888900-52e1adad5420?auto=format&fit=crop&w=500&q=60",
    stock: 15,
    featured: false,
    ratings: { average: 4.4, count: 40 }
  },
  {
    name: "Decorative Throw Pillow",
    description: "Soft and stylish throw pillow to accent your sofa or bed.",
    price: 399,
    category: "Home & Garden",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?auto=format&fit=crop&w=500&q=60",
    stock: 50,
    featured: false,
    ratings: { average: 4.2, count: 65 }
  },
  {
    name: "Bestselling Fiction Novel",
    description: "A gripping story of love and adventure. A must-read for book lovers.",
    price: 299,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=60",
    stock: 100,
    featured: true,
    ratings: { average: 4.8, count: 300 }
  },
  {
    name: "Healthy Cooking Cookbook",
    description: "Delicious and healthy recipes for every meal. Easy to follow instructions.",
    price: 599,
    category: "Books",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=500&q=60",
    stock: 30,
    featured: false,
    ratings: { average: 4.5, count: 80 }
  },
  {
    name: "Denim Jacket",
    description: "Classic denim jacket, a wardrobe staple. Versatile and durable.",
    price: 2499,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=500&q=60",
    stock: 20,
    featured: false,
    ratings: { average: 4.4, count: 110 }
  },
  {
    name: "Casual Sneakers",
    description: "Comfortable sneakers for everyday wear. Stylish design.",
    price: 1999,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1560769629-975e13f0c470?auto=format&fit=crop&w=500&q=60",
    stock: 35,
    featured: true,
    ratings: { average: 4.3, count: 140 }
  },
  {
    name: "Aviator Sunglasses",
    description: "Classic aviator sunglasses with UV protection. Timeless style.",
    price: 999,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=60",
    stock: 60,
    featured: false,
    ratings: { average: 4.5, count: 90 }
  },
  {
    name: "RGB Gaming Mouse",
    description: "High-precision gaming mouse with customizable RGB lighting.",
    price: 1499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=500&q=60",
    stock: 25,
    featured: false,
    ratings: { average: 4.6, count: 180 }
  },
  {
    name: "Mechanical Keyboard",
    description: "Mechanical keyboard with tactile switches for typing and gaming.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b91add1?auto=format&fit=crop&w=500&q=60",
    stock: 15,
    featured: true,
    ratings: { average: 4.8, count: 120 }
  }
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/zero-fashion");
    console.log("Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert new products
    await Product.insertMany(products);
    console.log(`Successfully added ${products.length} products`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();
