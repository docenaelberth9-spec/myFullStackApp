import express from 'express';
import { signUp, verifyEmail, forgotPassword, resetPassword,login, logout } from '../controllers/auth.control.js';

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/verify-email', verifyEmail);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.post('/login', login);
router.post('/logout', logout);

export default router;