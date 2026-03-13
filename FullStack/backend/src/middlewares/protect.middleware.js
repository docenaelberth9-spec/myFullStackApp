import jwt from 'jsonwebtoken'

export const protect = (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

        if(!token) {
            return res.status(401).json({ success: false , message: "Not Authorized" });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user ={ id: decoded.id }

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid token or Expired"
        })
    }
}