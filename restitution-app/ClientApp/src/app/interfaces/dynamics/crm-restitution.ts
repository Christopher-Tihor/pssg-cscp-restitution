import { CRMBoolean } from "../../shared/enums-list";

export interface iRestitutionCRM {
    Application: iCRMApplication;
    CourtInfoCollection?: iCRMCourtInfo[];
    DocumentCollection?: iCRMDocument[];
    ProviderCollection?: iCRMParticipant[];
    ContactInfoCollection?: iCRMContactInfo[];
}
export interface iCRMApplication {
    vsd_applicanttype: number;
    vsd_applicantsfirstname: string;
    vsd_applicantsmiddlename: string;
    vsd_applicantslastname: string;
    vsd_otherfirstname?: string;
    vsd_otherlastname?: string;
    vsd_applicantsgendercode: number;
    vsd_applicantsbirthdate: Date;
    vsd_indigenous: number;
   
    vsd_applicantsprimarycity: string;
    vsd_applicantsprimaryprovince: string;
    vsd_applicantsprimarypostalcode: string;
    vsd_applicantsprimarycountry: string;
    vsd_cvap_offenderfirstname?: string;
    vsd_cvap_offendermiddlename?: string;
    vsd_cvap_offenderlastname?: string;
    
    vsd_declarationfullname?: string;
    vsd_signingofficertitle?: string;
    vsd_declarationdate?: Date;
    vsd_applicantssignature: string;
    vsd_offendercustodylocation: string;

    vsd_smspreferred: number;
    vsd_applicantspreferredmethodofcontact: number;
    vsd_applicantsprimaryphonenumber: string;
    vsd_applicantsalternatephonenumber: string;
    vsd_applicantsemail: string;
    vsd_applicantsprimaryaddressline1: string;
    vsd_applicantsprimaryaddressline2: string;
    vsd_applicantsprimaryaddressline3: string;
    vsd_voicemailoption?: number;
    vsd_contacttitle?: string;

}
export interface iCRMCourtInfo {
    vsd_courtfilenumber: string;
    vsd_courtlocation: string;
}
export interface iCRMParticipant {
    vsd_firstname?: string;
    vsd_middlename?: string;
    vsd_lastname?: string;
    vsd_preferredname?: string;
    vsd_companyname?: string;
    vsd_name?: string;
    vsd_addressline1?: string;
    vsd_addressline2?: string;
    vsd_addressline3?: string;
    vsd_city?: string;
    vsd_province?: string;
    vsd_postalcode?: string;
    vsd_country?: string;
    vsd_preferredmethodofcontact?: number;
    vsd_restcontactpreferenceforupdates?: number;
    vsd_phonenumber?: string;
    vsd_alternatephonenumber?: string;
    vsd_voicemailoptions?: number;
    vsd_email?: string;
    vsd_rest_custodylocation?: string;
    vsd_rest_programname?: string;
    vsd_relationship1: string;
    vsd_relationship2?: string;
    vsd_relationship2other?: string;
    vsd_title?: string;
    vsd_isprimaryentitycontact?: number;
    vsd_contacttitle?: string;
    vsd_smspreferred?: number;
}
export interface iCRMDocument {
    filename: string;
    body: string;
    subject?: string;
}

export interface iCRMContactInfo {
  vsd_applicantspreferredmethodofcontact: number;
  vsd_smspreferred?: number;
  vsd_applicantsprimaryphonenumber?: string;
  vsd_applicantsalternatephonenumber?: string;
  vsd_applicantsemail?: string;
  vsd_applicantsprimaryaddressline1: string;
  vsd_applicantsprimaryaddressline2: string;
  vsd_applicantsprimaryaddressline3: string;
  vsd_applicantsfirstname: string;
  vsd_applicantslastname: string;
  vsd_voicemailoption?: number;
}
