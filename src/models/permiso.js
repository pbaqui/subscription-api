const permiso = (sequelize, DataTypes) => {
  const Permiso = sequelize.define("permiso", {
    permisoId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    tag: {
      type: DataTypes.STRING,
      unique: true, 
      allowNull:false
    },
    descripcion: {
      type: DataTypes.STRING,
      unique: false, 
      allowNull:true
    }
  }, {
    timestamps: true,
    createdAt: 'creacionFecha',
    updatedAt: 'modificacionFecha',
    freezeTableName: true,
    underscored: true
  });

  Permiso.associate = (models) => {
    Permiso.belongsToMany(models.Rol, {
      through: "rol_permiso",
      as: "roles",
      foreignKey: "permisoId",
    });
    Permiso.belongsToMany(models.Usuario, {
      through: "usuario_permiso",
      as: "usuarios",
      foreignKey: "permisoId",
    });
  }
 
  return Permiso;
};
 
export default permiso;