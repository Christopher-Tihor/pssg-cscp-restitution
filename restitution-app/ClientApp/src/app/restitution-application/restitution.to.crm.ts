import { iCRMApplication, iCRMContactInfo, iCRMCourtInfo, iCRMParticipant, iRestitutionCRM } from "../interfaces/dynamics/crm-restitution";
import { iRestitutionApplication, iCourtFile, iDocument, iEntityContact } from "../interfaces/restitution.interface";
import { CRMBoolean, EnumHelper, ResitutionForm } from "../shared/enums-list";


export function convertRestitutionToCRM(application: iRestitutionApplication) {
    console.log("converting restitution application");
    console.log(application);

    let crm_application: iRestitutionCRM = {
        Application: getCRMApplication(application),
  }
  let hasDesignate = (application.RestitutionInformation.authorizeDesignate && application.RestitutionInformation.designate.length > 0);

  if (!hasDesignate) {
    crm_application.ContactInfoCollection = getCRMContactInfoCollection(application);
 }


    let courtInfo = getCRMCourtInfoCollection(application);
    if (courtInfo.length > 0) crm_application.CourtInfoCollection = courtInfo;

    let providers = getCRMProviderCollection(application);
    if (providers.length > 0) crm_application.ProviderCollection = providers;

    let documents = getCRMDocumentCollection(application);
    if (documents.length > 0) crm_application.DocumentCollection = documents;


    console.log("restitution crm:");
    console.log(crm_application);

    return crm_application;
}

function getCRMApplication(application: iRestitutionApplication) {
  let primaryContact: iEntityContact;
  if (application.RestitutionInformation.contactInformation.entityContacts.length) {
     primaryContact = application.RestitutionInformation.contactInformation.entityContacts
      .filter(k => k.isPrimaryContact)[0];
    if (primaryContact == null || primaryContact == undefined) {
      primaryContact = application.RestitutionInformation.contactInformation.entityContacts[0];
    }
  }
  
  let crm_application: iCRMApplication = {
      vsd_applicanttype: application.ApplicationType.val == ResitutionForm.VictimEntity.val ? ResitutionForm.Victim.val : application.ApplicationType.val, //annoying handling for "victim entity"
      vsd_applicantsfirstname: primaryContact != undefined ? primaryContact.firstName : application.RestitutionInformation.firstName,
      vsd_applicantsmiddlename: application.RestitutionInformation.middleName,
      vsd_applicantslastname: primaryContact != undefined ? primaryContact.lastName : application.RestitutionInformation.lastName,
      vsd_otherfirstname: application.RestitutionInformation.otherFirstName,
      vsd_otherlastname: application.RestitutionInformation.otherLastName,
      vsd_applicantsgendercode: application.RestitutionInformation.gender,
      vsd_applicantsbirthdate: application.RestitutionInformation.birthDate,
      vsd_indigenous: application.RestitutionInformation.indigenousStatus,
      vsd_applicantsprimarycity: primaryContact != undefined && primaryContact.mailingAddress != undefined ? primaryContact.mailingAddress.city : '',
      vsd_applicantsprimaryprovince: primaryContact != undefined && primaryContact.mailingAddress != undefined ? primaryContact.mailingAddress.province : '',
      vsd_applicantsprimarypostalcode: primaryContact != undefined && primaryContact.mailingAddress != undefined ? primaryContact.mailingAddress.postalCode : '',
      vsd_applicantsprimarycountry: primaryContact != undefined && primaryContact.mailingAddress != undefined ? primaryContact.mailingAddress.country : '',
      vsd_applicantssignature: application.RestitutionInformation.signature,
      vsd_smspreferred: primaryContact.smsPreferred,
      vsd_applicantspreferredmethodofcontact: primaryContact.preferredMethodOfContact,
      vsd_applicantsprimaryphonenumber: primaryContact.phoneNumber,
      vsd_applicantsalternatephonenumber: primaryContact.alternatePhoneNumber,
      vsd_applicantsemail: primaryContact.email,
      vsd_applicantsprimaryaddressline1: primaryContact != undefined && primaryContact.mailingAddress != undefined ? primaryContact.mailingAddress.line1 : '',
      vsd_applicantsprimaryaddressline2: primaryContact != undefined && primaryContact.mailingAddress != undefined ? primaryContact.mailingAddress.line2 : '',
      vsd_applicantsprimaryaddressline3: primaryContact != undefined && primaryContact.mailingAddress != undefined ? primaryContact.attentionTo : '',
      vsd_voicemailoption: null,
      vsd_contacttitle: primaryContact != undefined ? primaryContact.contactTitle : '',
      //NOTE: VS-6380 This field was remapped from contact entity as per business ask.   
      vsd_offendercustodylocation: application.RestitutionInformation.probationOfficerCustodyLocation,
    }

    if (application.ApplicationType.val !== ResitutionForm.VictimEntity.val) {
    let hasDesignate = (application.RestitutionInformation.authorizeDesignate && application.RestitutionInformation.designate.length > 0);

    if (!hasDesignate) {
      crm_application.vsd_applicantspreferredmethodofcontact = application.RestitutionInformation.contactInformation.preferredMethodOfContact;
      crm_application.vsd_smspreferred = application.RestitutionInformation.contactInformation.smsPreferred;
      crm_application.vsd_applicantsprimaryphonenumber = application.RestitutionInformation.contactInformation.phoneNumber;
      crm_application.vsd_applicantsalternatephonenumber = application.RestitutionInformation.contactInformation.alternatePhoneNumber;
      crm_application.vsd_applicantsemail = application.RestitutionInformation.contactInformation.email;
      crm_application.vsd_applicantsprimaryaddressline1 = application.RestitutionInformation.contactInformation.mailingAddress.line1;
      crm_application.vsd_applicantsprimaryaddressline2 = application.RestitutionInformation.contactInformation.mailingAddress.line2;
      crm_application.vsd_applicantsprimarycity = application.RestitutionInformation.contactInformation.mailingAddress.city;
      crm_application.vsd_applicantsprimaryprovince = application.RestitutionInformation.contactInformation.mailingAddress.province;
      crm_application.vsd_applicantsprimarypostalcode = application.RestitutionInformation.contactInformation.mailingAddress.postalCode;
      crm_application.vsd_applicantsprimarycountry = application.RestitutionInformation.contactInformation.mailingAddress.country;
      crm_application.vsd_voicemailoption = application.RestitutionInformation.contactInformation.leaveVoicemail;
    }

  }
 
    if (application.RestitutionInformation.signatureName) {
        crm_application.vsd_declarationfullname = application.RestitutionInformation.signatureName;
    }

  if (application.RestitutionInformation.signerTitle) {
    crm_application.vsd_signingofficertitle = application.RestitutionInformation.signerTitle;
  }

    if (application.RestitutionInformation.signatureDate) {
        crm_application.vsd_declarationdate = application.RestitutionInformation.signatureDate;
    }

 
    //there is only ever 1 file
    application.RestitutionInformation.courtFiles.forEach(file => {
        if (checkFileHasOffender(file)) {
            crm_application.vsd_cvap_offenderfirstname = file.firstName;
            crm_application.vsd_cvap_offendermiddlename = file.middleName;
            crm_application.vsd_cvap_offenderlastname = file.lastName;
        }
    });

    return crm_application;
}

function getCRMCourtInfoCollection(application: iRestitutionApplication) {
    let ret: iCRMCourtInfo[] = [];

    application.RestitutionInformation.courtFiles.forEach(file => {
        if (checkHasFileInfo(file)) {
            ret.push({
                vsd_courtfilenumber: file.fileNumber,
                vsd_courtlocation: file.location,
            });
        }
    });

    return ret;
}
function getCRMContactInfoCollection(application: iRestitutionApplication) {
  let ret: iCRMContactInfo[] = [];

  application.RestitutionInformation.contactInformation.entityContacts.forEach(contact => {
    if (contact) {
      ret.push({
        vsd_applicantsfirstname: contact.firstName,
        vsd_applicantslastname: contact.lastName,
        vsd_applicantsemail: contact.email,
        vsd_applicantspreferredmethodofcontact: contact.preferredMethodOfContact,
        vsd_applicantsprimaryphonenumber: contact.phoneNumber,
        vsd_applicantsalternatephonenumber: contact.alternatePhoneNumber,
        vsd_smspreferred: contact.smsPreferred,
        vsd_voicemailoption: contact.leaveVoicemail,
        vsd_applicantsprimaryaddressline1: contact.mailingAddress != undefined ? contact.mailingAddress.line1 : "",
        vsd_applicantsprimaryaddressline2: contact.mailingAddress != undefined ? contact.mailingAddress.line2 : "",
        vsd_applicantsprimaryaddressline3: contact.mailingAddress != undefined ? contact.mailingAddress.postalCode : "",
      });
    }
  });

  return ret;
}
function getCRMProviderCollection(application: iRestitutionApplication) {
    let ret: iCRMParticipant[] = [];
    let enumHelper = new EnumHelper();

    if (application.RestitutionInformation.authorizeDesignate && application.RestitutionInformation.designate.length > 0) {
        let designate = application.RestitutionInformation.designate[0];
        //add designate...

      var primaryContact = application.RestitutionInformation.contactInformation.entityContacts
        .filter(k => k.isPrimaryContact == CRMBoolean.True)[0];
      if (primaryContact == null || primaryContact == undefined) {
        primaryContact == application.RestitutionInformation.contactInformation.entityContacts[0];
      }
      application.RestitutionInformation.contactInformation.entityContacts.forEach(contact => {
       
    
        let toAdd: iCRMParticipant = {
            vsd_firstname: designate.firstName,
            vsd_lastname: designate.lastName,
            vsd_preferredname: designate.preferredName,
            //need crm field: designate.actOnBehalf,
            vsd_relationship1: "Designate",

            //set contact info
            vsd_addressline1: contact.mailingAddress.line1,
            vsd_addressline2: contact.mailingAddress.line2,
            vsd_city: contact.mailingAddress.city,
            vsd_province: contact.mailingAddress.province,
            vsd_postalcode: contact.mailingAddress.postalCode,
            vsd_country: contact.mailingAddress.country,
            vsd_phonenumber: contact.phoneNumber,
            vsd_alternatephonenumber: contact.alternatePhoneNumber,
            vsd_email: contact.email,
            vsd_voicemailoptions: contact.leaveVoicemail,
            vsd_preferredmethodofcontact: convertToParticipantMethodOfContact(contact.preferredMethodOfContact),
            vsd_isprimaryentitycontact: primaryContact != undefined ? primaryContact.isPrimaryContact : CRMBoolean.False,
            vsd_title: contact.contactTitle,


        };
     

      switch (primaryContact.preferredMethodOfContact) {
            case enumHelper.ContactMethods.BLANK.val:
                toAdd.vsd_restcontactpreferenceforupdates = enumHelper.ParticipantRestitutionContactMethods.BLANK.val;
                break;
            case enumHelper.ContactMethods.Email.val:
                toAdd.vsd_restcontactpreferenceforupdates = enumHelper.ParticipantRestitutionContactMethods.Email.val;
                break;
            case enumHelper.ContactMethods.Mail.val:
                toAdd.vsd_restcontactpreferenceforupdates = enumHelper.ParticipantRestitutionContactMethods.Mail.val;
                break;
            case enumHelper.ContactMethods.Phone.val:
                toAdd.vsd_restcontactpreferenceforupdates = enumHelper.ParticipantRestitutionContactMethods.Phone.val;
                break;
        }

        if (primaryContact.smsPreferred == CRMBoolean.True) {
            toAdd.vsd_restcontactpreferenceforupdates = enumHelper.ParticipantRestitutionContactMethods.SMS.val;
        }

        ret.push(toAdd);
  
      });
    }
    //victim/entity application - we save a "Victim" participant to hold the relationship to the offender... weird system
    if (application.ApplicationType.val === ResitutionForm.Victim.val || application.ApplicationType.val === ResitutionForm.VictimEntity.val) {
        application.RestitutionInformation.courtFiles.forEach(file => {
            ret.push({
                vsd_firstname: application.RestitutionInformation.firstName,
                vsd_middlename: application.RestitutionInformation.middleName,
                vsd_lastname: application.RestitutionInformation.lastName,
                vsd_relationship1: "Victim",
                vsd_relationship2: "Other",
                vsd_relationship2other: file.relationship,
            });
        });
    }

    if (application.ApplicationType.val === ResitutionForm.Offender.val && checkProbationOfficerHasValue(application)) {
        ret.push({
            vsd_firstname: application.RestitutionInformation.probationOfficerFirstName,
            vsd_lastname: application.RestitutionInformation.probationOfficerLastName,
            vsd_phonenumber: application.RestitutionInformation.probationOfficerPhoneNumber,
            vsd_email: application.RestitutionInformation.probationOfficerEmail,
            vsd_relationship1: "Probation Officer",
        });
    }

    if ((application.ApplicationType.val === ResitutionForm.Victim.val || application.ApplicationType.val === ResitutionForm.VictimEntity.val) && checkObjectHasValue(application.RestitutionInformation.vsw[0])) {
        let vsw = application.RestitutionInformation.vsw[0];
        ret.push({
            vsd_firstname: vsw.firstName,
            vsd_lastname: vsw.lastName,
            vsd_rest_programname: vsw.program,
            vsd_phonenumber: vsw.phoneNumber,
            vsd_email: vsw.email,
            vsd_relationship1: "Victim Service Worker",
        });
    }

    if (application.ApplicationType.val === ResitutionForm.VictimEntity.val) {
        application.RestitutionInformation.contactInformation.entityContacts.forEach(c => {
            if (checkObjectHasValue(c)) {
                ret.push({
                  vsd_firstname: c.firstName,
                  vsd_lastname: c.lastName,
                  vsd_relationship1: "Representative",
                  vsd_preferredmethodofcontact: convertToParticipantMethodOfContact(c.preferredMethodOfContact),
                  vsd_phonenumber: c.phoneNumber,
                  vsd_alternatephonenumber: c.alternatePhoneNumber,
                  vsd_voicemailoptions: c.leaveVoicemail,
                  vsd_email: c.email,
                  vsd_isprimaryentitycontact: c.isPrimaryContact,
                  vsd_title: c.contactTitle,
                });
            }
        })
  }
    return ret;
}

function convertToParticipantMethodOfContact(input) {
    let ret = null;
    let val = parseInt(input);
    let enumHelper = new EnumHelper();
    switch (val) {
        case (enumHelper.ContactMethods.Email.val): {
            ret = enumHelper.ParticipantContactMethods.Email.val;
            break;
        }
        case (enumHelper.ContactMethods.Mail.val): {
            ret = enumHelper.ParticipantContactMethods.Mail.val;
            break;
        }
        case (enumHelper.ContactMethods.Phone.val): {
            ret = enumHelper.ParticipantContactMethods.Phone.val;
            break;
        }
        default: {
            break;
        }
    }

    return ret;
}

function getCRMDocumentCollection(application: iRestitutionApplication) {
    let ret: iDocument[] = [];
    application.RestitutionInformation.documents.forEach(doc => {
        ret.push({
            filename: doc.filename,
            subject: doc.subject,
            body: doc.body
        });
    });
    return ret;
}

function checkFileHasOffender(file: iCourtFile) {
    return (file && (file.firstName || file.middleName || file.lastName || file.relationship));
}
function checkHasFileInfo(file: iCourtFile) {
    return (file && (file.fileNumber || file.location));
}
function checkProbationOfficerHasValue(application: iRestitutionApplication) {
    return (application.RestitutionInformation.probationOfficerFirstName || application.RestitutionInformation.probationOfficerLastName || application.RestitutionInformation.probationOfficerPhoneNumber || application.RestitutionInformation.probationOfficerEmail || application.RestitutionInformation.probationOfficerCustodyLocation)
}

function checkObjectHasValue(obj: any) {
    return Object.values(obj).some(value => !!value);
}

