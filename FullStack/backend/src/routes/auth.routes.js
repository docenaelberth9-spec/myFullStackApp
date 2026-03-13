import express from 'express';
import { signUp, verifyEmail, forgotPassword, resetPassword,login, logout } from '../controllers/auth.control.js';
import { protect } from '../middlewares/protect.middleware.js';

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/verify-email', verifyEmail);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.post('/login', login);
router.post('/logout', logout);

router.get('/test-dashboard', protect, async (req, res) => { // test protected route
    res.status(200).json({ success: true ,message: 'test protected rotue Authrized' })
})
export default router;