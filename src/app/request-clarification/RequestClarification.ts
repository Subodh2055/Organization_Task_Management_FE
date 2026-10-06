import {AppUser} from "../core/auth.models";

export class RequestClarification{
  id: number;
  subject: string;
  clarificationRequested: string;
  module: string;
  requestedDate: string;
  requestedBy: string;
  requestedTo: AppUser | null;
  expectedDateForClosure: string | null;
  emailReference: string;
  provideClarification: string | null;
  clarificationProvidedBy: AppUser | null;
  clarifiedDate: string | null;
}
