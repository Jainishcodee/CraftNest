
# CraftNest TypeScript Backend

This is the TypeScript backend server for the CraftNest application.

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MySQL database
- XAMPP (if you're using it for MySQL)

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure the database:
- Make sure your MySQL server is running
- Create a database called `craftnest`
- Update the `.env` file with your database credentials if needed

3. Build the TypeScript code:
```bash
npm run build
```

4. Seed the database with initial data:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

The server will be running on http://localhost:3001

## API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PATCH /api/products/:id/approve` - Approve/unapprove product
- `GET /api/products/vendor/:vendorId` - Get vendor products

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/customer/:customerId` - Get customer orders
- `GET /api/orders/vendor/:vendorId` - Get vendor orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create new review

## Integration with Frontend

To connect the React frontend with this backend:
1. Make sure this backend server is running
2. The frontend should use the API service functions in `src/services/api.ts` to communicate with the backend
