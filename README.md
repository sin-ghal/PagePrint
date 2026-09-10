# 🖨️ PagePrint — QR-Based Print Management System

A full-stack web application that allows customers to submit print orders to a shop by scanning a QR code. Shopkeepers can manage incoming orders, set pricing, and track payments — all in real-time.

## 🌐 Live Demo

| Role | Link |
|------|------|
| 🏪 Shopkeeper (Dashboard) | [page-print.vercel.app](https://page-print.vercel.app) |
| 🛒 Customer (Upload Page) | [page-print.vercel.app/shop/agrawal-xerox-and-prints-ms7lva9q](https://page-print.vercel.app/shop/agrawal-xerox-and-prints-ms7lva9q) |

> **Note:** Backend is hosted on Render free tier — first load may take ~30s due to cold start.

## 📸 Screenshots

### 🏠 Landing Page
![Landing](./screenshots/landing.png)

### 📝 Register Page
![Register](./screenshots/register.png)

### 🏪 Shopkeeper Dashboard
![Dashboard](./screenshots/dashboard.png)

### 📱 My QR Code
![My QR](./screenshots/my-qr.png)

### 📤 Customer Upload Page
![Upload](./screenshots/upload.png)

### 📋 Print Status Page
![Print Status](./screenshots/jobStatus.png)

## ✨ Features

### 🏪 Shopkeeper Side
- QR code generation for shop
- Dashboard with real-time notifications (Socket.IO)
- Download uploaded files directly from dashboard
- Manage status: Pending → Ready → Completed
- Set price, mark as paid
- Track total orders, pending, and completed stats

### 🛒 Customer Side
- Scan shop QR code → Submit print order instantly (no login required)
- Per-file print options: copies, color/B&W, paper size, single/duplex, page range
- Real-time tracking via unique ID
- Files auto-deleted from cloud after collection for privacy

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), React 18, Tailwind CSS |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Real-time | Socket.IO |
| File Storage | Cloudinary |
| Auth | JWT, bcrypt, OTP via Email (Nodemailer) |
| Deployment | Vercel (frontend), Render (backend) |

## 🏗️ Architecture

```
Customer scans QR → Opens upload page → Submits print order
                                              ↓
                                    Backend processes order
                                              ↓
                              ┌───────────────┼───────────────┐
                              ↓               ↓               ↓
                      Upload to         Save order         Notify shopkeeper
                      Cloudinary        in MongoDB         via Socket.IO
                                              ↓
                              Shopkeeper manages from Dashboard
                              (set price, update status, download files)
```

## 📊 Database Optimization

- **`.lean()`** — Skips Mongoose document hydration, returns plain JS objects
- **`.select()`** — Fetches only required fields, reduces payload
- **Compound Index** — `{ shopkeeper: 1, createdAt: -1 }` on PrintOrder collection for fast dashboard queries
- Achieved **~74% faster** response times on 10,000+ records

## ⚡ API Endpoints

### Auth (`/api/v1/auth`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/signup` | Register shopkeeper |
| POST | `/send-otp` | Send OTP to email |
| POST | `/login` | Login shopkeeper |
| POST | `/reset-password` | Reset password with OTP |

### Customer (`/api/v1/customer`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/shop/:shopSlug` | Get shop details |
| POST | `/create/:shopSlug` | Upload files & create print order |
| GET | `/status/:id` | Track print status |
| PUT | `/collected/:id` | Mark as collected (triggers file cleanup) |

### Shopkeeper (`/api/v1/shopkeeper`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/my-jobs` | Get all print orders (auth required) |
| PUT | `/update-status/:id` | Update order status |
| PUT | `/set-price/:id` | Set price |
| PUT | `/mark-paid/:id` | Mark as paid |
| GET | `/my-qr` | Get shop QR code |

## 🚀 Run Locally

```bash
# Clone
git clone https://github.com/sin-ghal/PagePrint.git
cd PagePrint

# Install root dependencies (concurrently)
npm install

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install

# Run both (from root)
cd ..
npm run dev
```

- Frontend → http://localhost:3000
- Backend → http://localhost:4000

## 📁 Project Structure

```
PagePrint/
├── client/                  # Next.js Frontend (App Router)
│   ├── app/
│   │   ├── page.jsx              # Landing page
│   │   ├── login/page.jsx        # Shopkeeper login
│   │   ├── register/page.jsx     # Shopkeeper registration
│   │   ├── forgot-password/page.jsx
│   │   ├── dashboard/page.jsx    # Order management
│   │   ├── my-qr/page.jsx        # QR code download
│   │   ├── shop/[shopSlug]/page.jsx  # Customer upload
│   │   └── status/[jobId]/page.jsx   # Status tracking
│   ├── components/
│   └── services/api.js
├── server/                  # Express Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── config/
│   └── utils/
└── package.json             # Root (concurrently)
```

## 👨‍💻 About Me

**Anuj Singhal**

MCA Student • NIT Jamshedpur

Backend-focused Full Stack Developer

## 📄 License

ISC
