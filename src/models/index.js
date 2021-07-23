import Sequelize, {Op} from 'sequelize';

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    dialect: 'postgres',
    logging: true,
  }
);

const models = {
  Usuario: sequelize.import('./usuario'),
  Plan: sequelize.import('./plan'),
  Rol: sequelize.import('./rol'),
  Socio: sequelize.import('./socio'),
  UsuarioRol: sequelize.import('./usuarioRol'),
  Coach: sequelize.import('./coach'),
  PeriodoSocio: sequelize.import('./periodoSocio'),
  ConfiguracionClase: sequelize.import('./configuracionClase'),
  HorarioClase: sequelize.import('./horarioClase'),
  Clase: sequelize.import('./clase'),
  ClaseSocio: sequelize.import('./claseSocios'),
  Permiso: sequelize.import('./permiso'),
  RolPermiso: sequelize.import('./rolPermiso'),
  UsuarioPermiso: sequelize.import('./usuarioPermiso'),
  // DiaClase: sequelize.import('./diaClase'),
};

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

export { sequelize, Op };

export default models;