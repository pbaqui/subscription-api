const usuarioRol = (sequelize, DataTypes) => {
  const UsuarioRol = sequelize.define("usuario_rol", {
    vencimiento: {
      type: DataTypes.DATE,
      unique: false, 
      allowNull:true
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

  return UsuarioRol;
};

export default usuarioRol;