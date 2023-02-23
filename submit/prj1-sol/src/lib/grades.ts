import * as C from './course-info.js';
import * as G from './grade-table.js';
import { okResult, errResult, ErrResult, Result } from 'cs544-js-utils';
import { brotliCompressSync } from 'zlib';
import { createHistogram } from 'perf_hooks';
import { privateEncrypt } from 'crypto';

export default function makeGrades(course: C.CourseInfo): G.Grades {
  return GradesImpl.make(course);
}

type RawRowsMap = { [rowId: string]: G.RawRow };

class GradesImpl implements C.CourseObj, G.Grades {
  readonly course: C.CourseInfo;
  readonly #colIds: Set<string>;
  readonly #rawRowsMap: RawRowsMap;
  #fullTable: G.FullTable;

  static make(course: C.CourseInfo): G.Grades {
    return new GradesImpl(course);
  }

  private constructor(course: C.CourseInfo, colIds: Set<string> = null,
    rawRowsMap: RawRowsMap = null) {
    //uncomment following line if no ts files shown in chrome debugger
    //debugger
    this.course = course; //course data
    this.#colIds = colIds; //current columns in table
    this.#rawRowsMap = rawRowsMap; //rawdata to add in
    this.#fullTable = null;
  }

  /** Add an empty column for colId to table. Note that this Grades
   *  object should not be changed.
   *  Errors:
   *    BAD_ARG: colId is already in table or is not a score/info/id colId
   *    for course.
   */
  addColumn(colId: string): Result<G.Grades> {
    //errors to check if it's already in table or not a score/info/id colId
    const colProp = this.course.cols[colId];
    if (colProp === undefined) {
      return errResult(`unknown column ${colId}`, 'BAD_ARG');
    }
    if (this.#colIds && this.#colIds.has(colId)) {
      return errResult(`column ${colId} already in table`, 'BAD_ARG');
    }
    else if (colProp.kind != ('score' || 'info' || 'id')) {
      return errResult(`${colId} is a score, an info, or an id`, 'BAD_ARG');
    }
    else {
      //add new column
      const cols = this.course.cols;
      let newRawRowsMap: RawRowsMap = {};
      //create a new table
      let new_colId = new Set<string>(this.#colIds);
      new_colId.add(colId);
      //add column
      [...new_colId].sort((colId1, colId2) => cols[colId1].colIndex - cols[colId2].colIndex)
      //sort column in the order of course.info

      for (const [rowid, row] of Object.entries(this.#rawRowsMap)) {
        newRawRowsMap[rowid] = { ...row, ...{ [colId]: "" } };
      }
      //add the empty column to table

      newRawRowsMap = Object.keys(newRawRowsMap).reduce((a, b) => {
        const sorted_map = Object.entries(newRawRowsMap[b])
          .sort(([colId1], [colId2]) => cols[colId1].colIndex - cols[colId2].colIndex);
        const updated_sorted_map = Object.fromEntries(sorted_map);
        return { ...a, [b]: updated_sorted_map };
      }, {});

      //sort the table in order of course.info

      return okResult(new GradesImpl(this.course, new_colId, newRawRowsMap));

    }
  }

  /** Apply patches to table, returning the patched table.
   *  Note that this Grades object is not changed.
   *  Errors:
   *    BAD_ARG: A patch rowId or colId is not in table.
   *    RANGE: Patch data is out-of-range.
   */
  patch(patches: G.Patches): Result<G.Grades> {
    const colIds = this.#colIds; // columns
    const row_id = Object.keys(patches); // row_ids
    let err = new ErrResult(); //error list
    //check if patch is valid
    row_id.forEach(id => {
      const patch_row = patches[id];
      if (this.#rawRowsMap.hasOwnProperty(id) === false) {
        err = err.addError("row does not exist in table", "BAD_ARG");
      }
      else {
        const patch_col_id = Object.keys(patches[id]);
        patch_col_id.forEach(col_id => {
          if (colIds.has(col_id) === false) {
            err = err.addError(`${col_id} doesn't exist`, 'BAD_ARG');
          }
          else if ((col_id != this.course.rowIdColId) && (col_id !== this.course.id)) {
            const current_col = this.course.cols[col_id];
            const patch_col = patch_row[col_id];
            //check if its not a calc
            if (current_col.kind === 'calc') {
              err = err.addError('invalud patch value', 'BAD_ARG');
            }
            //check if current col is a score
            if (current_col.kind === 'score') {
              const { min, max } = current_col;
              //check if patch value is in the range
              if (patch_col < min || patch_col > max) {
                err = err.addError('invalid patch value', 'RANGE');
              }
            }
          }
        });
        // console.log(patches[id]);
        // console.log(this.#rawRowsMap[id]);
      }
    });

    //apply the patches to the table

    let updated_raws_rows = { ... this.#rawRowsMap };
    row_id.forEach(row_id => {
      updated_raws_rows = {
        ...updated_raws_rows, [row_id]: { ...updated_raws_rows[row_id], ...patches[row_id] }
      };
    });
    // {
    //     console.log(this.#rawRowsMap[id])
    //   }
    // const colProp = this.course.cols[colId];
    // console.log(row_id);
    // console.log(colIds);
    //return errResult('TODO', 'UNIMPLEMENTED') as Result<G.Grades>;

    if (err.errors.length > 0) {
      return err;
    }
    return okResult(new GradesImpl(this.course, colIds, updated_raws_rows));
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
  upsertRow(row: G.RawRow): Result<G.Grades> {
    const cols = this.course.cols;
    const rowColIds = Object.keys(row);
    const colIds = (this.#colIds) ? this.#colIds : new Set<string>(rowColIds);
    const addColIds = rowColIds.filter(colId => !colIds.has(colId));
    const missColIds =
      [...colIds].filter(colId => rowColIds.indexOf(colId) < 0);
    let err = new ErrResult();
    //console.log(colIds, "1", rowColIds , "2", addColIds, "3", missColIds, "4");
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
        const { min, max } = colProp;
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
    if (err.errors.length > 0) {
      return err;
    }
    else {
      const row1Pairs = Object.keys(row)
        .sort((colId1, colId2) => cols[colId1].colIndex - cols[colId2].colIndex)
        .map(colId => [colId, row[colId]]);
      //console.log(row1Pairs);
      const row1 = Object.fromEntries(row1Pairs);
      const rawRowsMap = { ...this.#rawRowsMap, ...{ [rowId]: row1 } };
      return okResult(new GradesImpl(this.course, colIds, rawRowsMap));
    }

  } //upsertRow

  //TODO: add auxiliary private methods as needed
}

//TODO: add auxiliary functions as needed
