import express from 'express';
import { 
  getProblems, 
  getProblemById, 
  createProblem, 
  updateProblem, 
  deleteProblem 
} from '../controllers/problemController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProblems);
router.get('/:id', getProblemById);

// Admin Routes
router.post('/', protect, authorize('admin'), createProblem);
router.put('/:id', protect, authorize('admin'), updateProblem);
router.delete('/:id', protect, authorize('admin'), deleteProblem);

export default router;
