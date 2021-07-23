import { Router } from 'express';
import requireAuth from '../middlewares/requireAuth';
import models from '../models';
// import qs from 'query-string';

const router = Router();
const basePath = "/plan"

router.use(requireAuth);

//Obtener plan por id
router.get(basePath+"/:id", async (req, res) => {

  var id = req.params.id;

  if (!id) {
    return res.status(422).send({ error: 'Debe ingresar el id' });
  }
  
  const plan = await models.Plan.findOne({ where: { planId: id}});
  res.send(plan);
});

//Obtener todos los planes
router.get(basePath, async (req, res) => {
  const planes = await models.Plan.findAll();
  res.send(planes);
});

router.post(basePath, async (req, res) => {
  let plan;
  try {
    if (req.body.planId) {
      plan = await models.Plan.update(req.body, {where: { planId: req.body.planId}});
    } else {
      plan = new models.Plan(req.body);
      await plan.save();
    }
    res.send(plan);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

//actualizar estado
router.post(basePath + "/state", async (req, res) => {
  const {planId, estado} = req.body;

  if (planId && estado) {
    try {
      const plan = await models.Plan.update({estado:estado},{ where: { planId: planId} });

      res.send(plan);
    } catch (err) {
      console.log(err);
      res.status(422).send({ error: 'Error al actualizar el estado del plan'});
    }
  } else {
    return res.status(422).send({ error: 'Debe enviar el plan a modificar y el estado' });
  }
});

export default router;
