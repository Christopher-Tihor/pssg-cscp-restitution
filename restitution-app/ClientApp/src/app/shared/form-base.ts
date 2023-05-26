import { EnumHelper } from './enums-list';
import { MatStepper } from '@angular/material';
import { ValidatorFn, ValidationErrors, AbstractControl, FormControl, FormGroup, FormArray } from '@angular/forms';
import * as _ from 'lodash';
import * as _moment from 'moment';

export class FormBase {
  form: FormGroup;
  today = new Date();
  oldestHuman = new Date(this.today.getFullYear() - 120, this.today.getMonth(), this.today.getDay());
  enum = new EnumHelper();
  showValidationMessage: boolean = false;
  public currentFormStep: number = 0;
  max_selected_index: number = 0;

  isFieldValid(field: string, disabled: boolean = false) {
    if (disabled === true) return true;
    let formField = this.form.get(field);
    if (!formField || formField.value === null)
      return true;
    if (field === 'personalInformation.sin' || field === 'victimInformation.sin' || field === 'sin') {
      let validator = formField.validator({} as AbstractControl);
      let isRequired = validator && validator.required ? true : false;
      return this.validateSIN(formField.value, isRequired);
    }

    return this.form.get(field).valid || !this.form.get(field).touched;
  }

  isMyControlValid(control: AbstractControl) {
    if (control == null) {
      console.log(control);
    }
    return control.valid || !control.touched || control.disabled;
  }

  validateSIN(sin, isRequired) {
    var check, even, tot;

    // Allow blank SIN
    if (!isRequired && sin === '') {
      return true;
    }

    if (typeof sin === 'number') {
      sin = sin.toString();
    }

    if (sin.length === 9) {
      // convert to an array & pop off the check digit
      sin = sin.split('');
      check = +sin.pop();

      even = sin
        // take the digits at the even indices
        .filter(function (_, i) { return i % 2; })
        // multiply them by two
        .map(function (n) { return n * 2; })
        // and split them into individual digits
        .join('').split('');

      tot = sin
        // take the digits at the odd indices
        .filter(function (_, i) { return !(i % 2); })
        // concatenate them with the transformed numbers above
        .concat(even)
        // it's currently an array of strings; we want numbers
        .map(function (n) { return +n; })
        // and take the sum
        .reduce(function (acc, cur) { return acc + cur; });

      // compare the result against the check digit
      return check === (10 - (tot % 10)) % 10;
    } else return false;// throw sin + ' is not a valid sin number.';
  }

  isArrayFieldValid(formArrayName: string, arrayControl: string, arrayIndex: number) {
    let formArray = <FormArray>this.form.get(formArrayName);
    let indexedControl = formArray.controls[arrayIndex];
    let formField = indexedControl.get(arrayControl);
    if (formField == null)
      return true;

    return formField.valid || !formField.touched;
  }

  isValidOrNotTouched(field: string) {
    return this.form.get(field).valid || !this.form.get(field).touched;
  }

  public rejectIfNotDigitOrBackSpace(event) {
    const acceptedKeys = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Control',
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    if (acceptedKeys.indexOf(event.key) === -1) {
      event.preventDefault();
    }
  }

  public customRequiredCheckboxValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value === true) {
        return null;
      } else {
        return { 'shouldBeTrue': 'But value is false' };
      }
    };
  }

  public customZipCodeValidator(pattern: RegExp, countryField: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.parent) {
        return null;
      }
      const country = control.parent.get(countryField).value;
      if (country !== 'Canada' && country !== 'United States of America') {
        return null;
      }
      const valueMatchesPattern = pattern.test(control.value);
      return valueMatchesPattern ? null : { 'regex-missmatch': { value: control.value } };
    };
  }

  public requireCheckboxesToBeCheckedValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const name = control.get('haveMedicalExpenses');
    const alterEgo = control.get('haveDentalExpenses');

    return name.value != false && alterEgo.value != false ? { 'identityRevealed': true } : null;
  };

  public requiredCheckboxGroupValidator(checkboxFields: string[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.parent) {
        return null;
      }
      let valid = false;
      checkboxFields.forEach(f => {
        valid = valid || control.parent.get(f).value;
      });
      return valid ? null : { 'required-set': { value: control.value } };
    };
  }

  public requiredCheckboxChildValidator(checkboxField: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.parent || !control.parent.get(checkboxField)) {
        return null;
      }
      const parentIsChecked = control.parent.get(checkboxField).value;
      if (!parentIsChecked) {
        return null;
      }
      return control.value ? null : { 'required': { value: control.value } };
    };
  }

  validateAllFormFields(formGroup: any) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control.valid === false) {
        console.log("invalid: ", field);
      }

      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      } else if (control instanceof FormArray) {
        for (const control1 of control.controls) {
          if (control1 instanceof FormControl) {
            control1.markAsTouched({
              onlySelf: true
            });
          }
          if (control1 instanceof FormGroup) {
            this.validateAllFormFields(control1);
          }
        }
      }
    });
  }

  getErrors(formGroup: any, errors: any = {}) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        errors[field] = control.errors;
      } else if (control instanceof FormGroup) {
        errors[field] = this.getErrors(control);
      } else if (control instanceof FormArray) {
        errors[field] = this.getErrors(control);
      }
    });
    return errors;
  }

  orEmpty(amI: FormControl): string {
    if (amI == null || amI === undefined)
      return "--";

    if (amI.value.length == 0)
      return "--";

    return amI.value;
  }

  isChildFieldValid(parent: string, field: string) {
    let formField = this.form.get(parent);
    if (formField == null)
      return true;

    return formField.get(field).valid || !formField.get(field).touched;
  }

  controlsHaveValueCheck(controlKeys: Array<string>, formGroup: FormGroup): Array<boolean> {
    return controlKeys.map((item) => {
      // reset any errors already set (ON ALL GIVEN KEYS).
      formGroup.controls[item].setErrors(null);

      // Checks for empty string and empty array.
      let hasValue = (formGroup.controls[item].value instanceof Array) ? formGroup.controls[item].value.length > 0 :
        !(formGroup.controls[item].value === "");
      return (hasValue) ? false : true;
    });
  }

  conditionalAnyRequired(controlKeys: Array<string>): ValidatorFn {
    return (control: FormControl): { [key: string]: any } => {
      let formGroup = control.root;
      if (formGroup instanceof FormGroup) {

        // Only check if all FormControls are siblings(& present on the nearest FormGroup)
        if (controlKeys.every((item) => {
          return formGroup.get(item) != null;
        })) {
          let result = this.controlsHaveValueCheck(controlKeys, formGroup);

          // If any item is valid return null, if all are invalid return required error.
          return (result.some((item) => {
            return item === false;
          })) ? null : { required: true };
        }
      }
      return null;
    }
  }


  public hasValueSet(controlName: string): boolean {
    var control = this.form.get(controlName);

    if (control == null || control === undefined)
      return false;

    if (control.value == null || control.value === undefined)
      return false;

    if (control.value.length == 0 || control.value.length === undefined)
      return false;

    return control.value.length > 0;
  }

  public hasSignature(controlName: string): boolean {
    return this.hasValueSet(controlName);
  }

  public requiredSelectChildValidator(selectField: string, conditionalValue: any[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.parent
        || !control.parent.get(selectField)
        || conditionalValue.indexOf(control.parent.get(selectField).value) === -1) {
        return null;
      }
      const parentIsChecked = control.parent.get(selectField).value;
      if (!parentIsChecked) {
        return null;
      }
      return control.value ? null : { 'required': { value: control.value } };
    };
  }

  // Requires you to use the [InnerHTML] property on an element rather than {{ }} interpolation
  public checkmarkOrEmpty(controlName: string): string {
    var control = this.form.get(controlName);

    if (control.value === true)
      return '<i class="fa fa-check"> </i>';
    return '--';
  }

  public checkmarkFromControl(control: AbstractControl): string {
    if (control.value === true)
      return '<i class="fa fa-check"> </i>';
    return '--';
  }

  public valueOrEmpty(controlName: any, emptyValue = '--'): string {
    let control = null;

    if (typeof (controlName) == 'string')
      control = this.form.get(controlName);

    if (controlName instanceof FormGroup)
      control = controlName;

    if (controlName instanceof FormControl)
      control = controlName;

    if (control == null || control === undefined)
      return emptyValue;

    if (control.value == null || control.value === undefined)
      return emptyValue;

    var value = control.value;

    if (typeof (value) == 'string' && value.length == 0)
      return emptyValue;

    if (typeof (value) == 'number' && value == 0) {
      return emptyValue;
    }

    if (typeof (value) == 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return control.value;
  }

  public valueForEnum(controlName: any): number {
    let control = null;

    if (typeof (controlName) == 'string')
      control = this.form.get(controlName);

    if (controlName instanceof FormGroup)
      control = controlName;

    if (controlName instanceof FormControl)
      control = controlName;

    if (control == null || control === undefined || control.value == null || control.value === undefined)
      return 0;

    var value = control.value;
    if (typeof (value) == 'string') {
      if (!isNaN(parseFloat(value)) && isFinite(+value)) {
        return parseInt(value);
      }
      else {
        return 0
      }
    }

    if (typeof (value) !== 'number') {
      return 0;
    }

    return control.value;
  }

  public multiValueOrEmpty(values: Array<string>): string {
    var output = [];

    for (var i = 0; i < values.length; i++) {
      var control = this.valueOrEmpty(values[i]);

      if (control !== "--")
        output.push(control);
    }

    return output.join(' ');
  }

  public datesOrEmpty(values: Array<any>): string {
    var output = [];
    for (var i = 0; i < values.length; i++) {
      var control = this.valueOrEmpty(values[i]);

      if (control !== "--") {
        let formattedDate = _moment(control).format('MMM Do, Y');
        output.push(formattedDate);
      }
    }

    if (output.length == 0)
      return '--';

    return output.join(' - ');
  }

  public formatSin(sin1: string, sin2: string, sin3: string): string {
    var control1 = this.valueOrEmpty(sin1);
    var control2 = this.valueOrEmpty(sin1);
    var control3 = this.valueOrEmpty(sin1);

    if (control1 == '--' || control2 == '--' || control3 == '--')
      return '--';

    return control1 + '-' + control2 + '-' + control3;
  }

  public displayMailingSubAddress(addressControl: any): string {
    let control = null;

    if (typeof (addressControl) == 'string')
      control = this.form.get(addressControl);

    if (addressControl instanceof FormGroup)
      control = addressControl;

    let line1 = control.value.line1 || '';
    let line2 = control.value.line2 || '';
    let city = control.value.city || '';
    let postalCode = control.value.postalCode || '';
    let province = control.value.province || '';
    let country = control.value.country || '';

    let address = line1 + '<br />';
    if (line2 != '')
      address += line2 + '<br />';
    if (city != '')
      address += city + '<br />';
    if (province != '')
      address += province + '<br />';
    if (country != '')
      address += country + '<br />';
    if (postalCode != '')
      address += postalCode;

    return address;
  }

  public displayMailingAddress(addressControl: any): string {
    let control = null;

    if (typeof (addressControl) == 'string')
      control = this.form.get(addressControl);

    if (addressControl instanceof FormGroup)
      control = addressControl;

    if (control == null || control === undefined)
      return "--";

    let line1 = control.get('line1').value || '';
    let line2 = control.get('line2').value || '';
    let city = control.get('city').value || '';
    let postalCode = control.get('postalCode').value || '';
    let province = control.get('province').value || '';
    let country = control.get('country').value || '';

    let address = line1 + '<br />';
    if (line2 != '')
      address += line2 + '<br />';
    if (city != '')
      address += city + '<br />';
    if (province != '')
      address += province + '<br />';
    if (country != '')
      address += country + '<br />';
    if (postalCode != '')
      address += postalCode;

    return address;
  }

  getOptionSetNameFromVal(optionSet, val: any) {
    let ret = Object.values(optionSet).find((o) => o["val"] == val);
    return ret ? ret["name"] : "--";
  }

  public trimValue(control: FormControl) {
    const value = control.value;
    control.setValue('');
    control.setValue(value.trim());
  }

  public trimEmail(control: AbstractControl) {
    const value = control.value;
    control.setValue('');
    control.setValue(value.trim());
  }

  markAsTouched() {
    this.form.markAsTouched();
  }

  gotoPage(selectPage: MatStepper): void {
    console.log("goto page");
    console.log(this.form);
    window.scroll(0, 0);
    this.showValidationMessage = false;
    this.currentFormStep = selectPage.selectedIndex;
    if (this.currentFormStep > this.max_selected_index) this.max_selected_index = this.currentFormStep;
  }

  gotoNextStep(stepper: MatStepper, emptyPage?: boolean): void {
    if (stepper) {
      const desiredFormIndex: number = stepper.selectedIndex;
      const step_header = stepper._stepHeader.find(step => step.index == desiredFormIndex);
      const step_label = step_header ? step_header.label : "";
      const this_step = stepper._steps.find(step => step.label == step_label);
      if (this_step) {
        const formGroupName = this_step.stepControl.get("name").value;
        console.log(`Form for validation is ${formGroupName}.`);
        const formParts = this.form.get(formGroupName);
        console.log(this.form);

        let formValid = true;

        if (formParts != null) {
          formValid = formParts.valid;
          console.log(_.cloneDeep(formParts));
        } else {
          alert('That was a null form. Nothing to validate');
        }

        if (emptyPage != null) {
          if (emptyPage == true) {
            formValid = true;
          }
        }

        if (formValid) {
          console.log('Form is valid so proceeding to next step.');
          this.showValidationMessage = false;
          window.scroll(0, 0);
          stepper.next();
        } else {
          console.log('Form is not valid rerun the validation and show the validation message.');
          this.validateAllFormFields(formParts);
          this.showValidationMessage = true;
        }
      }
    }
  }

  gotoPreviousStep(stepper: MatStepper): void {
    if (stepper) {
      console.log('Going back a step');
      this.showValidationMessage = false;
      window.scroll(0, 0);
      stepper.previous();
    }
  }

  copyPersonalContactInfoToVictim(form: FormGroup | FormArray) {
    let copyInfo = form.get('victimInformation.victimSameContactInfo').value === true;
    let target = form.get('victimInformation');
    let source = form.get('personalInformation');
    let options = { onlySelf: true, emitEvent: true };

    if (copyInfo) {
      target.get('phoneNumber').patchValue(source.get('phoneNumber').value, options);
      target.get('alternatePhoneNumber').patchValue(source.get('alternatePhoneNumber').value, options);
      target.get('email').patchValue(source.get('email').value, options);
      target.get('confirmEmail').patchValue(source.get('confirmEmail').value, options);

      target.get('phoneNumber').setErrors(null, options);
      target.get('alternatePhoneNumber').setErrors(null, options);
      target.get('email').setErrors(null, options);
      target.get('confirmEmail').setErrors(null, options);

      target.get('phoneNumber').disable(options);
      target.get('alternatePhoneNumber').disable(options);
      target.get('email').disable(options);
      target.get('confirmEmail').disable(options);
    }
    else {
      target.get('phoneNumber').enable(options);
      target.get('alternatePhoneNumber').enable(options);
      target.get('email').enable(options);
      target.get('confirmEmail').enable(options);
    }

    target.get('phoneNumber').updateValueAndValidity(options);
    target.get('alternatePhoneNumber').updateValueAndValidity(options);
    target.get('email').updateValueAndValidity(options);
    target.get('confirmEmail').updateValueAndValidity(options);
  }

  copyPersonalAddressToVictimAddress(form: FormGroup | FormArray) {
    let copyAddress = form.get('victimInformation.mostRecentMailingAddressSameAsPersonal').value === true;
    let target = form.get('victimInformation.primaryAddress');
    let source = form.get('personalInformation.primaryAddress');
    let options = { onlySelf: true, emitEvent: true };

    if (copyAddress) {
      target.get('line1').patchValue(source.get('line1').value, options);
      target.get('line2').patchValue(source.get('line2').value, options);
      target.get('city').patchValue(source.get('city').value, options);
      target.get('postalCode').patchValue(source.get('postalCode').value, options);
      target.get('province').patchValue(source.get('province').value, options);
      target.get('country').patchValue(source.get('country').value, options);

      target.get('line1').setErrors(null, options);
      target.get('line2').setErrors(null, options);
      target.get('city').setErrors(null, options);
      target.get('postalCode').setErrors(null, options);
      target.get('province').setErrors(null, options);
      target.get('country').setErrors(null, options);

      target.get('line1').disable(options);
      target.get('line2').disable(options);
      target.get('city').disable(options);
      target.get('postalCode').disable(options);
      target.get('province').disable(options);
      target.get('country').disable(options);
    }
    else {
      target.get('line1').enable(options);
      target.get('line2').enable(options);
      target.get('city').enable(options);
      target.get('postalCode').enable(options);
      target.get('province').enable(options);
      target.get('country').enable(options);
    }

    target.get('line1').updateValueAndValidity(options);
    target.get('line2').updateValueAndValidity(options);
    target.get('city').updateValueAndValidity(options);
    target.get('postalCode').updateValueAndValidity(options);
    target.get('province').updateValueAndValidity(options);
    target.get('country').updateValueAndValidity(options);
  }

  copyPersonalAddressToRepresentativeAddress(form: FormGroup | FormArray) {
    let copyAddress = form.get('representativeInformation.mostRecentMailingAddressSameAsPersonal').value === true;
    let target = form.get('representativeInformation.representativeAddress');
    let source = form.get('personalInformation.primaryAddress');
    let options = { onlySelf: true, emitEvent: true };

    if (copyAddress) {
      target.get('line1').patchValue(source.get('line1').value, options);
      target.get('line2').patchValue(source.get('line2').value, options);
      target.get('city').patchValue(source.get('city').value, options);
      target.get('postalCode').patchValue(source.get('postalCode').value, options);
      target.get('province').patchValue(source.get('province').value, options);
      target.get('country').patchValue(source.get('country').value, options);

      target.get('line1').setErrors(null, options);
      target.get('line2').setErrors(null, options);
      target.get('city').setErrors(null, options);
      target.get('postalCode').setErrors(null, options);
      target.get('province').setErrors(null, options);
      target.get('country').setErrors(null, options);

      target.get('line1').disable(options);
      target.get('line2').disable(options);
      target.get('city').disable(options);
      target.get('postalCode').disable(options);
      target.get('province').disable(options);
      target.get('country').disable(options);
    }
    else {
      target.get('line1').enable();
      target.get('line2').enable();
      target.get('city').enable();
      target.get('postalCode').enable();
      target.get('province').enable();
      target.get('country').enable();
    }

    target.get('line1').updateValueAndValidity(options);
    target.get('line2').updateValueAndValidity(options);
    target.get('city').updateValueAndValidity(options);
    target.get('postalCode').updateValueAndValidity(options);
    target.get('province').updateValueAndValidity(options);
    target.get('country').updateValueAndValidity(options);
  }

  copyPersonalContactInfoToRepresentative(form: FormGroup | FormArray) {
    let copyInfo = form.get('representativeInformation.applicantSameContactInfo').value === true;
    let target = form.get('representativeInformation');
    let source = form.get('personalInformation');
    let options = { onlySelf: true, emitEvent: true };

    if (copyInfo) {
      target.get('representativePhoneNumber').patchValue(source.get('phoneNumber').value, options);
      target.get('representativeAlternatePhoneNumber').patchValue(source.get('alternatePhoneNumber').value, options);
      target.get('representativeEmail').patchValue(source.get('email').value, options);
      target.get('representativeConfirmEmail').patchValue(source.get('confirmEmail').value, options);

      target.get('representativePhoneNumber').setErrors(null, options);
      target.get('representativeAlternatePhoneNumber').setErrors(null, options);
      target.get('representativeEmail').setErrors(null, options);
      target.get('representativeConfirmEmail').setErrors(null, options);

      target.get('representativePhoneNumber').disable(options);
      target.get('representativeAlternatePhoneNumber').disable(options);
      target.get('representativeEmail').disable(options);
      target.get('representativeConfirmEmail').disable(options);
    }
    else {
      target.get('representativePhoneNumber').enable();
      target.get('representativeAlternatePhoneNumber').enable();
      target.get('representativeEmail').enable();
      target.get('representativeConfirmEmail').enable();
    }

    target.get('representativePhoneNumber').updateValueAndValidity(options);
    target.get('representativeAlternatePhoneNumber').updateValueAndValidity(options);
    target.get('representativeEmail').updateValueAndValidity(options);
    target.get('representativeConfirmEmail').updateValueAndValidity(options);
  }

  setControlValidators(control: AbstractControl | FormControl, newValidator: ValidatorFn | ValidatorFn[], options = { onlySelf: false, emitEvent: true }) {
    control.setValidators(newValidator);
    control.updateValueAndValidity(options);
  }

  clearControlValidators(control: AbstractControl | FormControl, options = { onlySelf: false, emitEvent: true }) {
    control.setErrors(null, options);
    control.clearValidators();
    control.updateValueAndValidity(options);
  }
}
