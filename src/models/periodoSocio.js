const periodoSocio = (sequelize, DataTypes) => {
  const PeriodoSocio = sequelize.define("periodo_socio", {
    periodoId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    inicioVigencia: {
      type: DataTypes.DATEONLY,
      allowNull:false
    },
    finVigencia: {
      type: DataTypes.DATEONLY,
      allowNull:false
    },
    cantidadClasesTomadas: {
      type: DataTypes.INTEGER,
      allowNull:true,
      defaultValue: 0
    },
    cantidadClasesDia: {
      type: DataTypes.INTEGER,
      allowNull:true,
      defaultValue: 0
    },
    fechaClasesDia: {
      type: DataTypes.DATEONLY,
      allowNull:true
    },
    estado: {
      type: DataTypes.STRING, 
      allowNull:false,
      defaultValue: 'ACTIVO'
    },
    pagado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    timestamps: true,
    createdAt: 'creacionFecha',
    updatedAt: 'modificacionFecha',
    freezeTableName: true,
    underscored: true
  });

  PeriodoSocio.associate = (models) => {
    PeriodoSocio.belongsTo(models.Usuario,  {
      onDelete: 'CASCADE', 
      foreignKey: 'usuarioId'
    });
    PeriodoSocio.belongsTo(models.Plan,  {
      onDelete: 'CASCADE', 
      foreignKey: 'planId'
    });
  };
 
  return PeriodoSocio;
};
 
export default periodoSocio;