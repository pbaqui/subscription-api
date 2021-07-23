import bcrypt from 'bcrypt';

const usuario = (sequelize, DataTypes) => {
  const Usuario = sequelize.define("usuario", {
    usuarioId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull:false
    },
    apellido: {
      type: DataTypes.STRING,
      unique: false, 
      allowNull:false
    },
    ci: {
      type: DataTypes.STRING,
      unique: true, 
      allowNull:false
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull:false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull:false
    },
    direccion: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING,
      required: true
    },
    fechaNacimiento: {
      type: DataTypes.DATEONLY,
      required: true
    },
    verificado: {
      type: DataTypes.BOOLEAN,
      required: true,
      defaultValue: false
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

  Usuario.prototype.comparePassword = function(candidatePassword) {
    return bcrypt.compareSync(candidatePassword, this.password);
  };
  
  Usuario.beforeSave (
    async (user) => await hashPassword(user)
  );

  // Usuario.beforeCreate(function(model, options) {
  //   console.log(options);
  //   // return new Promise ((resolve, reject) => {
  //   //     model.generateHash(model.password, function(err, encrypted) {
  //   //         if (err) return reject(err);
  //   //         debug('Info: ' + 'getting ' + encrypted);

  //   //         model.password = encrypted;
  //   //         debug('Info: ' + 'password now is: ' + model.password);
  //   //         return resolve(model, options);
  //   //     });
  //   // });
  // });

  Usuario.associate = (models) => {
    Usuario.hasOne(models.Socio, { onDelete: 'CASCADE' , foreignKey: {
      name: 'usuarioId'
    }});
    Usuario.belongsToMany(models.Rol, {
      through: "usuario_rol",
      as: "roles",
      foreignKey: "usuarioId",
    });
    Usuario.belongsToMany(models.Permiso, {
      through: "usuario_permiso",
      as: "permisos",
      foreignKey: "usuarioId",
    });
  }

  return Usuario;
};

const hashPassword = async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);    
  }
  return user
}

export default usuario;