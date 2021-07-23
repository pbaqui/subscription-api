import { Router } from 'express';
import requireAuth from '../middlewares/requireAuth';
import models, {sequelize} from '../models';

const router = Router();
const basePath = "/coach";
const ROL_ID = 3;

router.use(requireAuth);

//Obtener coach por id
router.get(basePath+"/:id", async (req, res) => {

  var id = req.params.id;

  if (!id) {
    return res.status(422).send({ error: 'Debe ingresar el id usuario' });
  }

  const coach = await models.Coach.findOne(
    { 
      include: [
      { 
        model : models.Usuario,  
        where: { usuarioId: id}
      }],
    });

  res.send(coach);
});

//Obtener todos los coaches
router.get(basePath, async (req, res) => {
  console.log(req.query)
  const coaches = await models.Coach.findAll(
    { 
      where: req.query,
      include: [
      { 
        model : models.Usuario,  
        attributes:{ exclude: ['password','creacionFecha','modificacionFecha'] },
        include: [
          { model: models.Rol, as:'roles', where: {rolId: ROL_ID}, attributes:{ exclude: ['password','creacionFecha','modificacionFecha','nombre','descripcion'] }}
        ] 
      }],
    });

  res.send(coaches);
});

//Obtener todos los coaches
router.get("/coach-list", async(req, res) => {
  console.log(req.query)
  console.log(req.query.tipo)

  const coaches = await sequelize.query("SELECT coach.usuario_id, usuario.nombre || ' ' || usuario.apellido AS nombre "
  + "FROM coach AS coach LEFT OUTER JOIN usuario AS usuario ON coach.usuario_id = usuario.usuario_id "
  + "INNER JOIN usuario_rol ON usuario_rol.usuario_id = usuario.usuario_id "
  // + "WHERE coach.tipo = (:tipo) AND usuario_rol.rolId = 3 AND usuario_rol.estado = 'ACTIVO'", {
    + "WHERE coach.tipo = 'titular' AND usuario_rol.rol_id = 3 AND usuario_rol.estado = 'ACTIVO'", {
    replacements: {tipo: req.query.tipo},
    type: sequelize.QueryTypes.SELECT,
    raw:true
  });

  console.log(coaches);

  res.send(coaches);
});

//Crear o actualizar coach
router.post(basePath, async (req, res) => {
  const data = req.body;
  console.log(data);
  
  let coach;
  let user;
  if (data) {
    try {
      if (data.usuarioId){
        user = await models.Usuario.findOne({ where: { usuarioId: data.usuarioId } });

        if (user) {
          await models.Usuario.update(data, {where: { usuarioId: data.usuarioId },individualHooks: true});

          coach = await models.Coach.findOne({ where: { usuarioId: data.usuarioId } });

          if (coach) {
            coach = await models.Coach.update({
              usuarioId: user.usuarioId,
              tipo: data.tipo,
            },{where: { usuarioId: data.usuarioId }});
          }
        } else {
          res.status(422).send({ error: 'Usuario no existe'});
        }
      } else {
        user = await models.Usuario.create(data);
      }
      
      if (!coach){
        coach = await models.Coach.create({
          usuarioId: user.usuarioId,
          tipo: data.tipo,
        });

        await models.UsuarioRol.create({
          usuarioId: user.usuarioId,
          rolId: ROL_ID,
          estado: 'ACTIVO'
        });
      }

      res.send(coach);
    } catch (err) {
      console.log(err);
      res.status(422).send({ error: 'Error al crear el usuario, verifique que el correo sea unico'});
    }
  } else {
    return res.status(422).send({ error: 'Debe agregar datos' });
  }
});

//Crear o actualizar coach
router.post(basePath + "/state", async (req, res) => {
  const {usuarioId, estado} = req.body;

  if (usuarioId && estado) {
    try {
      //Ahora solo deshabilitar el rol del coach.
      //TODO deshabilitar el usuario si es el unico ROL.
      const usuarioRol =  await models.UsuarioRol.update({estado:estado},{ where: { usuarioId: usuarioId, rolId: ROL_ID } });

      res.send(usuarioRol);
    } catch (err) {
      console.log(err);
      res.status(422).send({ error: 'Error al actualizar el estado del usuario'});
    }
  } else {
    return res.status(422).send({ error: 'Debe enviar el usuario a modificar y el estado' });
  }
});

export default router;
