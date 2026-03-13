import dotevn from 'dotenv';
dotevn.config();
import { BrevoClient } from '@getbrevo/brevo';

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

const sender = {
    name: 'Score Board Team.',
    email: 'gamehu13@gmail.com'
}

export const verificationEmail = async (email, verificationToken) => {
    try {
        await brevo.transactionalEmails.sendTransacEmail({
            sender,
            subject: 'Verification Email',
            htmlContent: `<h2>This the OTP you need to verify your account</h2> 
                <h1>${verificationToken}</h1>
            `,
            to: [{ email }]
        })
    } catch (error) {
        console.error('Error sending VerificationOtp email', error)
        throw error;
    }
}

export const welcomeEmail = async (email, name) => {
    try {
        await brevo.transactionalEmails.sendTransacEmail({
            sender,
            subject: 'Welcome to Scoring App',
            htmlContent: ` <div style="font-family: Arial; text-align:center">
                <h2>Welcome ${name}</h2>
                <p>You can now use the App:</p>
                <p>Scoring App</p>
            </div>`,
            to: [{ email }]
        })
    } catch (error) {
        console.error('Error sending Welcome email',error);
        throw error;
    }
}

export const resetPasswordMail = async (email, resetPasswordToken) => {
    try {
        await brevo.transactionalEmails.sendTransacEmail({
            sender,
            subject: 'Request reset Password',
            htmlContent:` <div style="font-family: Arial; text-align:center">
                <h2>Password Reset Request</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${process.env.CLIENT_URL}/resetPassword/${resetPasswordToken}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>If you did not request this, please ignore this email.</p>
                <p>Scoring App</p>
            </div>`,
            to: [{ email }]
        })
    } catch (error) {
        console.error('Error sending Resetpassword email', error)
        throw error;
    }
}

export const resetPasswordSuccessMail = async (email, name) => {
    try {
        await brevo.transactionalEmails.sendTransacEmail({
            sender,
            subject: 'Reset Password Success',
            htmlContent:  `
            <div style="font-family: Arial; text-align:center">
                <h2>Password Reset Successful</h2>
                <p>Hello ${name} your password has been reset successfully.</p>
            </div>
            `,
            to: [{ email }],
        })
    } catch (error) {
        console.error('Error sending Reset Password Success', error);
        throw error;
    }
}