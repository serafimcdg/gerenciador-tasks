import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes, Dialect } from 'sequelize';
import process from 'process';
import configJson from '../config/config.json'; 

interface IDBConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: Dialect; 
}

interface IConfig {
  development: IDBConfig;
  production?: IDBConfig;
  test?: IDBConfig;
}


function getDialect(dialect: string): Dialect {
  if (['mysql', 'postgres', 'sqlite', 'mariadb', 'mssql'].includes(dialect)) {
    return dialect as Dialect;
  }
  throw new Error(`${dialect}`);
}

const config: IConfig = {
  development: {
    ...configJson.development,
    dialect: getDialect(configJson.development.dialect),
  }
};

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const dbConfig: IDBConfig | undefined = config[env as keyof IConfig]; 

if (!dbConfig) {
  throw new Error(``);
}

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
});

interface IDB {
  [key: string]: any;
  sequelize?: Sequelize;
  Sequelize?: typeof Sequelize;
}

sequelize.authenticate()
  .then(() => {
    console.log('conectado');
  })
  .catch((error) => {
    console.error('erro', error);
  });
const db: IDB = {};

fs
  .readdirSync(__dirname)
  .filter((file: string) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.ts' && 
      file.indexOf('.test.ts') === -1
    );
  })
  .forEach((file: string) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName: string) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
