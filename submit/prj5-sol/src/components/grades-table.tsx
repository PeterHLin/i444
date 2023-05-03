import React from 'react';

import { GradesWs } from '../lib/grades-ws.js';

import { CourseInfo as C, GradeTable as G, GradesImpl, COURSES }
  from 'cs544-prj1-sol';

import { Result, errResult } from 'cs544-js-utils';

type GradesTableProps = {
  ws: GradesWs,
  courseId: string,
  courseInfo: C.CourseInfo,
  grades: G.Grades,
  setResult: (result: Result<G.Grades>) => void,
};

export default function GradesTable(props: GradesTableProps) {
  const { ws, courseId, courseInfo, grades, setResult } = props;
  return <>TODO</>;
}

/* The following sub-components are based on the visual layout of
   a GradesTable:

     + A GradesTable will contain a Header and a DataTable.

     + A Header simply consists of a <tr> row containing <th> entries
       for each header.

     + A DataTable consists of a sequence of DataRow's.

     + A DataRow is a <tr> containing a sequence of <td> entries.
       Each <td> entry contains a GradeInput component or plain data
       depending on whether or not the entry should be editable.

     + A GradeInput will be a <input> widget which displays the current
       data and has change and blur handlers.  The change handler is
       used to reflect the DOM state of the <input> in the react state
       and the blur handler is used to trigger changes in the overall
       Grades component via the changeGrade prop.  
  
  Note that all the following sub-components are set up to return
  an empty fragment as a placeholder to keep TS happy.

*/

type HeaderProps = {
  hdrs: string[],
};

function Header(props: HeaderProps) {
  return <></>;
}

type DataTableProps = {
  data: G.GradeRow[],
  courseInfo: C.CourseInfo,
  changeGrade: (rowId: string, colId: string, val: string) => void,
};

function DataTable(props: DataTableProps) {
  const { data, courseInfo, changeGrade } = props;
  return <></>;
}

type DataRowProps = {
  dataRow: G.GradeRow,
  courseInfo: C.CourseInfo,
  changeGrade: (rowId: string, colId: string, val: string) => void,
};

function DataRow(props: DataRowProps) {
  const {dataRow, courseInfo, changeGrade} = props;
  return <></>;
}

type GradeInputProps = {
  rowId: string,
  colId: string,
  val: string,
  changeGrade: (rowId: string, colId: string, val: string) => void,
};

function GradeInput(props: GradeInputProps) {
  const { rowId, colId, val, changeGrade } = props;
  return <></>;
}
