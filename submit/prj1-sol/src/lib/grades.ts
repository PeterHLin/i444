import * as C from './course-info.js';
import * as G from './grade-table.js';
import { okResult, errResult, ErrResult, Result } from 'cs544-js-utils';

export default function makeGrades(course: C.CourseInfo) : G.Grades {
  return GradesImpl.make(course);
}

type RawRowsMap = { [rowId: string]:  G.RawRow }; 

class GradesImpl implements C.CourseObj, G.Grades {
  readonly course: C.CourseInfo;
  readonly #colIds: Set<string>;
  readonly #rawRowsMap: RawRowsMap;
  #fullTable: G.FullTable;

  static make(course: C.CourseInfo) : G.Grades {
    return new GradesImpl(course);
  }

  private constructor(course: C.CourseInfo, colIds: Set<string> =null,
		      rawRowsMap: RawRowsMap = null) {
    //uncomment following line if no ts files shown in chrome debugger
    //debugger 
    this.course = course;
    this.#colIds = colIds;
    this.#rawRowsMap = rawRowsMap;
    this.#fullTable = null;
  }

  /** Add an empty column for colId to table. Note that this Grades
   *  object should not be changed.
   *  Errors:
   *    BAD_ARG: colId is already in table or is not a score/info/id colId
   *    for course.
   */
  addColumn(colId: string) : Result<G.Grades> {
    return errResult('TODO', 'UNIMPLEMENTED') as Result<G.Grades>;
  }

  /** Apply patches to table, returning the patched table.
   *  Note that this Grades object is not changed.
   *  Errors:
   *    BAD_ARG: A patch rowId or colId is not in table.
   *    RANGE: Patch data is out-of-range.
   */
  patch(patches: G.Patches): Result<G.Grades> {
    return errResult('TODO', 'UNIMPLEMENTED') as Result<G.Grades>;
  }

  /** Return full table containing all computed values */
  getFullTable(): G.FullTable {
    return null; //TODO
  }

  /** Return a raw table containing the raw data.  Note that all
   *  columns in each retrieved row must be in the same order
   *  as the order specified in the course-info cols property.
   */
  getRawTable(): G.RawTable {
    return this.#colIds === null ? [] : Object.values(this.#rawRowsMap);
  }
  
  /** Upsert (i.e. insert or replace) row to table and return the new
   *  table.  Note that this Grades object should not be 
   *  modified at all.  The returned Grades may share structure with
   *  this Grades object  and row being upserted.
   *
   *  Error Codes:
   *
   *   'BAD_ARG': row specifies an unknown colId or a calc colId or
   *              contains an extra/missing colId not already in table,
   *              or is missing an id column course.colidentifying the row.
   *   'RANGE':   A kind='score' column value is out of range
   */
  upsertRow(row: G.RawRow) : Result<G.Grades> {
    const cols = this.course.cols;
    const rowColIds = Object.keys(row);
    const colIds = (this.#colIds) ? this.#colIds : new Set<string>(rowColIds);
    const addColIds = rowColIds.filter(colId => !colIds.has(colId));
    const missColIds =
      [ ...colIds ].filter(colId => rowColIds.indexOf(colId) < 0);
    let err = new ErrResult();
    //console.log(colIds, rowColIds, addColIds, missColIds);
    if (addColIds.length > 0) {
      err = err.addError(`new columns ${addColIds.join(', ')}`, 'BAD_ARG');
    }
    if (missColIds.length > 0) {
      err = err.addError(`missing columns ${missColIds.join(', ')}`, 'BAD_ARG');
    }
    let rowId: string;
    for (const [colId, val] of Object.entries(row)) {
      if (val === undefined || val === null) {
	const msg = `${colId} is ${row[colId] === null ? 'null' : 'undefined'}`;
	err = err.addError(msg, 'BAD_ARG');
      }
      const colProp = cols[colId];
      if (colProp === undefined) {
	err = err.addError(`unknown column ${colId}`, 'BAD_ARG');
      }
      else if (colProp.kind === 'id') {
	if (typeof val === 'string') rowId = val as string;
      }
      else if (colProp.kind === 'calc') {
	err = err.addError(`attempt to add data for calculated column ${colId}`,
			   'BAD_ARG');
      }
      else if (colProp.kind === 'score') {
	const {min, max} = colProp;
	const val = row[colId];
	if (typeof val === 'number' && (val < min || val > max)) {
	  const msg = `${colId} value ${val} out of range [${min}, ${max}]`;
	  err = err.addError(msg, 'RANGE');
	}
      }
    }
    if (rowId === undefined) {
      err = err.addError(`no entry for ID column ${this.course.rowIdColId}`,
			 'BAD_ARG');
    }
    if  (err.errors.length > 0) {
      return err;
    }
    else {
      const row1Pairs = Object.keys(row)
	.sort((colId1, colId2) => cols[colId1].colIndex - cols[colId2].colIndex)
	.map(colId => [colId, row[colId]]);
      const row1 = Object.fromEntries(row1Pairs);
      const rawRowsMap = { ...this.#rawRowsMap, ...{ [rowId]: row1 } };
      return okResult(new GradesImpl(this.course, colIds, rawRowsMap));
    }

  } //upsertRow

  //TODO: add auxiliary private methods as needed
}

//TODO: add auxiliary functions as needed

