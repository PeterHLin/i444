import { CourseInfo as C, GradeTable as G, GradesImpl, COURSES }
  from 'cs544-prj1-sol';

import * as mongo from 'mongodb';

import { okResult, errResult, Result, OkResult } from 'cs544-js-utils';
import { makeGradesWithData } from 'cs544-prj1-sol/dist/lib/grades';
import { resourceLimits } from 'worker_threads';



export async function makeGradesDao(mongodbUrl: string)
  : Promise<Result<GradesDao>> {
  return GradesDao.make(mongodbUrl);
}

export class GradesDao {

  #client: mongo.MongoClient;
  #grades: mongo.Collection;

  private constructor(params: { [key: string]: any }) {
    //TODO
    this.#client = params.client;
    this.#grades = params.grades;
  }

  /** Factory method for constructing a GradesDao.
   */
  static async make(dbUrl: string): Promise<Result<GradesDao>> {
    const params: { [key: string]: any } = {};
    try {
      //TODO
      params.client = await (new mongo.MongoClient(dbUrl)).connect();
      const db = params.client.db();
      const grades = db.collection('grades');
      params.grades = grades;
      await grades.createIndex('courseId');
      // await grades.createIndex('');
      return okResult(new GradesDao(params));
    }
    catch (error) {
      return errResult(error.message, 'DB');
    }
  }

  /** Close this DAO. */
  async close(): Promise<Result<void>> {
    try {
      await this.#client.close();
    }
    catch (e) {
      return errResult(e.message, 'DB');
    }
  }

  /** Set grades for courseId to rawRows. 
   *  Errors:
   *   BAD_ARG: courseId is not a valid course-id.
   */
  async load(courseId: string, rawTable: G.RawTable)
    : Promise<Result<G.Grades>> {
    //TODO
    // const curr_grades = makeGradesWithData(courseId, rawTable);
    // console.log(curr_grades);
    const check_valid = checkCourseId(courseId);
    if (check_valid) {
      const result = await this.#write(courseId, rawTable);
      return result
    }
    else {
      return errResult("Invalid course id", "BAD_ARG");
    }
  }

  async #write(courseId: string, rawTable: G.RawTable): Promise<Result<G.Grades>> {
    try {
      const filter = { courseId };
      const update = { $set: { rawTable } };
      const options = { upsert: true, returnDocument: mongo.ReturnDocument.AFTER };
      const result = await this.#grades.findOneAndUpdate(filter, update, options);
      if (!result) {
        return errResult('invalid course id', 'DB');
      }
      else {
        const grades = { ...result.value.rawTable };
        return GradesImpl.makeGradesWithData(courseId, Object.values(grades));
      }
    }
    catch (e) {
      return errResult(e.message, 'DB');
    }
  }

  /** Return a Grades object for courseId. 
   *  Errors:
   *   BAD_ARG: courseId is not a valid course-id.
   */
  async getGrades(courseId: string): Promise<Result<G.Grades>> {
    //TODO
    const check_valid = checkCourseId(courseId);
    if (check_valid) {
      return this.#read(courseId);
    }
    else {
      return errResult("Invalid course id", "BAD_ARG");
    }
  }
  async #read(courseId: string): Promise<Result<G.Grades>> {
    try {
      const find_entry = await this.#grades.findOne({ courseId });
      if (find_entry) {
        const { _id, ...grades } = find_entry;
        return GradesImpl.makeGradesWithData(courseId, grades.rawTable);
      }
      else {
        return GradesImpl.makeGrades(courseId);
      }
    }
    catch (error) {
      return errResult(error.message, 'DB');
    }
  }

  /** Remove all course grades stored by this DAO */
  async clear(): Promise<Result<void>> {
    //TODO
    try {
      await this.#grades.deleteMany({});
      // {} removes all documents
      return okResult(null);
    }
    catch (error) {
      return errResult(error.message, 'DB');
    }
  }

  /** Upsert (i.e. insert or replace) row to table and return the new
   *  table.
   *
   *  Error Codes:
   *
   *   'BAD_ARG': row specifies an unknown colId or a calc colId or
   *              contains an extra/missing colId not already in table,
   *              or is missing an id column identifying the row.
   *   'RANGE':   A kind='score' column value is out of range
   */
  async upsertRow(courseId: string, row: G.RawRow): Promise<Result<G.Grades>> {
    return this.upsertRows(courseId, [row]);
  }

  /** Upsert zero-or-more rows.  Basically upsertRow() for
   *  multiple rows.   Will detect errors in multiple rows.
   */
  async upsertRows(courseId: string, rows: G.RawRow[])
    : Promise<Result<G.Grades>> {
    //TODO
    const check_valid = checkCourseId(courseId);
    if (check_valid) {
      const read_db = await this.#read(courseId);

      if (read_db.isOk === true) {
        const data =
          [
            ...read_db.val.getRawTable(),
            ...rows
          ];
        const read_data_result = read_db.val.upsertRows(data);

        if (read_data_result.isOk === true) {
          const updated_table = read_data_result.val.getRawTable();
          await this.#write(courseId, updated_table);
          return okResult(read_data_result.val);
        }
        else {
          return read_data_result;
        }
      }

    }
    else {
      return errResult("Invalid course id", "BAD_ARG");
    }


  }

  /** Add an empty column for colId to table.
   *  Errors:
   *    BAD_ARG: colId is already in table or is not a score/info/id colId
   *    for course.
   */
  async addColumn(courseId: string, colId: string): Promise<Result<G.Grades>> {
    return this.addColumns(courseId, colId);
  }

  /** Add empty columns for colId in colIds to table.
   *  Errors:
   *    BAD_ARG: colId is already in table or is not a score/info colId
   *    for course.
   */
  async addColumns(courseId: string, ...colIds: string[])
    : Promise<Result<G.Grades>> {
    //TODO
    const check_valid = checkCourseId(courseId);
    if (check_valid) {
      const read_db = await this.#read(courseId);

      if (read_db.isOk === true) {
        const add_column = read_db.val.addColumns(...colIds);

        if (add_column.isOk === true) {
          const updated_table = add_column.val.getRawTable();
          await this.#write(courseId, updated_table);
          return okResult(add_column.val);
        }
      }

    }
    else {
      return errResult("Invalid course id", "BAD_ARG");
    }
  }

  /** Apply patches to table, returning the patched table.
   *  Errors:
   *    BAD_ARG: A patch rowId or colId is not in table.
   *    RANGE: Patch data is out-of-range.
   */
  async patch(courseId: string, patches: G.Patches)
    : Promise<Result<G.Grades>> {
    //TODO
    const check_valid = checkCourseId(courseId);
    if (check_valid) {
      const read_db = await this.#read(courseId);

      if (read_db.isOk === true) {
        const patch_result = read_db.val.patch(patches);

        if (patch_result.isOk === true) {
          const updated_table = patch_result.val.getRawTable();
          await this.#write(courseId, updated_table);
          return okResult(patch_result.val);
        }
      }

    }
    else {
      return errResult("Invalid course id", "BAD_ARG");
    }
  }

  //TODO: add private methods  

}

/** Return an error result if courseId is unknown */
function checkCourseId(courseId: string): Result<void> {
  return (COURSES[courseId])
    ? okResult(undefined)
    : errResult(`unknown course id ${courseId}`);
}

//TODO: add more local functions, constants, etc.

