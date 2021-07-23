const coach = (sequelize, DataTypes) => {
  const Coach = sequelize.define("coach", {
    usuarioId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    tipo: {
      type: DataTypes.STRING
    }
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

  Coach.associate = (models) => {
    Coach.belongsTo(models.Usuario, { onDelete: 'CASCADE' , foreignKey: {
      name: 'usuarioId'
    }});
    Coach.hasMany(models.HorarioClase,  {
      foreignKey: 'coachId'
    });
    Coach.hasMany(models.HorarioClase,  {
      foreignKey: {
        name: 'asistenteId',
        allowNull: true
      }
    });
  };

  return Coach;
};
 
export default coach;