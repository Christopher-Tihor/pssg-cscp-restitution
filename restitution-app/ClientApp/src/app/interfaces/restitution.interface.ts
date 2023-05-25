import { IOptionSetVal } from "../shared/enums-list";
import { Address } from "./address.interface";

export interface iRestitutionApplication {
  ApplicationType: IOptionSetVal;
  RestitutionInformation: RestitutionInformation;
}
export interface RestitutionInformation {
  firstName: string;
  middleName: string;
  lastName: string;
  iHaveOtherNames: string;
  otherFirstName: string;
  otherLastName: string;
  birthDate: Date;
  gender: number;
  indigenousStatus: number;
  authorizeDesignate: boolean;
  designate: iDesignate[];
  contactInformation: iContactInformation;
  probationOfficerFirstName?: string;
  probationOfficerLastName?: string;
  probationOfficerCustodyLocation?: string;
  probationOfficerPhoneNumber?: string;
  probationOfficerEmail?: string;
  courtFiles: iCourtFile[];
  vsw: iVSW[];
  documents: iDocument[];
  declaredAndSigned: string;
  signature: string;
  signatureName?: string;
  // signerTitle?: string;
  signatureDate?: Date;
  offendercustodylocation?: string;
}

export interface iDesignate {
  firstName: string;
  lastName: string;
  preferredName: string;
  actOnBehalf: boolean;
}

export interface iContactInformation {
  entityContacts: iEntityContact[],
  preferredMethodOfContact: number;
  smsPreferred?: number;
  mailingAddress: Address;
  attentionTo: string;
  phoneNumber: string;
  alternatePhoneNumber: string;
  leaveVoicemail: number;
  email: string;
}

export interface iEntityContact {
  firstName: string;
  lastName: string;
  // title: string;
  // isPrimaryEntityContact: boolean;
  // preferredMethodOfContact: number;
  // smsPreferred?: number;
  // phoneNumber: string;
  // alternatePhoneNumber: string;
  // leaveVoicemail: number;
  // email: string;
}

export interface iCourtFile {
  fileNumber: string;
  location: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  relationship?: string;
}

export interface iVSW {
  firstName: string;
  lastName: string;
  program: string;
  phoneNumber: string;
  email: string;
}

export interface iDocument {
  filename: string;
  body: string;
  subject?: string;
}
