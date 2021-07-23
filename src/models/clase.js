const clase = (sequelize, DataTypes) => {
  const Clase = sequelize.define("clase", {
    claseId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    nombre: {
      type: DataTypes.STRING, 
      allowNull:false
    },
    fechaInicio: {
      type: DataTypes.DATE,
      allowNull:false
    },
    fechaFin: {
      type: DataTypes.DATE,
      allowNull:false
    },
    fechaLimiteReserva: {
      type: DataTypes.DATE,
      allowNull:false
    },
    fechaLimiteEliminarReserva: {
      type: DataTypes.DATE,
      allowNull:false
    },
    cantidadMaxSocios: {
      type: DataTypes.INTEGER,
      allowNull:false
    },
    cantidadMaxSociosEspera: {
      type: DataTypes.INTEGER,
      allowNull:true
    },
    cantidadReservas: {
      type: DataTypes.INTEGER,
      allowNull:false,
      defaultValue: 0
    },
    planes:{
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull:false
    },
    estado: {
      type: DataTypes.STRING, 
      allowNull:false,
      defaultValue: 'HABILITADO' //ACTIVO | FINALIZADO
    }
  }, {
    timestamps: true,
    createdAt: 'creacionFecha',
    updatedAt: 'modificacionFecha',
    freezeTableName: true,
    underscored: true
  });

  Clase.associate = (models) => {
    Clase.belongsTo(models.Coach,  {
      foreignKey: 'coachId'
    });
    Clase.belongsTo(models.Coach,  {
      foreignKey: {
        name: 'asistenteId',
        allowNull: true
      }
    });
    Clase.belongsToMany(models.Socio, {
      through: "clase_socio",
      as: "socios",
      foreignKey: "claseId",
    });
    Clase.hasMany(models.ClaseSocio,  { 
      onDelete: 'CASCADE', 
      foreignKey: 'claseId'
    });
  };
  
  return Clase;
};
 
export default clase;