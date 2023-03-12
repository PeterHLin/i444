import { CourseInfo as C, GradeTable as G, GradesImpl, COURSES }
  from 'cs544-prj1-sol';

import * as mongo from 'mongodb';

import { okResult, errResult, Result } from 'cs544-js-utils';



export async function makeGradesDao(mongodbUrl: string)
  : Promise<Result<GradesDao>> 
{
  return GradesDao.make(mongodbUrl);
}

export class GradesDao {

  #client: mongo.MongoClient;
  #grades: mongo.Collection;

  private constructor(params: { [key: string]: any }) {
    //TODO
  }

  /** Factory method for constructing a GradesDao.
   */
  static async make(dbUrl: string) : Promise<Result<GradesDao>> {
    const params: { [key: string]: any } = {};
    try {
      //TODO
      return okResult(new GradesDao(params));
    }
    catch (error) {
      return errResult(error.message, 'DB');
    }
  }

  /** Close this DAO. */
  async close() : Promise<Result<void>> {
    //TODO
    return null;
  }

  /** Set grades for courseId to rawRows. 
   *  Errors:
   *   BAD_ARG: courseId is not a valid course-id.
   */
  async load(courseId: string, rawTable: G.RawTable)
    : Promise<Result<G.Grades>>
  {
    //TODO
    return null;
  }
  
  /** Return a Grades object for courseId. 
   *  Errors:
   *   BAD_ARG: courseId is not a valid course-id.
   */
  async getGrades(courseId: string): Promise<Result<G.Grades>> {
    //TODO
    return null;
  }

  /** Remove all course grades stored by this DAO */
  async clear() : Promise<Result<void>> {
    //TODO
    return null;
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
  async upsertRow(courseId: string, row: G.RawRow) : Promise<Result<G.Grades>> {
    return this.upsertRows(courseId, [row]);
  }

  /** Upsert zero-or-more rows.  Basically upsertRow() for
   *  multiple rows.   Will detect errors in multiple rows.
   */
  async upsertRows(courseId: string, rows: G.RawRow[])
    : Promise<Result<G.Grades>> 
  {
    //TODO
    return null;
  }

  /** Add an empty column for colId to table.
   *  Errors:
   *    BAD_ARG: colId is already in table or is not a score/info/id colId
   *    for course.
   */
  async addColumn(courseId: string, colId: string) : Promise<Result<G.Grades>> {
    return this.addColumns(courseId, colId);
  }
  
  /** Add empty columns for colId in colIds to table.
   *  Errors:
   *    BAD_ARG: colId is already in table or is not a score/info colId
   *    for course.
   */
  async addColumns(courseId: string, ...colIds: string[])
    : Promise<Result<G.Grades>>
  {
    //TODO
    return null;
  }
  
  /** Apply patches to table, returning the patched table.
   *  Errors:
   *    BAD_ARG: A patch rowId or colId is not in table.
   *    RANGE: Patch data is out-of-range.
   */
  async patch(courseId: string, patches: G.Patches)
    : Promise<Result<G.Grades>> 
  { 
    //TODO
    return null;
  }

  //TODO: add private methods  
  
}

/** Return an error result if courseId is unknown */
function checkCourseId(courseId: string) : Result<void> {
  return (COURSES[courseId])
    ? okResult(undefined)
    : errResult(`unknown course id ${courseId}`);
}

//TODO: add more local functions, constants, etc.

