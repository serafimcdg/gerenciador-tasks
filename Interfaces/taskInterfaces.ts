export interface ITaskAttributes {
    id?: number;
    title: string;
    description?: string;
    status?: string;
    deadline?: Date;
    userId?: number; 
  }
  
  export interface ITaskCreationAttributes extends Omit<ITaskAttributes, 'id' | 'status' | 'description' | 'deadline'> {}
  