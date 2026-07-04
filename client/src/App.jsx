import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Landing from "./pages/LandingLight"
import Register from "./pages/Register"
import Login from "./pages/Login"
import ForgotPassword from "./pages/ForgotPassword"
import Dashboard from "./pages/Dashboard"
import MyQR from "./pages/MyQR"
import Upload from "./pages/Upload"
import JobStatus from "./pages/JobStatus"

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-qr" element={<MyQR />} />
        <Route path="/shop/:shopSlug" element={<Upload />} />
        <Route path="/job/:jobId" element={<JobStatus />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
