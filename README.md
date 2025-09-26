# Store Rating Platform

A full-stack web application for rating and managing stores. Built with Node.js, Express, MySQL, React, and Tailwind CSS.

## Features

### For Normal Users (Customers)
- Browse all available stores
- Search stores by name or address
- Rate stores (1-5 stars) with optional comments
- View store ratings and reviews

### For Store Owners
- Create and manage their store profile
- View store statistics (average rating, total reviews)
- See all customer reviews and ratings
- Edit store information

### For Admins
- View system overview and statistics
- Manage all users, stores, and ratings
- Delete inappropriate content
- Monitor platform activity

## Tech Stack

**Backend:**
- Node.js with Express.js
- MySQL with Sequelize ORM
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- React 19 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- React Hook Form for form handling
- React Hot Toast for notifications

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL database
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure your database in `backend/.env`:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3001`

## Demo Accounts

The application includes demo accounts for testing:

**Admin Account:**
- Email: `admin@storerating.com`
- Password: `Admin123!`

**Store Owner Account:**
- Email: `jane.store.admin@example.com`
- Password: `Password123!`

**Normal User Account:**
- Email: `john.admin.created@example.com`
- Password: `Password123!`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/profile` - Get user profile

### Users (Admin only)
- `GET /api/users` - Get all users
- `DELETE /api/users/:id` - Delete user

### Stores
- `GET /api/stores` - Get all stores
- `POST /api/stores` - Create store (Store owners)
- `GET /api/stores/my/store` - Get my store (Store owners)
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store (Admin)

### Ratings
- `POST /api/ratings` - Submit rating
- `GET /api/ratings/store/:storeId` - Get store ratings
- `GET /api/ratings` - Get all ratings (Admin)
- `DELETE /api/ratings/:id` - Delete rating

## User Roles

1. **normal_user**: Can browse and rate stores
2. **store_owner**: Can manage their store and view ratings
3. **admin**: Full access to manage users, stores, and ratings

## Database Schema

### Users Table
- id, name, email, password, address, role, is_active

### Stores Table
- id, name, email, address, owner_id, average_rating, total_ratings, is_active

### Ratings Table
- id, user_id, store_id, rating (1-5), comment, timestamps

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev  # Uses Vite dev server with hot reload
```

### Building for Production
```bash
cd frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.