const claseSocio = (sequelize, DataTypes) => {
  const ClaseSocio = sequelize.define("clase_socio", {
    prueba: {
      type: DataTypes.BOOLEAN,
      allowNull:false
    },
    presente: {
      type: DataTypes.BOOLEAN, 
      allowNull:false,
      defaultValue: false
    },
    estado: {
      type: DataTypes.STRING, 
      allowNull:false,
      defaultValue: 'RESERVA' //ESPERA
    }
  }, {
    timestamps: true,
    createdAt: 'creacionFecha',
    updatedAt: 'modificacionFecha',
    freezeTableName: true,
    underscored: true
  });

  ClaseSocio.associate = (models) => {
    ClaseSocio.belongsTo(models.Clase,  { 
      onDelete: 'CASCADE', 
      foreignKey: 'claseId'
    });
  };

  return ClaseSocio;
};
 
export default claseSocio;