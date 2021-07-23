const usuarioPermiso = (sequelize, DataTypes) => {
  const UsuarioPermiso = sequelize.define("usuario_permiso", {
    
  }, {
    timestamps: false,
    freezeTableName: true,
    underscored: true
  });
 
  return UsuarioPermiso;
};
 
export default usuarioPermiso;