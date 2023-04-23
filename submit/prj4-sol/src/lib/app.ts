import { CourseInfo as C, GradeTable as G, GradesImpl, COURSES, GradeTable }
    from 'cs544-prj1-sol';

import { Err, Result, okResult, errResult } from 'cs544-js-utils';

/** factory function to create an App and take care of any
 *  asynchronous initialization.
 */
export default async function makeApp(url: string) {
    const app = new App(url);
    // TODO: add any async initialization
}


class App {
    private courseIdSelect: HTMLSelectElement;
    private studentIdInput: HTMLInputElement;
    private showStatsCheckbox: HTMLInputElement;
    private gradesForm: HTMLFormElement;
    private webServiceUrl: string;
    private gradesTable: HTMLTableElement;
    private errors: HTMLElement;

    constructor(wsUrl: string) {
        this.courseIdSelect = document.querySelector('#course-id') as HTMLSelectElement;
        this.studentIdInput = document.querySelector('#student-id') as HTMLInputElement;
        this.showStatsCheckbox = document.querySelector('#show-stats') as HTMLInputElement;
        this.gradesForm = document.querySelector('#grades-form') as HTMLFormElement;
        this.gradesTable = document.querySelector('#grades') as HTMLTableElement;
        this.webServiceUrl = wsUrl;
        this.errors = document.querySelector('#errors') as HTMLElement;


        // Fill out the Course widget with options
        const courseOptions = coursesOptions();
        courseOptions.forEach(option => {
            this.courseIdSelect.append(option);
        });

        // Set up submission handler for #grades-form
        this.gradesForm.addEventListener('submit', ev => {
            ev.preventDefault();
            // TODO: handle form submission
        });
        this.changeHandler();

        // Set up change handlers for the form widgets
        this.courseIdSelect.addEventListener('change', this.changeHandler);
        this.studentIdInput.addEventListener('change', this.changeHandler);
        this.showStatsCheckbox.addEventListener('change', this.changeHandler);
    }
    private clearGradesTable() {
        this.gradesTable.innerHTML = ''; // Clear the contents of the table
    }
    private changeHandler = () => {
        //console.log('Form data changed');
        const courseId = this.courseIdSelect.value;
        const studentId = this.studentIdInput.value;
        const showStats = this.showStatsCheckbox.checked;
        // Clear errors
        this.errors.innerHTML = '';
        if (this.gradesTable) {
            this.clearGradesTable();
        }
        const grade_data = this.handleFormSubmission(courseId, studentId);
        // Updated to use instance method
        if (okResult(grade_data).isOk) {
            // Successful request, clear out any earlier errors
            this.errors.innerHTML = '';
            //console.log(okResult(grade_data).isOk);
            //console.log(Object.values(okResult(grade_data).val)[1]);
            grade_data.then(result => {
                if (!result.isOk) {
                    // Handle error
                    const errorListItem = makeElement('li', {}, `no row for rowId '${studentId}'`);
                    this.errors.append(errorListItem);

                } else {
                    // Extract data from result
                    const data = result;
                    // console.table(Object.values(okResult(data).val)[1].getRawTable());
                    // const gradesTable = document.querySelector('#grade_table');
                    //const data = result;
                    const gradesTableData = Object.values(okResult(data).val)[1].getFullTable();
                    if (showStats === false) {
                        const data_table = Object.values(okResult(data).val)[1].getRawTable();
                        //console.log(gradesTableData[0]);
                        const headerRow = makeElement('tr');
                        const headers = data_table[0];
                        //console.log(headers);
                        for (const key of Object.keys(headers)) {
                            // Create a header cell element with the key as the content
                            const headerCell = makeElement('th', {}, key);
                            // Append the header cell element to the appropriate parent element, e.g., headerRow
                            headerRow.append(headerCell);
                        }
                        this.gradesTable.append(headerRow);
                        for (const field of data_table) {
                            const dataRow = makeElement('tr');
                            for (const key of Object.keys(field)) {
                                //console.log(key);
                                let value = field[key]; // Access the value of each field using the key
                                if (typeof (value) === 'number') {
                                    value = value.toFixed(1);
                                    value = value.toString();
                                }

                                // Create a data cell element with the value as the content
                                const dataCell = makeElement('td', {}, value);
                                //console.log(dataCell);
                                // Append the data cell element to the appropriate parent element, e.g., dataRow
                                dataRow.append(dataCell);
                            }
                            this.gradesTable.append(dataRow);
                        }
                    }
                    else {

                        const full_table = Object.values(okResult(data).val)[1].getFullTable();
                        //console.log(gradesTableData[0]);
                        const headerRow = makeElement('tr');
                        const headers = full_table[0];
                        //console.log(headers);
                        for (const key of Object.keys(headers)) {
                            // Create a header cell element with the key as the content
                            const headerCell = makeElement('th', {}, key);
                            // Append the header cell element to the appropriate parent element, e.g., headerRow
                            headerRow.append(headerCell);
                        }
                        this.gradesTable.append(headerRow);
                        for (const field of full_table) {
                            const dataRow = makeElement('tr');
                            for (const key of Object.keys(field)) {
                                //console.log(key);
                                let value = field[key]; // Access the value of each field using the key
                                if (typeof (value) === 'number') {
                                    value = value.toFixed(1);
                                    value = value.toString();
                                }

                                // Create a data cell element with the value as the content
                                const dataCell = makeElement('td', {}, value);
                                //console.log(dataCell);
                                // Append the data cell element to the appropriate parent element, e.g., dataRow
                                dataRow.append(dataCell);
                            }
                            this.gradesTable.append(dataRow);
                        }
                        //console.log(gradesTableData);
                    }

                    // ... Do something with the data ...
                }
            })
                .catch(error => {
                    // Handle error
                    console.error(error);
                });
            // TODO: handle form data change
        }
        else {
            console.log("Error");
        };
    }

    private async handleFormSubmission(courseId: string, studentId: string): Promise<Result<G.Grades>> {
        // Fetch grades data from web service


        try {
            const response =
                await fetch(`${this.webServiceUrl}/grades/${courseId}/${studentId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            if (response.ok) {
                const data = await response.json();
                if (data.errors) {
                    return errResult(data.errors);
                    //console.log(data);
                }
                else {
                    //console.log(data);
                    const raw_row = data.result as G.RawRow[];
                    //console.log(raw_row);
                    //const grade = { ...raw_table.values };
                    //console.log(grade);
                    //console.log(raw_table);
                    // Convert data to Grades object using GradesImpl.makeGradesWithData()
                    return GradesImpl.makeGradesWithData(courseId, raw_row);
                    //const table = (Object.values(okResult(grades).val)[1]);
                    //console.log(grades.getfullTable());
                    // TODO: Handle success result
                }
            }
        }
        catch (error) {
            // Handle fetch error
            // TODO: Handle fetch error
        }
        return errResult('error', 'DB');
    }


    //TODO: add methods/data as necessary.
}
// TODO: add auxiliary functions / classes.

/** Return list of <option> elements for each course in COURSES with the
 *  value attribute of each element set to the courseId and the
 *  text set to the course name.
 */
function coursesOptions() {
    return Object.entries(COURSES).map(([courseId, courseInfo]) => {
        const descr = `${courseId}: ${courseInfo.name}`;
        return makeElement('option', { value: courseId }, descr);
    });
}

/** return object mapping widget names from form to their values */
function getFormData(form: HTMLFormElement): { [name: string]: string } {
    const data = [... (new FormData(form).entries())]
        .map(([k, v]: [string, string]) => [k, v]);
    return Object.fromEntries(data);
}

/** Return a new DOM element with specified tagName, attributes
 *  given by object attrs and contained text.
 */
function makeElement(tagName: string, attrs: { [attr: string]: string } = {},
    text = '')
    : HTMLElement {
    const element = document.createElement(tagName);
    for (const [k, v] of Object.entries(attrs)) {
        element.setAttribute(k, v);
    }
    if (text.length > 0) element.append(text);
    return element;
}




