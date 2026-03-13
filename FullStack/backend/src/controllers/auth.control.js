import User from "../models/User.js"
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateOtpCode } from "../utils/generateOtpCode.js";
import { generateToken } from "../utils/generateAccessToken.js";
import { verificationEmail, welcomeEmail, resetPasswordMail, resetPasswordSuccessMail } from '../utils/emails-brevo.js';

const acceptedEmail = (email) => {
    const emailRegix = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegix.test(email);
}

const hasSpecialChar = (password) => {
    const charPassword = /[!@#$%^&*(),.?":{}|<>]/;
    return charPassword.test(password)
}

const lowerCase = (password) => {
    const lowerPass = /[a-z]/;
    return lowerPass.test(password)
}

const upperCase = (password) => {
    const upperCase = /[A-Z]/;
    return upperCase.test(password)
}

export const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if(!name || !email || !password){
            return res.status(400).json({ message: 'all fields are required' });
        }
        
        if(!acceptedEmail(email)){
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if(!hasSpecialChar(password)){
            return res.status(400).json({ message: 'Password must contain Special Character  ' })
        }

        if(!lowerCase(password)) {
            return res.status(400).json({ message: 'Password must contain Lower Case'})
        }

        if(!upperCase(password)) {
            return res.status(400).json({ message: 'Password must contain Upper Case'})
        }

        if(password.length < 8) {
            return res.status(400).json({ message: 'Password must be 8 character or above'})
        }

        const existingUser = await User.findOne({ $or: [{ email }, { name }] }); // find existing user

        if(existingUser){ // find existing user
            return res.status(409).json({ message: 'user with this email or name is already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 12); // hashed the password
        const verificationToken = generateOtpCode(); // generates random otp code

        const user = new User({ // destructure
            name,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // 24hrs
        });

        await user.save(); // save

        generateToken(res, user._id);

        await verificationEmail(user.email, verificationToken);

        return res.status(200).json({
            success: true,
            message: 'New user has been created successfully',
            user:{
                ...user._doc,
                password: undefined,
                verificationToken: undefined,
                verificationTokenExpires: undefined
            }
        });

    } catch (error) {
        console.error('Singup Error', error)
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const verifyEmail = async (req, res) => {
    try {
        const { otp } = req.body; // body

        if(!otp) {
            return res.status(400).json({ message: 'OTP code is required' });
        }

        const user = await User.findOne({
            verificationToken: otp,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if(!user) {
            return res.status(400).json({ message: 'Invalid Otp or Expired' })
        }

        user.isVerified= true; // set to true
        user.verificationToken = undefined; // set to undefined
        user.verificationTokenExpires = undefined; // ''
        
        await user.save(); // save

        await welcomeEmail(user.email, user.name); // pass to welcome email utils

        res.status(200).json({
            success: true,
            message: `verified`,
            user: {
                ...user._doc,
                password: undefined
            }
        })

    } catch (error) {
        console.error('Verification Error', error);
        res.status(500).json({ success: false, message: error.message })
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if(!email) {
            return res.status(400).json({ message: 'Email required' });
        }

        const user = await User.findOne({ email })

        if(!user) {
            return res.status(404).json({ message: 'User does not exist' })
        }

        const resetToken = crypto.randomBytes(32).toString('hex'); // hased the reset token
        const hashedResetTOken = crypto.createHash('sha256').update(resetToken).digest('hex')

        const verificationTokenExpires = Date.now() + 60 * 60 * 1000;

        user.resetPasswordToken = hashedResetTOken;
        user.resetPasswordExpires = verificationTokenExpires;

        await user.save();

        await resetPasswordMail(user.email, resetToken);

        res.status(200).json({
            success: true,
            message: 'Password reset Link sent',
        })

    } catch (error) {
        console.error('Error reset password Link', error);
        res.status(500).json({ 
            success: false,
            message: error.message
         })
    }   
}

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if(!token){
            return res.status(400).json({ message: 'Token is required'});
        }

        if(!password) {
            return res.status(400).json({ message: 'Password is required' })
        }

        if(!hasSpecialChar(password)){
            return res.status(400).json({ message: 'Password must contain Special Character  ' })
        }

        if(!lowerCase(password)) {
            return res.status(400).json({ message: 'Password must contain Lower Case'})
        }

        if(!upperCase(password)) {
            return res.status(400).json({ message: 'Password must contain Upper Case'})
        }

        if(password.length < 8) {
            return res.status(400).json({ message: 'Password must be 8 character or above'})
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if(!user) {
            return res.status(400).json({ success: false, message: 'Invalid or Expired reset token' })
        }

        const isSamePassword = await bcrypt.compare(password, user.password);

        if(isSamePassword) {
            return res.status(400).json({ success: false , message: 'New password cannot be the same as the old password' })
        }

        user.password = await bcrypt.hash(password, 12);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        await resetPasswordSuccessMail(user.email, user.name)

        res.status(200).json({
            success: true,
            message: 'Password reset Successfully'
        })

    } catch (error) {
        console.error('Error reset password', error);
        res.status(500).json({ success: false, message: 'Error Password Reset' })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).json({ message: 'email and password is required' })
        }

        if(!acceptedEmail(email)) {
            return res.status(400).json({ message: 'Invalid Email format' })
        }

        const user = await User.findOne({ email }); // find email

        if(!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' })
        }

        const matchPassword = await bcrypt.compare(password, user.password); // compare the password

        if(!matchPassword) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' })
        }

        user.lastLogin = Date.now();

        await user.save();

        const token = generateToken(res, user._id);

        res.status(200).json({
            success: true,  
            message: 'Login success',
            token,
            user: {
                ...user._doc,
                password: undefined
            }   
        })

    } catch (error) {
        console.error('Login Error', error);
        res.status(500).json({ success: false , message: error.message })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('accessToken',{
            httpOnly: true,
            sameSite: 'strict'
        })

        res.status(200).json({ success: true, message: 'Logout Success'})
    } catch (error) {
        console.error('Error Logout', error);
        res.status(500).json({ success: false, message: 'Error Logout'})
    }
}