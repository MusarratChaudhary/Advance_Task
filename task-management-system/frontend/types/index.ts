export interface User {

  _id: string;

  name: string;

  email: string;

  role:
    | "ADMIN"
    | "MANAGER"
    | "MEMBER";

}



export interface Task {

  _id: string;

  title: string;

  description: string;

  status:
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED";

  priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH";

  assignedTo?: User | null;

  createdBy?: User;

  teamId?: string | null;

  dueDate?: string;

  createdAt: string;

  updatedAt: string;

}



export interface Team {

  _id: string;

  name: string;

  description?: string;

  members: User[];

}