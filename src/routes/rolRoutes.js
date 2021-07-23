import { Router } from 'express';
import requireAuth from '../middlewares/requireAuth';

const router = Router();
const basePath = '/rol'

router.use(requireAuth);

router.get(basePath, async (req, res) => {
  const plans = await Plans.find({ userId: req.user._id });

  res.send(plans);
});

router.post(basePath, async (req, res) => {
  if (!req.body.nombre) {
    return res
      .status(422)
      .send({ error: 'Debe agregar un nombre unico al plan' });
  }

  try {
    const plan = new Plan(req.body);
    await plan.save();
    res.send(plan);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

export default router;
