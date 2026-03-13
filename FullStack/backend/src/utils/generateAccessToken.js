import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';

export const generateToken = (res, userId) => {
    const token = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET, 
        { expiresIn: "15m" }
    );

    res.cookie("accessToken", token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
    })

    return token;
};