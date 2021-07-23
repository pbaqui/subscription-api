const diaClase = (sequelize, DataTypes) => {
  const DiaClase = sequelize.define("dia_clase", {
    dia: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.ENUM,
      values: [0,1,2,3,4,5,6]
    }
  }, {
    timestamps: true,
    createdAt: 'creacionFecha',
    updatedAt: 'modificacionFecha',
    freezeTableName: true,
    underscored: true
  });

  DiaClase.associate = (models) => {
    DiaClase.belongsTo(models.ConfiguracionClase,  { 
      onDelete: 'CASCADE', 
      foreignKey: 'configuracionClaseId'
    });
  };

  return DiaClase;
};
 
export default diaClase;