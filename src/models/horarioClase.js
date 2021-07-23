const horarioClase = (sequelize, DataTypes) => {
  const HorarioClase = sequelize.define("horario_clase", {
    horarioClaseId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    horaInicio: {
      type: DataTypes.TIME,
      allowNull:false
    },
    horaFin: {
      type: DataTypes.TIME,
      allowNull:false
    }
  }, {
    timestamps: true,
    createdAt: 'creacionFecha',
    updatedAt: 'modificacionFecha',
    freezeTableName: true,
    underscored: true
  });

  HorarioClase.associate = (models) => {
    HorarioClase.belongsTo(models.Coach,  {
      foreignKey: 'coachId'
    });
    HorarioClase.belongsTo(models.Coach,  {
      foreignKey: {
        name: 'asistenteId',
        allowNull: true
      }
    });
    HorarioClase.belongsTo(models.ConfiguracionClase,  { 
      onDelete: 'CASCADE', 
      foreignKey: 'configuracionClaseId'
    });
  };

  return HorarioClase;
};
 
export default horarioClase;