import React, { useState } from 'react';

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
  const grades_data = grades.getFullTable();
  if (grades_data.length === 0) {
    return (
      <table>
        <tbody></tbody>
      </table>
    )
  }
  const header = Object.keys(grades_data[0]);
  //console.log(grades_data[1]);
  // changeGrade handler
  const changeGrade = async (rowId: string, colId: string, val: string) => {
    if (val !== '' && isNaN(Number(val))) {
      setResult(errResult('Invalid grade value: must be a number or empty string'));
      return;
    }
    const patches: G.Patches = {};
    patches[rowId] = { [colId]: val };
    //console.log(patches);
    const result = await ws.updateCourseGrades(courseId, patches).then(setResult);
    console.log(result);
  }

  return (
    <table>
      <Header hdrs={header} />
      <DataTable data={grades_data} courseInfo={courseInfo} changeGrade={changeGrade} />
    </table>
  );
  // console.log(header);
  //console.log(grades.getFullTable())
  //return <>TODO</>;

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
  const { hdrs } = props;
  return (
    <thead>
      <tr>
        {hdrs.map((hdr) => (
          <th key={hdr}>{hdr}</th>
        ))}
      </tr>
    </thead>
  );
}

type DataTableProps = {
  data: G.GradeRow[],
  courseInfo: C.CourseInfo,
  changeGrade: (rowId: string, colId: string, val: string) => void,
};

function DataTable(props: DataTableProps) {
  const { data, courseInfo, changeGrade } = props;
  return (
    <tbody>
      {data.map((row, index) => (
        <DataRow
          key={index}
          dataRow={row}
          courseInfo={courseInfo}
          changeGrade={changeGrade}
        />
      ))}
    </tbody>
  );
}

type DataRowProps = {
  dataRow: G.GradeRow,
  courseInfo: C.CourseInfo,
  changeGrade: (rowId: string, colId: string, val: string) => void,
};

function DataRow(props: DataRowProps) {
  const { dataRow, courseInfo, changeGrade } = props;
  //get cell data
  const cells = Object.entries(dataRow).map(([colId, value]) => {
    if (typeof value === 'number') {
      value = value.toFixed(1); // round to 1 decimal point
    }
    if (colId === courseInfo.rowIdColId || courseInfo.cols[colId]?.kind !== 'score') {
      // it is a non-editable cell
      return <td key={colId}>{value.toString()}</td>;
    } else {
      // it is a editable cell
      return (
        <td key={colId}>
          <GradeInput
            rowId={dataRow[courseInfo.rowIdColId].toString()}
            colId={colId}
            val={value.toString()}
            changeGrade={changeGrade}
          />
        </td>
      );
    }
  });

  return <tr>{cells}</tr>;
}

type GradeInputProps = {
  rowId: string,
  colId: string,
  val: string,
  changeGrade: (rowId: string, colId: string, val: string) => void,
};

function GradeInput(props: GradeInputProps) {
  const { rowId, colId, val, changeGrade } = props;
  const [value, setValue] = useState(props.val);
  const [prevValue, setPrevValue] = useState(props.val);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    if (value !== prevValue) {
      await changeGrade(rowId, colId, value);
    }
    setPrevValue(value);
  };

  return (
    <input type="text" value={value} onChange={handleChange} onBlur={handleBlur} />
  );
  //effects of input
}
