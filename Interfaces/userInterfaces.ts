export interface IUserAttributes {
    id?: number;
    name: string;
    email: string;
    password: string;
    isVerified: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface IUserCreationAttributes extends Omit<IUserAttributes, 'id'> {}
  