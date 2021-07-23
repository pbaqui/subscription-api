import { Router } from 'express';
import requireAuth from '../middlewares/requireAuth';
import models from '../models';

const router = Router();
const basePath = "/usuario"

router.use(requireAuth);

//Obtener socio por id
router.get(basePath+"/:id", async (req, res) => {

  var id = req.params.id;

  if (!id) {
    return res.status(422).send({ error: 'Debe ingresar el id usuario' });
  }

  const socio = await models.Socio.findOne(
    { 
      include: [
      { 
        model : models.Usuario,  
        where: { usuarioId: id}
      }],
    });

  res.send(socio);
});

//Obtener todos los usuarios
router.get(basePath + "-data", async (req, res) => {
  const user = await models.Usuario.findOne(
    { 
      where: { usuarioId: req.user.usuarioId, estado: 'ACTIVO'},
      attributes:['usuarioId', 'nombre','apellido', 'verificado'],
      include:  [
        { model: models.Rol, as:'roles', attributes:['rolId']},
        { model: models.Permiso, as:'permisos', attributes:['permisoId']}]
    });
  
  const usuario = {
    id : user.usuarioId,
    presentacion : user.nombre + " " + user.apellido,
    verificado : user.verificado,
    roles : user.roles.map(r => r.rolId),
    permisos : user.permisos.map(r => r.permisoId)
  }
  
  res.send(usuario);
});

//Obtener el usuario disponible para reserva
router.post(basePath + "-disponible", async (req, res) => {
  const { ci, reservas} = req.body;
  let clases;
  let socio;

  if (reservas && ci) {
    //buscar usuario
    socio = await models.Socio.findOne(
    { 
      raw: true, 
      attributes: ["usuarioId","planes"],
      include: [
      { 
        model : models.Usuario,  
        where: { ci: ci, estado: 'ACTIVO'},
        attributes: ["nombre", "apellido"],
      }],
    });

    if (socio) {
      const usuarioRol = await models.UsuarioRol.findOne(
        { 
          raw: true, 
          attributes: ["usuarioId","estado"],
          where: { usuarioId: socio.usuarioId, estado: 'ACTIVO'},
        });
      if(!usuarioRol){
        return res.send({ type: "warning", data: "El socio no esta ACTIVO"})
      }

      clases = reservas.reservas.filter(function (item) {
        return (parseInt(item) == item);
      });
      
      //Controlar que no este inscripto en esa clase
      for (const clase of clases){
 
        const claseSocio = await models.ClaseSocio.findOne({
          where: {claseId:clase, usuarioId: socio.usuarioId}
        });

        if (claseSocio){
          return res.send({ type: "warning", data: "El socio ya se encuentra registrado en la clase"})
        }
      }
    } else {
      return res.send({ type: "warning", data: "El socio no existe"})
    }
  } else {
    return res.send({ type: "warning", data: 'Debe enviar el socio y la clase a reservar' });
  }
  return res.send({ type: "success", data: `Socio elegido ${socio['usuario.nombre']} ${socio['usuario.apellido']}`, usuario: socio.usuarioId});
});


//Obtener todos los usuarios
router.get(basePath, async (req, res) => {
  const usuario = await models.Usuario.findAll();

  res.send(usuario);
});

//Crear o actualizar socio
router.post(basePath, async (req, res) => {
  const data = req.body;
  
  let user;
  if (data) {
    try {
      if (data.usuarioId){
        user = await models.Usuario.findOne({ where: { usuarioId: data.usuarioId } });

        if (user) {
          await models.Usuario.update(data, {where: { usuarioId: data.usuarioId },individualHooks: true});
        } else {
          res.status(422).send({ error: 'Usuario no existe'});
        }
      } else {
        user = await models.Usuario.create(data);

        await models.UsuarioRol.create({
          usuarioId: user.usuarioId,
          rolId: 1,
          estado: 'ACTIVO'
        });
      }
      res.send(user);
    } catch (err) {
      console.log(err);
      res.status(422).send({ error: 'Error al crear el usuario, verifique que el correo sea unico'});
    }
  } else {
    return res.status(422).send({ error: 'Debe agregar datos' });
  }
});

//Crear o actualizar socio
router.post(basePath + "/state", async (req, res) => {
  const {usuarioId, estado} = req.body;

  if (usuarioId && estado) {
    try {
      //Ahora solo deshabilitar el rol del socio.
      //TODO deshabilitar el usuario si es el unico ROL.
      const usuarioRol =  await models.UsuarioRol.update({estado:estado},{ where: { usuarioId: usuarioId, rolId: 2 } });

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
