import dotenv from 'dotenv';
dotenv.config();
import { connectionDB } from './configs/db.js';
import './configs/dns.js'
import app from './app.js';

const PORT = process.env.PORT || 3223;

connectionDB().then(()=>{
    app.listen(PORT, ()=>{
        console.log(`SERVER IS ONLINE AT ${PORT}`);
    });
}).catch((error)=>{
    console.error('SERVER FAILED', error)
})
