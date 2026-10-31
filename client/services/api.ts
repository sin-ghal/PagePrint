import axios from "axios"

const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api/v1`,
  withCredentials: true,
})

// Auto-handle 401 Unauthorized (Expired / Invalid Token)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        if (window.location.pathname !== "/login") {
          window.location.href = "/login?expired=true"
        }
      }
    }
    return Promise.reject(error)
  }
)

export default API
