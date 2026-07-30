# 🖨️ PagePrint — QR-Based Print Job Management System

A full-stack web application that allows customers to upload documents to a print shop by scanning a QR code. Shopkeepers can manage print jobs, set prices, and track payments in real-time.

## 🚀 Features

### Customer Side
- Scan shop QR code → Upload documents instantly (no login required)
- Per-file print options: copies, color/B&W, paper size, single/duplex, page range
- Real-time job tracking via Job ID
- Files auto-deleted from cloud after 30 minutes for privacy

### Shopkeeper Side
- Dashboard with real-time job notifications (Socket.IO)
- Manage job status: Pending → Ready → Completed
- Set price, mark as paid
- Download uploaded files
- QR code generation for shop

### Performance & Security
- MongoDB queries optimized with `.lean()` and compound indexing (~74% faster on 10K records)
- Selective field projection with `.select()` to minimize data transfer
- OTP-based email verification for shopkeeper registration
- JWT authentication with Bearer tokens
- Auto file cleanup from Cloudinary after printing

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Real-time | Socket.IO |
| File Storage | Cloudinary |
| Auth | JWT, bcrypt, OTP (Nodemailer) |
| Deployment | Vercel (frontend), Render (backend) |

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/          # Dashboard, Upload, Login, Register, etc.
│   │   ├── components/     # Reusable components
│   │   └── services/       # Axios API instance
│   └── .env                # VITE_BACKEND_URL
│
├── server/                 # Express backend
│   ├── config/             # DB, Cloudinary, Socket.IO setup
│   ├── controllers/        # Auth, Customer, Shopkeeper logic
│   ├── middlewares/        # JWT auth, Multer file upload
│   ├── models/             # Mongoose schemas (Shopkeeper, PrintJob, OTP)
│   ├── routes/             # API route definitions
│   ├── utils/              # QR generation, Mail sender
│   └── .env                # MongoDB URL, JWT secret, Cloudinary keys
│
└── README.md
```

## ⚡ API Endpoints

### Auth (`/api/v1/auth`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/register` | Register shopkeeper |
| POST | `/send-otp` | Send OTP to email |
| POST | `/login` | Login shopkeeper |

### Customer (`/api/v1/customer`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/shop/:shopSlug` | Get shop details |
| POST | `/create/:shopSlug` | Upload files & create job |
| GET | `/status/:jobId` | Track job status |

### Shopkeeper (`/api/v1/shopkeeper`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/my-jobs` | Get all jobs (auth required) |
| PUT | `/update-status/:jobId` | Update job status |
| PUT | `/set-price/:jobId` | Set job price |
| PUT | `/mark-paid/:jobId` | Mark job as paid |
| GET | `/my-qr` | Get shop QR code |

## 🏗️ Setup & Run Locally

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account

### Backend
```bash
cd server
npm install
# Create .env with required variables (see .env.example)
npm run dev
```

### Frontend
```bash
cd client
npm install
# Set VITE_BACKEND_URL in .env
npm run dev
```

### Environment Variables

**Server `.env`:**
```
MONGODBURL=mongodb://localhost:27017/pageprint
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
CLOUD_NAME=your_cloud_name
API_KEY=your_cloudinary_key
API_SECRET=your_cloudinary_secret
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email
MAIL_PASS=your_app_password
```

**Client `.env`:**
```
VITE_BACKEND_URL=http://localhost:4000
```

## 📊 Database Optimization

- **`.lean()`** — Skips Mongoose document hydration, returns plain JS objects
- **`.select()`** — Fetches only required fields, reduces payload
- **Compound Index** — `{ shopkeeper: 1, createdAt: -1 }` on PrintJob collection for fast dashboard queries
- Achieved **~74% faster** response times on 10,000+ records

## 👤 Author

**Anuj Singhal**

## 📄 License

ISC
