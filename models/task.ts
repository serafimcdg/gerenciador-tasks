import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { ITaskAttributes } from '../Interfaces';  

interface ITaskCreationAttributes extends Optional<ITaskAttributes, 'id'> {}


class Task extends Model<ITaskAttributes, ITaskCreationAttributes> implements ITaskAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public status!: 'pending' | 'completed';
  public deadline!: Date;
  public userId!: number;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  deadline: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: 'Task',
  timestamps: true,
});

import User from './user';

Task.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Task, { foreignKey: 'userId' });

export default Task;
