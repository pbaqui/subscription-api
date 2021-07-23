import { Router } from 'express';
import requireAuth from '../middlewares/requireAuth';
import models, { Op, sequelize} from '../models';
import {createXDateTimeWithTime} from '../utils';
const router = Router();
const basePath = "/clase";
const LIMITE_RESERVA = "60";    //EN MINUTOS
const LIMITE_ELIMINAR_RESERVA = "30"; //EN MINUTOS

router.use(requireAuth);

//Obtener clase por id
router.get(basePath+"/:id", async (req, res) => {

  let id = req.params.id;

  if (!id) {
    return res.status(422).send({ error: 'Debe ingresar el id de la clase' });
  }

  const clase = await models.Clase.findOne({ where: { claseId: id},attributes:{ exclude: ['creacionFecha','modificacionFecha']},raw: true});
  const horarios = await models.HorarioClase.findAll({ where: { claseId: id}, attributes:{ exclude: ['creacionFecha','modificacionFecha']},raw: true,});
  configuracion.horarios = horarios;
  
  res.send(clase);
});

//Obtener todas las clases disponibles
router.get("/clase-disponible", async (req, res) => {
  const {user} = req;
  let clases;
  let reservas = [];
  let list = {};
  let clasesCoach;

  let roles = await models.Rol.findAll(
    { 
      raw: true,  
      include: [
        { 
          model: models.Usuario, as:'usuarios', where: {usuarioId: user.usuarioId}, attributes: ['usuarioId']
        }],
      attributes: ['rolId']
    });

  roles = roles.map(r => r.rolId)

  if (roles.includes(2)) { 
    if (!user){
      return res.status(422).send({ error: 'Debe indicar el usuario' });
    }

    const socio = await models.Socio.findOne(
      { 
        raw: true,  
        where: { usuarioId: user.usuarioId}
      });

    if (!socio){
      return res.status(422).send({ error: 'Socio no existe' });
    }
    list.planes = []
    for (const planId of socio.planes) {
      const plan = await models.Plan.findOne({ where: { planId: planId, estado: 'ACTIVO'}, attributes:['planId', 'nombre','clasesPorDia'],raw: true});

      if (plan) {
        let planIDs = new Array();
        planIDs.push(plan.planId);
        clases = await models.Clase.findAll(
          { 
            where: {
              estado: 'HABILITADO',
              fechaLimiteEliminarReserva: {
                [Op.gte]: sequelize.fn('NOW')
              },
              planes: { [Op.contains] : planIDs }
            },
            attributes:{ exclude: ['creacionFecha','modificacionFecha']},
            order: [['fechaInicio', 'ASC']],
          });
        if (clases){
          for (const clase of clases) {
            const reserva = await models.ClaseSocio.findOne(
              { 
                where: {
                  claseId: clase.claseId,
                  usuarioId: user.usuarioId,
                  estado: ["RESERVA","ESPERA"]
                },
                attributes:{ exclude: ['creacionFecha','modificacionFecha']},
            });

            if(reserva ){
              reservas.push({claseId: clase.claseId, estado: reserva.estado, planId: plan.planId})
            }
            clase.setDataValue('onlyCancelarReserva', new Date() > clase.fechaLimiteReserva);
          }
          plan.clases = clases;
        }
        list.planes.push(plan);  
      }
    }
    list.reservas = reservas;
  } 

  if (roles.includes(1)) { 
    clases = await models.Clase.findAll(
      { 
        where: {
          estado: 'HABILITADO',
          fechaFin: {
            [Op.gte]: sequelize.fn('NOW')    
          }
        },
        attributes:{ exclude: ['creacionFecha','modificacionFecha']},
        order: [['fechaInicio', 'ASC']],
      });
    list.clases = clases;
  }

  if (roles.includes(3)) { 
    clasesCoach = await models.Clase.findAll(
    { 
      where: {
        estado: 'HABILITADO',
        coachId: user.usuarioId,
        fechaInicio: {
          [Op.lte]: sequelize.fn('NOW')    
        },
        fechaFin: {
          [Op.gte]: sequelize.fn('NOW')    
        }
      },
      attributes:{ exclude: ['creacionFecha','modificacionFecha']},
      include: {
        model: models.ClaseSocio,
        required: false,
        where: {estado: ["RESERVA"]},
        attributes: ['usuarioId','prueba','presente'],
      }
    }).map(el => el.get({ plain: true }));

    if (clasesCoach){
      for (const clase of clasesCoach) {
        let socios = [];
        for (const socio of clase.clase_socios) {
          const usuario = await models.Usuario.findOne(
          { 
            where: {
              usuarioId: socio.usuarioId
            },
            attributes:  ['nombre','apellido'],
          });
          if(usuario ){
            socios.push({usuarioId: socio.usuarioId, nombre: usuario.nombre, apellido: usuario.apellido, prueba: socio.prueba, presente: socio.presente })
          } 
        }
        delete clase.clase_socios;
        clase.socios = socios;
      } 
      list.clasesCoach = clasesCoach[0] ? clasesCoach[0] : [];
    }
  }
  // console.log(list);
  res.send(list);
});

//Crear o actualizar clase
router.post(basePath + "/configurar", async (req, res) => {
  const { tipo } = req.body;

  const configurationDate = new Date();
  let sumDay = 0;
  if ( tipo === "tomorrow" || !tipo){
    sumDay = 1;
    configurationDate.setDate(new Date().getDate()+sumDay); 
  }
  const day = configurationDate.getDay();

  console.log("Creando las clases del dia: ", configurationDate);

  //Obtener todas las configuraciones
  const configuraciones = await models.ConfiguracionClase.findAll(
    { 
      where: { 
        estado: 'ACTIVO', 
        fechaInicio: {
          [Op.lte]: configurationDate    
        }, 
        fechaFin: {
          [Op.gte]: configurationDate
        }
      },
      attributes:{ exclude: ['creacionFecha','modificacionFecha']},
      include: [
        { 
          model : models.HorarioClase,  
          attributes:{ exclude: ['creacionFecha','modificacionFecha']},
          // where: { configuracionClaseId: id}
        }],
    }
  );
  console.log("Cantidad de configuraciones obtenidas: ", configuraciones.length);
  
  if (configuraciones) {
    for (const configuracion of configuraciones) {
      if (configuracion.dias[day]){
        for (const horarioClase of configuracion.horario_clases) {
          const fechaInicio = createXDateTimeWithTime(horarioClase.horaInicio, sumDay)
          const fechaFin = createXDateTimeWithTime(horarioClase.horaFin, sumDay)
          const fechaLimiteReserva = new Date(fechaInicio);
          const fechaLimiteEliminarReserva = new Date(fechaInicio);
          fechaLimiteReserva.setMinutes(fechaInicio.getMinutes() - LIMITE_RESERVA);
          fechaLimiteEliminarReserva.setMinutes(fechaInicio.getMinutes() - LIMITE_ELIMINAR_RESERVA);
        
          await models.Clase.create({
            nombre:configuracion.titulo,
            fechaInicio:fechaInicio,
            fechaFin:fechaFin,
            fechaLimiteReserva:fechaLimiteReserva,
            fechaLimiteEliminarReserva:fechaLimiteEliminarReserva,
            cantidadMaxSocios:configuracion.cantidadSocios,
            cantidadMaxSociosEspera:configuracion.cantidadSociosEspera,
            planes:configuracion.planes,
            coachId: horarioClase.coachId,
            asistenteId: horarioClase.asistenteId
          });
        }
      }
    }        
    res.send(true);
  } else {
    return res.status(422).send({ error: 'No existen configuraciones disponibles' });
  }
});

//Crear o actualizar coach
router.post("/clase-reserva", async (req, res) => {
  const {reservas, usuario} = req.body;
  let clases;
  let claseSocio;

  if (reservas && usuario) {
    clases = reservas.reservas.filter(function (item) {
      return (parseInt(item) == item);
    });
  
    for (const claseId of clases){
      try {
        //Obtener la clase para obtener los planes y si no se supera la cantidad de reservas.
        const clase = await models.Clase.findOne({ where: { claseId: claseId},attributes:{ exclude: ['creacionFecha','modificacionFecha']},raw: true});
        const periodoSocio = await models.PeriodoSocio.findOne({ where: { usuarioId: usuario, planId: { [Op.in] : clase.planes }, estado: 'ACTIVO'},attributes:{ exclude: ['creacionFecha','modificacionFecha']},raw: true});
        const plan = await models.Plan.findOne({ where: { planId: periodoSocio.planId },attributes:{ exclude: ['creacionFecha','modificacionFecha']},raw: true});
       
        // console.log("clase: ", clase);
        // console.log("periodoSocio: ", periodoSocio);
        // console.log("plan: ", plan);
        
        const fechaIni = new Date(clase.fechaInicio.toLocaleDateString());
        let fechaFin = new Date(fechaIni);
        fechaFin.setDate(fechaFin.getDate()+1)
        const claseCount = await models.Clase.findAll({ 
          where: { planes: { [Op.contains] : clase.planes }, estado: "HABILITADO", fechaInicio: {[Op.between]: [fechaIni, fechaFin]}},
          attributes:{ exclude: ['creacionFecha','modificacionFecha']},
          raw: true,
          include: [{ 
            model: models.ClaseSocio, where: {usuarioId: usuario, estado: 'RESERVA'}, attributes: ['usuarioId']
          }],
        });
        // console.log("claseCount: ", claseCount.length);

        //Verificar si alcanzo el limite de reservas del plan.
        //tengo el usuario y la clase a reservar
        if (claseCount.length < plan.clasesPorDia) {
          const result = await models.ClaseSocio.findOrCreate({where: {claseId:claseId, usuarioId: usuario}, defaults:{claseId:claseId, usuarioId: usuario, prueba: false}});
          // console.log("claseId: ", claseId);
          // console.log("usuario: ", usuario);
          if (result[1]){
            await models.Clase.increment('cantidadReservas', { by:1,  where: { claseId: claseId } });
            await models.PeriodoSocio.increment('cantidadClasesTomadas', { by:1,  where: { periodoId: periodoSocio.periodoId } });
          }
        } else {
          return res.status(422).send({ error: 'El usuario alcanzo el limite de reservas por dia del plan'});
        }       
      } catch (err) {
        console.log(err);
        return res.status(422).send({ error: 'Error al realizar la reserva'});
      }
    }
  } else {
    return res.status(422).send({ error: 'Debe enviar la clase y usuario para la reserva' });
  }
  return res.send(claseSocio);
});

//Crear o actualizar coach
router.post("/clase-cancelar-reserva", async (req, res) => {
  const {claseId, usuario} = req.body;

  if (claseId && usuario) {
    try {
      //Obtener la clase y el periodo socio para descontar la clase del dia.
      const clase = await models.Clase.findOne({ where: { claseId: claseId},attributes:{ exclude: ['creacionFecha','modificacionFecha']},raw: true});
      const periodoSocio = await models.PeriodoSocio.findOne({ where: { usuarioId: usuario, planId: { [Op.in] : clase.planes }, estado: 'ACTIVO'},attributes:{ exclude: ['creacionFecha','modificacionFecha']},raw: true});

      //Por ahora se elimina el usuario para no modificar el metodo de reservar clase.
      await models.ClaseSocio.destroy({where: {claseId:claseId, usuarioId: usuario}});
      
      //Se actualizan los contadores.
      await models.Clase.decrement('cantidadReservas', { by:1,  where: { claseId: claseId } });
      await models.PeriodoSocio.decrement('cantidadClasesTomadas', { by:1,  where: { periodoId: periodoSocio.periodoId } });
  
    } catch (err) {
      console.log(err);
      return res.status(422).send({ error: 'Error al cancelar la reserva'});
    }
  } else {
    return res.status(422).send({ error: 'Debe enviar la clase y usuario para la reserva' });
  }
  return res.send("OK");
});

//Marcas asistencia del socio
router.post("/clase-asistencia", async (req, res) => {
  const {asistencias, claseId} = req.body;

  console.log("asistencias:",asistencias);
  console.log("claseId:",claseId);

  let claseSocios;
  let socios;

  if (asistencias && claseId) {
    socios = asistencias.asistencias.filter(function (item) {
      return (parseInt(item) == item);
    });
    console.log(socios);
  
    try {
      claseSocios = await models.ClaseSocio.findAll({ where: { claseId: claseId }});
      for (const claseSocio of claseSocios ){
        console.log(claseSocio.usuarioId)
        if (socios.includes(claseSocio.usuarioId.toString())){
          console.log("presente");
          await models.ClaseSocio.update({ presente: true}, {where: {claseId:claseId, usuarioId: claseSocio.usuarioId}});
        }else {
          console.log("ausente");
          await models.ClaseSocio.update({ presente: false}, {where: {claseId:claseId, usuarioId: claseSocio.usuarioId}});
        }
      }

      //Aca se debe manejar si el usuario es de prueba     

    } catch (err) {
      console.log(err);
      res.status(422).send({ error: 'Error al marcas la asistencia'});
    }
  } else {
    return res.status(422).send({ error: 'Debe inidicar  la clase y las asistencias' });
  }
  return res.send(claseSocios);
});

//Crear o actualizar coach
router.post(basePath + "/state", async (req, res) => {
  const {claseId, estado} = req.body;

  if (claseId && estado) {
    try {
      //Ahora solo deshabilitar el rol del coach.
      //TODO deshabilitar el usuario si es el unico ROL.
      const configuracionClase =  await models.ConfiguracionClase.update({estado:estado},{ where: { claseId: claseId } });

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
