const rol = (sequelize, DataTypes) => {
  const Rol = sequelize.define("rol", {
    rolId: {
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

  Rol.associate = (models) => {
    Rol.belongsToMany(models.Usuario, {
      through: "usuario_rol",
      as: "usuarios",
      foreignKey: "rolId",
    });
    Rol.belongsToMany(models.Permiso, {
      through: "rol_permiso",
      as: "permisos",
      foreignKey: "rolId",
    });
  }
 
  return Rol;
};
 
export default rol;