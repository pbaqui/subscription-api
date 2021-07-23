const configuracionClase = (sequelize, DataTypes) => {
  const ConfiguracionClase = sequelize.define("configuracion_clase", {
    configuracionClaseId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    nombre: {
      type: DataTypes.STRING, 
      unique: true, 
      allowNull:false
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull:false
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      allowNull:false
    },
    fechaFin: {
      type: DataTypes.DATEONLY,
      allowNull:false
    },
    cantidadSocios: {
      type: DataTypes.INTEGER,
      allowNull:true
    },
    cantidadSociosEspera: {
      type: DataTypes.INTEGER,
      allowNull:true
    },
    dias:{
      type: DataTypes.ARRAY(DataTypes.BOOLEAN),
      allowNull:false
    },
    planes:{
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull:false
    },
    estado: {
      type: DataTypes.STRING, 
      allowNull:false,
      defaultValue: 'ACTIVO'
    }
  }, {
    timestamps: true,
    createdAt: 'creacionFecha',
    updatedAt: 'modificacionFecha',
    freezeTableName: true,
    underscored: true
  });

  ConfiguracionClase.associate = (models) => {
    ConfiguracionClase.hasMany(models.HorarioClase,  {
      foreignKey: 'configuracionClaseId'
    });
    // ConfiguracionClase.hasMany(models.DiaClase,  {
    //   foreignKey: 'configuracionClaseId'
    // });
  };
  
  return ConfiguracionClase;
};
 
export default configuracionClase;