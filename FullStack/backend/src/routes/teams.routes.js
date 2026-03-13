import express from 'express';
import { protect } from '../middlewares/protect.middleware.js';
import { createTeam, getTeam, updateTeam, deleteTeam } from '../controllers/teams.control.js';

const router = express.Router();

router.post('/create-team', protect, createTeam);

router.get('/get-teams', protect, getTeam);

router.patch('/update-team/:id', protect, updateTeam);

router.delete('/delete-team/:id', protect, deleteTeam);

export default router;