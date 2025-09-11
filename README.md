# ShopHub - E-commerce Website

A comprehensive full-stack e-commerce website built with HTML, CSS, JavaScript, Node.js, Express.js, and MongoDB Atlas.

## Features

### Customer Features
- **Product Catalog**: Browse products with search, filtering, and pagination
- **Shopping Cart**: Add/remove items, quantity management
- **Secure Checkout**: Multi-step checkout process with multiple payment options
- **User Authentication**: Registration, login, and profile management
- **Order Management**: View order history, track orders, cancel orders
- **Address Management**: Save multiple shipping addresses
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Admin Features
- **Dashboard**: Overview of sales, orders, products, and users
- **Product Management**: Add, edit, delete, and manage product inventory
- **Order Management**: View, update order status, and track orders
- **User Management**: View and manage customer accounts
- **Analytics**: Sales reports and product performance metrics
- **Settings**: Store configuration and shipping settings

## Technology Stack

### Frontend
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox and Grid
- **JavaScript (ES6+)**: Interactive functionality and API integration
- **Font Awesome**: Icons and visual elements
- **Google Fonts**: Typography (Inter font family)

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: MongoDB object modeling
- **bcryptjs**: Password hashing and security
- **jsonwebtoken**: JWT authentication
- **cors**: Cross-origin resource sharing

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd ecommerce-website
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Configuration
Create a `.env` file in the root directory:
\`\`\`env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT Secret Key
JWT_SECRET=your_super_secret_jwt_key_here

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
\`\`\`

### 4. Database Setup
Seed the database with sample data:
\`\`\`bash
npm run seed
\`\`\`

Or create just an admin user:
\`\`\`bash
node scripts/createAdmin.js
\`\`\`

### 5. Start the Application
\`\`\`bash
# Development mode
npm run dev

# Production mode
npm start
\`\`\`

The application will be available at `http://localhost:5000`

## Project Structure

\`\`\`
ecommerce-website/
├── models/                 # MongoDB schemas
│   ├── User.js
│   ├── Product.js
│   └── Order.js
├── routes/                 # API routes
│   ├── auth.js
│   ├── products.js
│   ├── orders.js
│   └── users.js
├── middleware/             # Custom middleware
│   ├── auth.js
│   └── adminAuth.js
├── public/                 # Static files
│   ├── css/
│   │   ├── style.css
│   │   ├── admin.css
│   │   ├── checkout.css
│   │   └── profile.css
│   ├── js/
│   │   ├── app.js
│   │   ├── admin.js
│   │   ├── checkout.js
│   │   └── profile.js
│   ├── index.html
│   ├── admin.html
│   ├── checkout.html
│   └── profile.html
├── scripts/                # Database scripts
│   ├── seedData.js
│   └── createAdmin.js
├── server.js               # Main server file
├── package.json
└── README.md
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders` - Get all orders (Admin only)
- `PUT /api/orders/:id/status` - Update order status (Admin only)
- `PUT /api/orders/:id/cancel` - Cancel order

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user profile
- `PUT /api/users/:id/role` - Update user role (Admin only)
- `PUT /api/users/:id/status` - Toggle user status (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

## Default Login Credentials

### Admin Account
- **Email**: admin@shophub.com
- **Password**: admin123

### Customer Accounts
- **Email**: john@example.com
- **Password**: password123
- **Email**: jane@example.com
- **Password**: password123

## Features in Detail

### Security Features
- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control (Admin/Customer)
- Input validation and sanitization
- CORS protection

### Performance Optimizations
- Efficient database queries with pagination
- Image optimization with placeholder system
- Responsive design for all devices
- Lazy loading for better performance
- Optimized CSS and JavaScript

### User Experience
- Intuitive navigation and search
- Real-time cart updates
- Toast notifications for user feedback
- Loading states and error handling
- Mobile-first responsive design

## Deployment

### MongoDB Atlas Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get the connection string
4. Add it to your `.env` file

### Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the deployment prompts
4. Add environment variables in Vercel dashboard

### Environment Variables for Production
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `NODE_ENV`: Set to "production"

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Email: support@shophub.com

## Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- MongoDB Atlas for database hosting
- All contributors and testers
