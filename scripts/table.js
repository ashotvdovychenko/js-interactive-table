class SmartTable {
    #tableContainerRef;
    #tableHeaderRef;
    #tableBodyRef;
    #colDef;

    constructor(selector, colDef) {
        this.#tableContainerRef = document.querySelector(selector);
        this.#colDef = colDef;

        this.#tableHeaderRef = this.#getTableHeaderRef(colDef);
        this.#tableBodyRef = this.#getTableBodyRef();

        this.#drawTable(this.#tableBodyRef, this.#tableHeaderRef);
    }

    get rowData() {
        return [...this.#tableBodyRef.children].map(row => {
            return [...row.children]
                .reduce((acc, col, i) => {
                    acc[this.#colDef[i].propertyName] = col.textContent;

                    return acc;
                }, {});
        });
    }

    get tableHeaderRef() {
        return this.#tableHeaderRef;
    }

    get tableBodyRef() {
        return this.#tableBodyRef;
    }

    get colDef() {
        return this.#colDef
    }

    setRowData(data) {
        for (let row of data) {
            const rowRef = this.#getRowRef();
            rowRef.dataset.id = row.id;

            for (let col of this.#colDef) {
                const columnRef = document.createElement('td');

                columnRef.textContent = row[col.propertyName];

                rowRef.appendChild(columnRef);
            }

            this.#tableBodyRef.appendChild(rowRef);
        }
    }

    addRow(row) {
        const rowRef = this.#getRowRef();
        rowRef.dataset.id = row.id;

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

    duplicateRow(id) {
        const rowData = this.rowData.find(data => data.id === id);
        rowData.id = new Date().getTime();
        this.addRow(rowData)
    }

    #getTableBodyRef() {
        return document.createElement('tbody');
    }

    #getRowRef() {
        return document.createElement('tr');
    }

    #getTableHeaderRef(colDef) {
        const theadRef = document.createElement('thead');
        const rowRef = document.createElement('tr')

        for (let col of colDef) {
            const columnRef = document.createElement('th')
            columnRef.textContent = col.headerText;
            rowRef.appendChild(columnRef)
        }

        theadRef.appendChild(rowRef);

        return theadRef;
    }

    #drawTable(bodyRef, headerRef) {
        this.#tableContainerRef.innerHTML = '';
        this.#tableContainerRef.appendChild(bodyRef);
        this.#tableContainerRef.appendChild(headerRef);
    }
}

class SmartSelectableTable extends SmartTable {

    constructor(selector, colDef) {
        super(selector, colDef);
        this.#addHeaderControlCol();
    }

    get rowData() {
        return [...this.tableBodyRef.children].map(row => {
            return [...row.children]
                .slice(1)
                .reduce((acc, col, i) => {
                    acc[this.colDef[i].propertyName] = col.textContent;

                    return acc;
                }, {});
        });
    }

    get getSelectedRows() {
        return [...this.tableBodyRef.children]
            .filter(rowRef => {
                const checkboxRef = rowRef.querySelector('input[type="checkbox"]');

                return checkboxRef.checked;
            })
            .map(rowRef => this.rowData.find(row => row.id === rowRef.dataset.id));
    }

    setRowData(data) {
        super.setRowData(data);
        for (let rowRef of this.tableBodyRef.childNodes) {
            const columnRef = this.#getSelectControlColRef();
            rowRef.insertBefore(columnRef, rowRef.firstChild);
        }
        this.#registerCheckbox();
    }

    addRow(row) {
        super.addRow(row);

        const tableSelectAllControl = document.querySelector('thead input[type="checkbox"]');
        const rowRef = this.tableBodyRef.lastChild;
        const columnRef = this.#getSelectControlColRef();
        rowRef.insertBefore(columnRef, rowRef.firstChild);

        this.#registerCheckbox();
        if(tableSelectAllControl.checked){
            tableSelectAllControl.indeterminate = true;
        }
    }

    removeSelectedRows() {
        const tableSelectAllControl = document.querySelector('thead input[type="checkbox"]');

        this.getSelectedRows.forEach(selectedRow => this.removeRow(selectedRow.id));
        tableSelectAllControl.checked = false;
        tableSelectAllControl.indeterminate = false;

    }
    duplicateSelectedRows() {
        const tableSelectAllControl = document.querySelector('thead input[type="checkbox"]');

        this.getSelectedRows.forEach(selectedRow => this.duplicateRow(selectedRow.id));
        tableSelectAllControl.indeterminate = true;
    }

    #addHeaderControlCol() {
        const rowRef = this.tableHeaderRef.firstChild;
        const columnRef = document.createElement('th')
        const checkboxRef = document.createElement('input');

        checkboxRef.type = 'checkbox';
        checkboxRef.classList.add('form-check-input');

        columnRef.appendChild(checkboxRef);
        rowRef.insertBefore(columnRef, rowRef.firstChild);

        this.#handleSelectAllControlChange(checkboxRef);
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
            [...this.tableBodyRef.children].forEach(rowRef => {
                const checkboxRef = rowRef.querySelector('input[type="checkbox"]');

                checkboxRef.checked = event.target.checked;
            })
        })
    }

    #registerCheckbox() {
        const allSelectControls = [...document.querySelectorAll('tbody input[type="checkbox"]')];

        allSelectControls.forEach(checkbox => {
            checkbox.removeEventListener('change', this.#handleCheckboxChange);
        });

        allSelectControls.forEach(checkbox => {
            checkbox.addEventListener('change', this.#handleCheckboxChange);
        });
    }

    #handleCheckboxChange() {
        const tableSelectAllControl = document.querySelector('thead input[type="checkbox"]');
        const allSelectControls = [...document.querySelectorAll('tbody input[type="checkbox"]')];

        const isAllSelected = allSelectControls.every(control => control.checked);
        const isAnySelected = allSelectControls.some(control => control.checked);

        if (isAllSelected) {
            tableSelectAllControl.checked = true;
            tableSelectAllControl.indeterminate = false;
        } else if(isAnySelected){
            tableSelectAllControl.indeterminate = true;
        }else {
            tableSelectAllControl.checked = false;
            tableSelectAllControl.indeterminate = false;
        }
    }
}