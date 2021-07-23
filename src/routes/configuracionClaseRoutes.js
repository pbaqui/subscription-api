import { Router } from 'express';
import requireAuth from '../middlewares/requireAuth';
import models from '../models';
import {timeFromUIToDB} from '../utils'

const router = Router();
const basePath = "/configuracion-clase";

router.use(requireAuth);

//Obtener configuracion por id
router.get(basePath+"/:id", async (req, res) => {

  var id = req.params.id;

  if (!id) {
    return res.status(422).send({ error: 'Debe ingresar el id de la configuracion' });
  }
  const configuracion = await models.ConfiguracionClase.findOne({ where: { configuracionClaseId: id},attributes:{ exclude: ['creacionFecha','modificacionFecha']},raw: true});
  const horarios = await models.HorarioClase.findAll({ where: { configuracionClaseId: id}, attributes:{ exclude: ['creacionFecha','modificacionFecha']},raw: true,});
  configuracion.horarios = horarios;
  
  console.log(configuracion)

  res.send(configuracion);
});

//Obtener todos los configuraciones
router.get(basePath, async (req, res) => {

  const configuraciones = await models.ConfiguracionClase.findAll(
    { 
      where: req.query,
      attributes:{ exclude: ['creacionFecha','modificacionFecha']}
      // include: [
      // { 
      //   model : models.Usuario,  
      //   attributes:{ exclude: ['creacionFecha','modificacionFecha'] },
      //   include: [
      //     { model: models.Rol, as:'roles', where: {rol_id: ROL_ID}, attributes:{ exclude: ['password','creacionFecha','modificacionFecha','nombre','descripcion'] }}
      //   ] 
      // }],
    });

  res.send(configuraciones);
});

//Crear o actualizar coach
router.post(basePath, async (req, res) => {
  const data = req.body;
  console.log(data);
  
  let configuracion;
  if (data) {
    if(data.planes){
      data.planes = data.planes.filter(function (item) {
        return (parseInt(item) == item);
      });
    }

    try {
      if (data.configuracionClaseId){
        configuracion = await models.ConfiguracionClase.findOne({ where: { configuracionClaseId: data.configuracionClaseId } });

        if (configuracion) {
          await models.ConfiguracionClase.update(data, {where: { configuracionClaseId: data.configuracionClaseId }});

          await models.HorarioClase.destroy({ where: { configuracionClaseId: data.configuracionClaseId } });

        } else {
          res.status(422).send({ error: 'Usuario no existe'});
        }
      } else {
        configuracion = await models.ConfiguracionClase.create(data);
      }

      for (const horario of data.horarios) {
        await models.HorarioClase.create({
          configuracionClaseId: configuracion.configuracionClaseId,
          horaInicio: timeFromUIToDB(horario.horaInicio),
          horaFin: timeFromUIToDB(horario.horaFin),
          coachId: horario.coachId,
          asistenteId: horario.asistenteId,
        });
      }        

      res.send(configuracion);
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
  const {configuracionClaseId, estado} = req.body;

  if (configuracionClaseId && estado) {
    try {
      //Ahora solo deshabilitar el rol del coach.
      //TODO deshabilitar el usuario si es el unico ROL.
      const configuracionClase =  await models.ConfiguracionClase.update({estado:estado},{ where: { configuracionClaseId: configuracionClaseId } });

      res.send(configuracionClase);
    } catch (err) {
      console.log(err);
      res.status(422).send({ error: 'Error al actualizar el estado de la configuracion'});
    }
  } else {
    return res.status(422).send({ error: 'Debe enviar la identificacion de la configuración a modificar y el estado' });
  }
});

export default router;
