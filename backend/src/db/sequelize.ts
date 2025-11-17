import 'dotenv/config';

import {
  CreationOptional,
  DataTypes,
  ForeignKey,
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

export class Todo extends Model<InferAttributes<Todo>, InferCreationAttributes<Todo>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare status: CreationOptional<string>;
  declare description: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
}

Todo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'todo',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'todos',
    timestamps: false,
  },
);

User.hasMany(Todo, { foreignKey: 'userId', as: 'todos' });
Todo.belongsTo(User, { foreignKey: 'userId', as: 'user' });

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
