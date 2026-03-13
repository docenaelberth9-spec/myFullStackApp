import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoute from './routes/auth.routes.js'
import morgan from 'morgan';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(morgan('dev'));

app.use('/api/app', authRoute)

export default app;