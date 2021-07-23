import { Router } from "express";
import requireAuth from "../middlewares/requireAuth";
import models, { Op } from "../models";
import { addMonths } from "../utils";

const router = Router();
const basePath = "/periodo-socio";
const ROL_ID = 2;

router.use(requireAuth);

//Obtener periodo por id
router.get(basePath + "/:id", async (req, res) => {
  var id = req.params.id;

  if (!id) {
    return res.status(422).send({ error: "Debe ingresar el id usuario" });
  }

  const periodo = await models.PeriodoSocio.findOne({
    raw: true,
    where: { periodoId: id },
    include: [
      {
        model: models.Usuario,
      },
    ],
  });

  console.log(periodo);

  res.send(periodo);
});

//Obtener todos los periodos
router.get(basePath, async (req, res) => {
  let queryWhereCI;
  let queryWhereEstados;

  if (req.query.ci) {
    queryWhereCI = {ci : req.query.ci};
  }
  
  if (req.query.estados) {
    req.query.estados = req.query.estados.map(estado => estado.toUpperCase());
    queryWhereEstados = {estado: req.query.estados};
  }


  const periodos = await models.PeriodoSocio.findAll({
    where: queryWhereEstados ? queryWhereEstados : {} ,
    include: [
      {
        where: queryWhereCI ? queryWhereCI : {} ,
        model: models.Usuario,
        attributes: ["nombre", "apellido", "ci"],
      },
      { model: models.Plan, attributes: ["nombre"] },
    ],
  });
  res.send(periodos);
});

//Crear o actualizar socio
router.post(basePath, async (req, res) => {
  const data = req.body;

  console.log("periodo save: ", data);
  let periodo;

  if (data) {
    try {
      if (data.periodoId) {
        periodo = await models.PeriodoSocio.findOne({
          where: { periodoId: data.periodoId },
        });

        if (periodo) {
          await models.PeriodoSocio.update(data, {
            where: { periodoId: data.periodoId }
          });
        } else {
          res.status(422).send({ error: "Periodo no existe" });
        }
      } else {
        periodo = await models.PeriodoSocio.create(data);
      }
      res.send(periodo);
    } catch (err) {
      console.log(err);
      res
        .status(422)
        .send({
          error: "Error al crear el periodo, verifique que el correo sea unico",
        });
    }
  } else {
    return res.status(422).send({ error: "Debe agregar datos" });
  }
});

//Editar el estado del periodo actual y/o crear nuevo periodo.
router.post(basePath + "/mantenimiento", async (req, res) => {
  const { periodoId, accion } = req.body;
  const today = new Date();

  let periodoSocio;

  if (periodoId && accion) {
    try {
      switch(accion) {
        case "CANCELAR":
          periodoSocio = await models.PeriodoSocio.update(
            { estado: "INACTIVO" },
            { where: { periodoId: periodoId }}
          );
          break;
        case "RENOVAR":
          
          let nextMonth;
          //Obtener el periodoSocio
          periodoSocio = await models.PeriodoSocio.findOne({
            where: { periodoId: periodoId },
            attributes:['periodoId','inicioVigencia', 'finVigencia', 'estado'],
            include: [
              {
                model: models.Usuario,
                attributes: ["usuarioId"],
              },
              { model: models.Plan, attributes: ["planId"] },
            ],
          });

          // Caso 1: la fecha de pago es <= fecha fin vigencia.
          if  (today <= periodoSocio.finVigencia){
            nextMonth = addMonths(periodoSocio.finVigencia, 1);
            await models.PeriodoSocio.create({
              usuarioId: periodoSocio.usuario.usuarioId,
              planId: periodoSocio.plan.planId,
              inicioVigencia: periodoSocio.finVigencia,
              finVigencia: nextMonth,
              estado: 'PAGADO'
            });
          } //Caso 2: la fecha de pago es > fecha fin vigencia.
          else {
            nextMonth = addMonths(new Date(), 1);
            await models.PeriodoSocio.create({
              usuarioId: periodoSocio.usuario.usuarioId,
              planId: periodoSocio.plan.planId,
              inicioVigencia: today,
              finVigencia: nextMonth,
              estado: 'ACTIVO'
            });
          }
          break;
      }
      res.send("Periodo actualizado exitosamente");
    } catch (err) {
      console.log(err);
      res
        .status(422)
        .send({ error: "Error al modificar el periodo" });
    }
  } else {
    return res
      .status(422)
      .send({ error: "Debe enviar el periodo a modificar y la accion" });
  }
});

//Crear o actualizar socio
router.post(basePath + "/verificar", async (req, res) => {
  const today = new Date();
  console.log("Verificando periodos de la fecha: ", today);

  try {
    const periodos = await models.PeriodoSocio.findAll({ where: { estado:  {[Op.in]: ['ACTIVO','VENCEHOY','PAGADO']}}, attributes:['periodoId','inicioVigencia', 'finVigencia', 'estado'],raw: true,});

    if (periodos) {
      for (const periodo of periodos) {
        let change;
        if(periodo.finVigencia > today){
          periodo.estado == "VENCIDO";
          change = true;
        } else if (periodo.estado == "ACTIVO" && periodo.finVigencia == today){
          periodo.estado == "VENCEHOY";
          change = true;
        } else if (periodo.estado == "PAGADO" && periodo.inicioVigencia > today){
          periodo.estado == "ACTIVO";
          change = true;
        } 
        if (change){
          await models.PeriodoSocio.update(periodo, {
            where: { periodoId: periodo.periodoId }
          });
        }
      }
    } else {
      res.status(422).send({ error: "No existen periodos a verificar" });
    }
    res.send("Se actualizaron " + periodos.length+ "periodos");
  } catch (err) {
    console.log(err);
    res.status(422).send({error: "Error al verificar los periodos"});
  }
});

export default router;
