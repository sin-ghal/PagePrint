import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export interface AuthRequest extends Request {
  user?: {
    id: string
  }
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token =
      req.cookies?.token ||
      req.body?.token ||
      req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      })
    }

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string
      }
      req.user = decode
    } catch (e) {
      console.error(e)
      return res.status(401).json({
        success: false,
        message: "Token invalid",
      })
    }

    next()
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      success: false,
      message: "Something went wrong while validating the token",
    })
  }
}
