import { Router } from 'express';
import { protect } from '../middlewares/auth';
import {
  createAlert,
  getMyAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
  toggleAlert,
  getMatchesForAlert,
} from '../controllers/alert.controller';

const router = Router();

// Routes protégées - nécessitent authentification
router.use(protect);

router.post('/', createAlert);
router.get('/', getMyAlerts);
router.get('/:id', getAlertById);
router.get('/:id/matches', getMatchesForAlert);
router.put('/:id', updateAlert);
router.patch('/:id/toggle', toggleAlert);
router.delete('/:id', deleteAlert);

export default router;
