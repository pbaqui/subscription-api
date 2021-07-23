const rolPermiso = (sequelize, DataTypes) => {
  const RolPermiso = sequelize.define("rol_permiso", {
    
  }, {
    timestamps: false,
    freezeTableName: true,
    underscored: true
  });
 
  return RolPermiso;
};
 
export default rolPermiso;