# Transaction System – Real-time Fund Transfer & Immutable Audit Log

A full-stack peer-to-peer money transfer system that supports real-time balance updates, atomic fund transfers, and a tamper-proof audit log. Built as part of Full Stack Assignment 2, this project focuses on security, consistency, and traceability in financial transactions.

##  Live Demo

- **Frontend:** https://len-den-club.vercel.app/
- **Backend API:** https://lendenclub-2.onrender.com/api

##  Project Highlights

### Secure Fund Transfers
- Atomic money transfers using PostgreSQL transactions
- Prevents partial updates and race conditions

### Immutable Audit Log
- Complete transaction history
- Tracks sender, receiver, amount, type, status, and timestamp
- Designed for financial traceability and compliance

### Authentication & Authorization
- JWT-based authentication
- Passwords securely hashed using bcryptjs

### Real-time UI Updates
- Balances and transaction history update immediately after transfers

### Responsive Dashboard
- Clean, modern UI using React + Tailwind CSS
- Works across desktop and mobile devices

##  Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express.js, Sequelize ORM |
| Database | PostgreSQL |
| Frontend | React 19, Vite, Tailwind CSS |
| Auth | JWT, bcryptjs |
| API Client | Axios |
| Deployment | Backend – Render, Frontend – Vercel |

##  Setup & Installation

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- Git

### Backend Setup

```bash
git clone https://github.com/Sharans23/LenDenClub.git
cd backend
npm install
```

#### Environment Variables
Create a `.env` file in `backend/`:

```env
DB_NAME=transaction_system
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key
PORT=5001
```

#### Database Initialization

```bash
createdb transaction_system
```

Tables are automatically created when the server starts.

#### Start Backend

```bash
npm run dev
```

### Frontend Setup

```bash
cd ../frontend
npm install
```

#### Environment Variables
Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5001/api
```

#### Start Frontend

```bash
npm run dev
```

Open: http://localhost:5173

##  Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  balance DECIMAL(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Transactions (Audit Log)

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id),
  receiver_id INTEGER REFERENCES users(id),
  amount DECIMAL(12, 2) NOT NULL,
  type VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'success',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##  API Documentation

### Authentication

#### Register
**POST** `/auth/register`

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Login
**POST** `/auth/login`

```json
{
  "username": "john_doe",
  "password": "securepassword123"
}
```

### Transactions

#### Transfer Funds
**POST** `/transaction/transfer`  
**Authorization:** `Bearer <JWT_TOKEN>`

```json
{
  "receiverId": 2,
  "amount": 100.50
}
```

#### Get Transaction History
**GET** `/transaction/transactions`

#### Get Current Balance
**GET** `/transaction/balance`

### User

#### Get Profile
**GET** `/user/profile`

#### Update Profile
**PUT** `/user/profile`

```json
{
  "email": "newemail@example.com",
  "fullName": "John Doe"
}
```

##  Frontend Features

### Pages
- Login / Register
- Dashboard
- Transfer Funds
- Transaction History
- Profile Settings

### Key Components
- **AuthContext** – Global auth state
- **ProtectedRoute** – Route guarding
- **TransferForm** – Input validation & submission
- **TransactionTable** – Sortable audit log
- **BalanceCard** – Real-time balance display

##  Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Sequelize ORM prevents SQL injection
- CORS configuration
- Server-side input validation
- Atomic database transactions for consistency
