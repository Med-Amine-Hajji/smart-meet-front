import { UserRole } from "./user-role.enum";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export class UserDto {
    id: number;
    email: string;
    name: string;
    userRole: UserRole;  
    imgUrl?: string;   
  }

export class UserDetails {
    id: number;
    email: string;
    name: string;
    userRole: UserRole;  
    imgUrl?: string;  
    matricule:string;
    verified:boolean;
 }