import express from 'express';
import {
  getUsers,
  getUserById,
  getByUserId,
  saveUserProfile,
  createUser,
  getDashboardStats
} from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/getById/:user_id', getUserById);
router.get('/getByUserId/:user_id', getByUserId);
router.get('/dashboard', getDashboardStats);
router.post('/create', createUser);
router.post('/saveProfile/:user_id', saveUserProfile);

export default router;
