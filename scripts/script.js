const formSubmitButton = document.querySelector('#form-submit-btn');
const phoneControlError = document.querySelector('#phone-error-container');
const ukrainianPhoneNumberMask = '+38 (0__) - ___ - __ - __';
const polishPhoneNumberMask = '+48 - __ - ___ - __ - __';
const data = JSON.parse(localStorage.getItem('data')) ?? [];
const requiredPhoneValidator = (controlRef) => {
    return controlRef.addEventListener('blur', (event) => {
        const doesControlValid = !!Number.isInteger(+event.target.value[event.target.value.length - 1]);

        doesControlValid ? formSubmitButton.removeAttribute('disabled') : formSubmitButton.setAttribute('disabled', '');
        phoneControlError.innerText = doesControlValid ? '' : 'Це поле обов`язкове для заповнення.';
    })
}
const additionalPhoneControlValidators = [requiredPhoneValidator];
const smartTableColDef = [
    { id: 1, headerText: 'ID', propertyName: 'id' },
    { id: 2, headerText: 'Номер телефону', propertyName: 'phoneNumber' },
    { id: 3, headerText: 'Стать', propertyName: 'gender' },
];

const smartForm = new SmartForm('.smart-form',  (data) => smartTable.addRow(data))
const smartTable = new SmartTableWithControls('.smart-table', smartTableColDef, true, '.smart-table-delete-button', '.smart-table-duplicate-button');
const smartPhoneControl = new SmartPhoneControl('.smart-phone-control', ukrainianPhoneNumberMask, additionalPhoneControlValidators);

smartTable.setRowData(data);

addEventListener('beforeunload', () => localStorage.setItem('data', JSON.stringify(smartTable.rowData)));