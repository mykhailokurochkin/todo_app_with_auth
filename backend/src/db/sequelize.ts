import 'dotenv/config';

import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

const sqliteStorage = process.env.SQLITE_STORAGE ?? 'database.sqlite';

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      logging: false,
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: sqliteStorage,
      logging: false,
    });

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare password: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(160),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
  },
);

let initialized = false;

export const initializeDatabase = async () => {
  if (initialized) {
    return;
  }

  await sequelize.authenticate();
  await sequelize.sync();
  initialized = true;
};

export type PublicUser = {
  id: number;
  email: string;
};

export { sequelize };

