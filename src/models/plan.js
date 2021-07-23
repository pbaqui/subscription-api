const plan = (sequelize, DataTypes) => {
  const Plan = sequelize.define("plan", {
    planId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    nombre: {
      type: DataTypes.STRING,
      unique: true, 
      allowNull: false
    },
    cantidadClases: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    clasesPorDia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    costo: {
      type: DataTypes.STRING,
      unique: false,
      allowNull: true
    },
    tipo: {
      type: DataTypes.STRING,
      unique: false,
      allowNull: false,
      defaultValue: "MENSUAL"
    },
    estado: {
      type: DataTypes.STRING, 
      allowNull: false
    }
  }, {
    timestamps: true,
    createdAt: 'creacionFecha',
    updatedAt: 'modificacionFecha',
    freezeTableName: true,
    underscored: true
  });

  Plan.associate = (models) => {
    Plan.belongsToMany(models.Socio, {
      through: {model: models.PeriodoSocio, unique: false},
      as: "socios",
      foreignKey: "planId"
    })
  }
  
  return Plan;
};
 
export default plan;
