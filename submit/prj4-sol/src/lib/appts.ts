import { CourseInfo as C, GradeTable as G, GradesImpl, COURSES }
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
  private courseWidget: HTMLSelectElement;
  private gradesForm: HTMLFormElement;
  private studentIdInput: HTMLInputElement;
  private showStatsCheckbox: HTMLInputElement;
  private wsUrl: string;

  constructor(wsUrl: string) {
    // this.wsUrl = wsUrl;
    this.courseWidget = document.getElementById('course-id') as HTMLSelectElement;
    this.gradesForm = document.getElementById('grades-form') as HTMLFormElement;
    this.studentIdInput = document.getElementById('student-id') as HTMLInputElement;
    this.showStatsCheckbox = document.getElementById('show-stats') as HTMLInputElement;


    // Append options to the course widget
    const courses = coursesOptions();
    for (const option of courses) {
      this.courseWidget.appendChild(option);
    }

    // Set up submission handler for the grades form
    this.gradesForm.addEventListener('submit', (ev: Event) => {
      ev.preventDefault();
    });

    // // Set up change handler for course, student, and show stats widgets
    //async (ev: Event) => {
    //   //console.log('test');
    //   // TODO: Handle widget changes
    //   const formData = getFormData(this.gradesForm);
    //   const courseId = formData['course-id'];
    //   const studentId = formData['student-id'];
    //   const showStats = formData['show-stats'];

    //   const result = await this.fetchCourseGrades(courseId);
    //   console.log(result);
    // };

    this.courseWidget.addEventListener('change', this.changeHandler);
    this.studentIdInput.addEventListener('change', this.changeHandler);
    this.showStatsCheckbox.addEventListener('change', this.changeHandler);
  }
  private changeHandler = async (ev: Event) => {
    // TODO: Handle widget changes
    const formData = getFormData(this.gradesForm);
    const courseId = formData['course-id'];
    const studentId = formData['student-id'];
    const showStats = formData['show-stats'];

    console.log(`Course ID: ${courseId}`);
    console.log(`Student ID: ${studentId}`);
    console.log(`Show Stats: ${showStats}`);

    // Example logic: Fetch course grades based on selected courseId
    // const result = await this.fetchCourseGrades(courseId);
    // console.log(result);
  }



  // async fetchCourseGrades(courseId: string) {
  //   try {
  //     // Define fetch options
  //     const url = `${this.wsUrl}/grades/${courseId}/`;
  //     const method = 'GET';
  //     const headers = {
  //       'Content-Type': 'application/json',
  //     };

  //     // Make HTTP request to fetch course grades data
  //     const response = await fetch(url, {
  //       method,
  //       headers,
  //     });
  //     const json = await response.json();
  //     console.log(json);

  // Check if response is successful
  //   if (response.ok) {
  //     // Extract raw table data from JSON response
  //     const rawData: G.RawTable = json.data;
  //     console.log(json.data);

  //     // Create Grades object with raw table data using GradesImpl.makeGradesWithData()
  //     const grades = GradesImpl.makeGradesWithData(courseId, rawData);

  //     // Return success result with Grades object
  //     return grades;
  //   } else {
  //     // Return error result with error message from JSON response
  //     return errResult(json.error);
  //   }
  // } catch (error) {
  //   // Return error result with error message
  //   return errResult(error.message);
  // }
}
//TODO: add methods/data as necessary.

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




