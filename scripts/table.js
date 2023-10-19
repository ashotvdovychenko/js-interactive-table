// TODO: Extract selection logic in separate child class to keep Single Responsibility Principle for SmartTable and avoid GOD object;
class SmartTable {
    #tableContainerRef;
    #tableHeaderRef;
    #tableBodyRef;
    #colDef;
    #selectable;

    constructor(selector, colDef, selectable = true) {
        this.#tableContainerRef = document.querySelector(selector);
        this.#colDef = colDef;
        this.#selectable = selectable;

        this.#tableHeaderRef = this.#getTableHeaderRef(colDef, selectable);
        this.#tableBodyRef = this.#getTableBodyRef();

        this.#drawTable(this.#tableBodyRef, this.#tableHeaderRef);
    }

    get rowData() {
        return [...this.#tableBodyRef.children].map(row => {
            return [...row.children]
                .slice(this.#selectable ? 1 : 0)
                .reduce((acc, col, i) => {
                    acc[this.#colDef[i].propertyName] = col.textContent;

                    return acc;
                }, {});
        });
    }

    get getSelectedRows() {
        if (this.#selectable) {
            return [...this.#tableBodyRef.children]
                .filter(rowRef => {
                    const checkboxRef = rowRef.querySelector('input[type="checkbox"]');

                    return checkboxRef.checked;
                })
                .map(rowRef => this.rowData.find(row => row.id === rowRef.dataset.id));
        }

        return []
    }

    setRowData(data) {
        for (let row of data) {
            const rowRef = document.createElement('tr');

            rowRef.dataset.id = row.id;

            if (this.#selectable) {
                const columnRef = document.createElement('th')
                const checkboxRef = document.createElement('input');

                checkboxRef.type = 'checkbox';
                checkboxRef.classList.add('form-check-input');

                columnRef.appendChild(checkboxRef);
                rowRef.appendChild(columnRef);
            }

            for (let col of this.#colDef) {
                const columnRef = document.createElement('td');

                columnRef.textContent = row[col.propertyName];

                rowRef.appendChild(columnRef);
            }

            this.#tableBodyRef.appendChild(rowRef);
        }
    }

    addRow(row) {
        const rowRef = document.createElement('tr');
        rowRef.dataset.id = row.id;

        if (this.#selectable) {
            const columnRef = this.#getSelectControlColRef();

            rowRef.appendChild(columnRef);
        }

        for (let col of this.#colDef) {
            const columnRef = document.createElement('td');

            columnRef.textContent = row[col.propertyName];

            rowRef.appendChild(columnRef);
        }

        this.#tableBodyRef.appendChild(rowRef);
    }

    removeRow(id) {
        this.#tableBodyRef.querySelector(`tr[data-id='${id}']`).remove();
    }

    #getTableBodyRef() {
        return document.createElement('tbody');
    }

    #getTableHeaderRef(colDef, selectable) {
        const theadRef = document.createElement('thead');
        const rowRef = document.createElement('tr')

        if (selectable) {
            const columnRef = document.createElement('th')
            const checkboxRef = document.createElement('input');

            checkboxRef.type = 'checkbox';
            checkboxRef.classList.add('form-check-input');

            columnRef.appendChild(checkboxRef);
            rowRef.appendChild(columnRef);

            this.#handleSelectAllControlChange(checkboxRef);
        }

        for (let col of colDef) {
            const columnRef = document.createElement('th')
            columnRef.textContent = col.headerText;
            rowRef.appendChild(columnRef)
        }

        theadRef.appendChild(rowRef);

        return theadRef;
    }

    #getSelectControlColRef() {
        const columnRef = document.createElement('th');
        const checkboxRef = document.createElement('input');

        checkboxRef.type = 'checkbox';
        checkboxRef.classList.add('form-check-input');

        columnRef.appendChild(checkboxRef);

        return columnRef;
    }

    #handleSelectAllControlChange(controlRef) {
        controlRef.addEventListener('change', (event) => {
            [...this.#tableBodyRef.children].forEach(rowRef => {
                const checkboxRef = rowRef.querySelector('input[type="checkbox"]');

                checkboxRef.checked = event.target.checked;
            })
        })
    }

    #drawTable(bodyRef, headerRef) {
        this.#tableContainerRef.innerHTML = '';
        this.#tableContainerRef.appendChild(bodyRef);
        this.#tableContainerRef.appendChild(headerRef);
    }
}

class SmartTableWithControls extends SmartTable {
    #deleteButtonRef;
    #duplicateButtonRef;

    constructor(selector, colDef, selectable = true, deleteButtonSelector, duplicateButtonSelector) {
        super(selector, colDef, selectable);
        this.#deleteButtonRef = document.querySelector(deleteButtonSelector);
        this.#duplicateButtonRef = document.querySelector(duplicateButtonSelector);

        this.#handleDeleteButtonClick();
        this.#handleDuplicateButtonClick();
    }

    #handleDeleteButtonClick() {
        this.#deleteButtonRef.addEventListener('click', () => {
            this.getSelectedRows.forEach(selectedRow => this.removeRow(selectedRow.id))
        })
    }

    #handleDuplicateButtonClick() {
        this.#duplicateButtonRef.addEventListener('click', () => {
            this.getSelectedRows.forEach(selectedRow => {
                const duplicatedRow = { ...selectedRow };

                duplicatedRow.id = new Date().getTime();

                this.addRow(duplicatedRow);
            })
        })
    }
}

// tableSelectAllControl.addEventListener('click', (event) => {
//     const tableCheckboxRefs = document.querySelectorAll('.table-status-checkbox');
//
//     tableCheckboxRefs.forEach(tableCheckboxRef => {
//         tableCheckboxRef.checked = event.target.checked;
//     });
// })


// function registerCheckbox() {
//     const allSelectControls = document.querySelectorAll('.table-status-checkbox');
//
//     allSelectControls.forEach(control => control.addEventListener('click', () => {
//         const isAllSelected = [...allSelectControls].every(control => control.checked)
//         const isAllDeselected = [...allSelectControls].every(control => !control.checked);
//
//         if (tableSelectAllControl.checked && isAllDeselected) {
//             tableSelectAllControl.checked = false;
//             tableSelectAllControl.indeterminate = false;
//         } else if (isAllSelected) {
//             tableSelectAllControl.checked = true;
//             tableSelectAllControl.indeterminate = false;
//         } else {
//             tableSelectAllControl.indeterminate = true;
//         }
//     }))
// }