import { Collaborator } from './Collaborator';

/**
 * PeopleData – Хувийн мэдээлэл, багийн гишүүд, хамтрагчид зэрэг талбарууд.
 */
export interface PeopleData {
  vanityURL: string;
  demographics: string;
  collaborators: Collaborator[];
}
