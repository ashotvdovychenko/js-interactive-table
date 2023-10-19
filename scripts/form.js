
class SmartControl {
    #controlRef

    constructor(selector, initialValue, additionalValidators = []) {
        this.#controlRef = document.querySelector(selector);

        this.writeValue(initialValue);

        additionalValidators.forEach(additionalValidator => additionalValidator(this.#controlRef));
    }

    get value() {
        return this.#controlRef.value;
    }

    get control() {
        return this.#controlRef;
    }

    writeValue(value) {
        this.#controlRef.setAttribute("value", value);
    }
}

class SmartPhoneControl extends SmartControl{
    #controlMask;

    constructor(selector, mask, additionalValidators = []) {
        super(selector, mask, additionalValidators);
        this.#controlMask = mask;
        this.#listenControlWriteValue();
    }

    #listenControlWriteValue() {
        this.control.addEventListener('keydown', (event) => {
            event.preventDefault();

            const { target, key, keyCode } = event;
            const inputValue = target.value;
            const isNumber = keyCode > 47 && keyCode < 58;
            const isBackspace = keyCode === 8;

            if (isNumber) {
                this.control.setAttribute('value', this.#getPhoneMaskWithAddedNumber(inputValue, key));
            }

            if (isBackspace) {
                this.control.setAttribute('value', this.#getPhoneMaskWithRemovedNumber(inputValue, this.#controlMask));
            }
        }, true)
    }

    #getPhoneMaskWithAddedNumber(value, key) {
        const valueArray = [...value];
        const currentIndex = valueArray.findIndex(position => position === '_');

        valueArray[currentIndex] = key;

        return valueArray.join('');
    }

    #getPhoneMaskWithRemovedNumber(value, initialMask) {
        const valueArray = [...value];
        const currentIndex = valueArray.length - 1 - [...valueArray].reverse().findIndex(value => Number.isInteger(+value) && value !== ' ');
        const removableIndex = currentIndex === -1 ? value.length - 1 : currentIndex;

        valueArray[removableIndex] = initialMask[removableIndex];

        return valueArray.join('');
    }
}

class SmartForm {
    #formRef;
    #formControlRefs;
    #submitAction;

    constructor(selector, submitAction) {
        this.#formRef = document.querySelector(selector);
        this.#formControlRefs = [...this.#formRef.querySelectorAll('input:not([type="submit"])')];
        this.#submitAction = submitAction;

        this.#handleFormSubmit();
    }

    #handleFormSubmit() {
        this.#formRef.addEventListener('submit', (event) => {
            event.preventDefault();

            const data = this.#formControlRefs
                .filter((control) => control.type === 'radio' ? control.checked : true)
                .reduce((acc, control) => {
                    const propertyName = control.attributes.getNamedItem('name').value;

                    acc[propertyName] = control.value;

                    return acc;
                }, { id: new Date().getTime() })

            this.#submitAction(data);
        })
    }
}