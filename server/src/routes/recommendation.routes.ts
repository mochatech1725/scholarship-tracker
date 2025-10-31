import express from 'express';
import {
  getByApplicationId,
  create,
  update,
  deleteRecommendation
} from '../controllers/recommendation.controller.js';

const router = express.Router();

router.get('/application/:application_id', getByApplicationId);
router.post('/create', create);
router.post('/update/:recommendation_id', update);
router.delete('/delete/:recommendation_id', deleteRecommendation);

export default router;

