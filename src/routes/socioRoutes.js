import { Router } from 'express';
import requireAuth from '../middlewares/requireAuth';
import models, {sequelize} from '../models';
import {addMonths} from '../utils';

const router = Router();
const basePath = "/socio";
const ROL_ID = 2;

router.use(requireAuth);

//Obtener socio por id
router.get(basePath+"/:id", async (req, res) => {

  var id = req.params.id;

  if (!id) {
    return res.status(422).send({ error: 'Debe ingresar el id usuario' });
  }

  const socio = await models.Socio.findOne(
    { 
      raw: true,
      include: [
      { 
        model : models.Usuario,  
        where: { usuarioId: id}
      }],
    });

  console.log(socio)

  res.send(socio);
});

//Obtener todos los socios
router.get(basePath, async (req, res) => {
  const socios = await models.Socio.findAll(
    { 
      include: [
      { 
        model : models.Usuario,  
        attributes:{ exclude: ['password','creacionFecha','modificacionFecha'] },
        include: [{ model: models.Rol, as:'roles', where: {rolId: ROL_ID}, attributes:{ exclude: ['creacionFecha','modificacionFecha','nombre','descripcion'] }}] 
      }],
    });

  res.send(socios);
});

//Crear o actualizar socio
router.post(basePath, async (req, res) => {
  const data = req.body;

  console.log(data);
  
  let socio;
  let user;
  let planes
  if (data) {
    try {

      if(data.planes){
        planes = data.planes.filter(function (item) {
          return (parseInt(item) == item);
        });
        
        delete data.planes; 
      }

      if (data.usuarioId){
        user = await models.Usuario.findOne({ where: { usuarioId: data.usuarioId } });

        if (user) {
          await models.Usuario.update(data, {where: { usuarioId: data.usuarioId },individualHooks: true});
         
          socio = await models.Socio.findOne({ where: { usuarioId: data.usuarioId } });

          if (socio) {
            socio = await models.Socio.update({
              usuarioId: user.usuarioId,
              dato_laboral: data.datoLaboral,
              ruc: data.ruc,
              inspeccion: data.inspeccion,
              planes: planes
            },{where: { usuarioId: data.usuarioId }});
          }
        } else {
          res.status(422).send({ error: 'Usuario no existe'});
        }
      } else {
        user = await models.Usuario.create(data);
      }
      
      if (!socio){
        socio = await models.Socio.create({
          usuarioId: user.usuarioId,
          datoLaboral: data.datoLaboral,
          ruc: data.ruc,
          inspeccion: data.inspeccion,
          planes:planes
        });

        await models.UsuarioRol.create({
          usuarioId: user.usuarioId,
          rolId: ROL_ID,
          estado: 'ACTIVO'
        });
      }

      if (planes){
        let periodo;
        const today = new Date();
        const nextMonth = addMonths(new Date(), 1);
        
        for (const plan of planes) {
          periodo = await models.PeriodoSocio.findOne({ where: { usuarioId: user.usuarioId, planId: plan } });

          if (!periodo){
            await models.PeriodoSocio.create({
              usuarioId: user.usuarioId,
              planId: plan,
              inicioVigencia: today,
              finVigencia: nextMonth,
              estado: 'ACTIVO'
            });
          }
        }
      }

      res.send(socio);
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
