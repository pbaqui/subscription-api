const socio = (sequelize, DataTypes) => {
  const Socio = sequelize.define("socio", {
    usuarioId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    datoLaboral: {
      type: DataTypes.STRING
    },
    ruc: {
      type: DataTypes.STRING
    },
    inspeccion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    planes:{
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull:false
    },
  }, {
    timestamps: true,
    createdAt: 'creacionFecha',
    updatedAt: 'modificacionFecha',
    freezeTableName: true,
    underscored: true
  }, {
    instanceMethods: {
      // comparePassword : async function(candidatePassword) {
      //   return await bcrypt.compare(candidatePassword, this.password);
      // }
    }
  });

  Socio.associate = (models) => {
    Socio.belongsTo(models.Usuario, { onDelete: 'CASCADE' , foreignKey: {
      name: 'usuarioId'
    }});
    Socio.belongsToMany(models.Clase, {
      through: "clase_socio",
      as: "clases",
      foreignKey: "usuarioId",
    });
    Socio.belongsToMany(models.Plan, {
      through: {model: models.PeriodoSocio, unique: false},
      as: "periodos",
      foreignKey: "usuarioId"
    })
  };

  return Socio;
};
 
export default socio;