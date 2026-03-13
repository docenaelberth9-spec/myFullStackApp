import mongoose from 'mongoose';

export const connectionDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DATABASE ONLINE');
    } catch (error) {
        console.error('DATABASE FAILED', error);
        process.exit(1);
    }
}