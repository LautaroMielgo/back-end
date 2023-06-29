require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const {  DB_DEPLOY } = process.env;


const sequelize = new Sequelize(
  `${DB_DEPLOY}`,
  {
    logging: false,
    native: false,
  }
);

const basename = path.basename(__filename);

const modelDefiners = [];

//* Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

//* Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

//* En sequelize.models están todos los modelos importados como propiedades
//* Para relacionarlos hacemos un destructuring
const { Comments, Posts, Roles, User_data, Users } = sequelize.models;

//? Aca vendrian las relaciones y la creacion de la tabla intermedia
Users.hasOne(User_data, { foreignKey: 'id_users' });
Roles.hasOne(User_data, { foreignKey: 'id_roles' });

User_data.hasMany(Posts, { foreignKey: 'id_user_data' })
Posts.belongsTo(User_data,{ foreignKey: 'id_user_data' })

Posts.hasMany(Comments, { foreignKey: 'id_post' })
Comments.belongsTo(Posts, { foreignKey: 'id_post'})

//ver relacion comentarios y user_data

Posts.hasMany(Comments, {foreignKey: 'id_post'})
Comments.belongsTo(Posts, {foreignKey: 'id_post'})

Comments.hasMany(Posts, {foreignKey: 'id_coments'})
Posts.belongsTo(Comments, {foreignKey: 'id_coments'})

module.exports = {
  ...sequelize.models, 
  conn: sequelize,     // para importar la conexión { conn } = require('./db.js');
};