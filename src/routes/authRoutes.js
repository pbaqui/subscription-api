import e, { Router } from 'express';
import jwt from 'jsonwebtoken';
import models from '../models';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    
    await req.context.models.Usuario.create(req.body);

    const token = jwt.sign({ userId: user._id }, 'MY_SECRET_KEY');
    res.send({ token });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post('/signin', async (req, res) => {

  if (!req.body.email || !req.body.password) {
    return res.status(422).send({ error: 'Must provide email and password' });
  }
  
  const user = await models.Usuario.findOne({ where: { email: req.body.email } });
  if (!user) {
    return res.status(422).send({ error: 'Invalid password or email' });
  }

  try {
    const ok = user.comparePassword(req.body.password);
    if (ok) { 
      const token = jwt.sign({ userId: user.usuarioId}, 'MY_SECRET_KEY');
      res.json({ token: token,  user: user.usuarioId});
    } else {
      return res.status(422).send({ error: 'Invalid password or email' });
    }
  } catch (err) {
    return res.status(422).send({ error: 'Invalid password or email' });
  }
});


router.post('/signinapp', async (req, res) => {

  if (!req.body.email || !req.body.password) {
    return res.status(422).send({ error: 'Must provide email and password' });
  }
  
  const user = await models.Usuario.findOne({ where: { email: req.body.email } });
  if (!user) {
    return res.status(422).send({ error: 'Invalid password or email' });
  }

  try {
    const ok = await models.Usuario.comparePassword(password);
    const token = jwt.sign({ userId: user.usuario_id}, 'MY_SECRET_KEY');
    res.json({ token: token,  user: user.usuario_id});
  } catch (err) {
    return res.status(422).send({ error: 'Invalid password or email' });
  }
});

export default router;