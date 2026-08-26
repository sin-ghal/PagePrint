import axios from "axios"

const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api/v1`,
  withCredentials: true,
})

export default API
