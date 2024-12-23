import cors from 'cors';
import Express from 'express';
import bodyparser from 'body-parser';
import assert from 'assert';
import STATUS from 'http-status';

import { Err, ErrResult, errResult } from 'cs544-js-utils';

import { CourseInfo as C, GradeTable as G, GradesImpl, COURSES }
  from 'cs544-prj1-sol';
import { GradesDao } from 'cs544-prj2-sol';

import { SelfLink, SuccessEnvelope, ErrorEnvelope }
  from './response-envelopes.js';
import { ReadableStreamDefaultController } from 'stream/web';

export type App = Express.Application;


export default function serve(model: GradesDao, base = '/grades')
  : App {
  const app = Express();
  app.locals.model = model;
  app.locals.base = base;
  setupRoutes(app);
  return app;
}


function setupRoutes(app: Express.Application) {
  const base = app.locals.base;
  app.use(cors({ exposedHeaders: 'Location' }));
  app.use(Express.json());

  //TODO: add routes
  app.get(`${base}/:COURSE_ID`, get_course_grades(app));
  app.get(`${base}/:COURSE_ID/:ROW_ID`, get_course_grade_row(app));
  app.post(`${base}/:COURSE_ID`, load_courses(app));
  app.patch(`${base}/:COURSE_ID`, patch_courses(app));
  //must be last
  app.use(do404(app));
  app.use(doErrors(app));
}
// TODO: add handlers

// A typical handler can be produced by running a function like
// the following:
function get_course_grades(app: Express.Application) {
  return async function (req: Express.Request, res: Express.Response) {
    try {
      //code which uses req and res:
      const course_id = req.params.COURSE_ID;
      const table = req.query.full;
      const result = (await app.locals.model.getGrades(course_id));
      //check result status
      if (result.isOk === true) {
        res.location(course_id);
      }
      else {
        throw result;
      }
      //check table query
      if (table === "true") {
        //if true get the full table
        const response = selfResult<G.FullTable>(req, result.val.getFullTable());
        res.json(response);
      }
      else
      //else get the raw table
      {
        const response = selfResult<G.FullTable>(req, result.val.getRawTable());
        res.json(response);
      }
      //  req.query.X will provide value of query-parameter X.
      //  req.params.X will provide value of route parameter X.
      //  req.body will provide request body
      //  If a Result is in error simply throw it so that
      //  the catch block can convert it to an HTTP error envelope.
      //  Use res.status() to set the HTTP response status,
      //  res.json() to send back a JSON response, res.send() to
      //  send back a non-JSON response.
    }
    catch (err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  };
}


function get_course_grade_row(app: Express.Application) {
  return async function (req: Express.Request, res: Express.Response) {
    try {
      //code which uses req and res:
      const course_id = req.params.COURSE_ID;
      const row = req.params.ROW_ID;
      const table = req.query.full;
      const result = (await app.locals.model.getGrades(course_id));
      //check result status
      if (result.isOk === true) {
        res.location(course_id);
      }
      else {
        throw result;
      }
      //check table query
      if (table === "true") {
        //if true get the full table
        //check result
        const result_full_table = result.val.getFullTableRow(row);
        //check isOk value
        if (result_full_table.isOK === false) {
          throw result_full_table;
        }
        const response = selfResult<G.FullTable>(req, result.val.getFullTableRow(row));
        res.json(response.result);
      }
      else
      //else get the raw table
      {
        const result_raw_table = result.val.getRawTableRow(row);
        //check isOk value
        if (result_raw_table.isOK === false) {
          throw result_raw_table;
        }
        const response = selfResult<G.FullTable>(req, result.val.getRawTableRow(row));
        res.json(response.result);
      }
      //  req.query.X will provide value of query-parameter X.
      //  req.params.X will provide value of route parameter X.
      //  req.body will provide request body
      //  If a Result is in error simply throw it so that
      //  the catch block can convert it to an HTTP error envelope.
      //  Use res.status() to set the HTTP response status,
      //  res.json() to send back a JSON response, res.send() to
      //  send back a non-JSON response.
    }
    catch (err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  };
}

function load_courses(app: Express.Application) {
  return async function (req: Express.Request, res: Express.Response) {
    try {
      //code which uses req and res:
      const course_id = req.params.COURSE_ID;
      const table = req.query.full;
      const result = (await app.locals.model.load(course_id, req.body));
      //check result status
      if (result.isOk === true) {
        res.location(course_id);
      }
      else {
        throw result;
      }
      //check table query
      if (table === "true") {
        //if true get the full table
        const response = selfResult<G.FullTable>(req, result.val.getFullTable());
        res.json(response.result);
      }
      else
      //else get the raw table
      {
        const response = selfResult<G.FullTable>(req, result.val.getRawTable());
        res.json(response.result);
      }
      //  req.query.X will provide value of query-parameter X.
      //  req.params.X will provide value of route parameter X.
      //  req.body will provide request body
      //  If a Result is in error simply throw it so that
      //  the catch block can convert it to an HTTP error envelope.
      //  Use res.status() to set the HTTP response status,
      //  res.json() to send back a JSON response, res.send() to
      //  send back a non-JSON response.
    }
    catch (err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  };
}

function patch_courses(app: Express.Application) {
  return async function (req: Express.Request, res: Express.Response) {
    try {
      //code which uses req and res:
      const course_id = req.params.COURSE_ID;
      const table = req.query.full;
      const result = (await app.locals.model.patch(course_id, req.body));
      //check result status
      if (result.isOk === true) {
        res.location(course_id);
      }
      else {
        throw result;
      }
      //check table query
      if (table === "true") {
        //if true get the full table
        const response = selfResult<G.FullTable>(req, result.val.getFullTable());
        res.json(response.result);
      }
      else
      //else get the raw table
      {
        const response = selfResult<G.FullTable>(req, result.val.getRawTable());
        res.json(response.result);
      }
      //  req.query.X will provide value of query-parameter X.
      //  req.params.X will provide value of route parameter X.
      //  req.body will provide request body
      //  If a Result is in error simply throw it so that
      //  the catch block can convert it to an HTTP error envelope.
      //  Use res.status() to set the HTTP response status,
      //  res.json() to send back a JSON response, res.send() to
      //  send back a non-JSON response.
    }
    catch (err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  };
}

/** Default handler for when there is no route for a particular method
 *  and path.
 */
function do404(app: Express.Application) {
  return async function (req: Express.Request, res: Express.Response) {
    const message = `${req.method} not supported for ${req.originalUrl}`;
    const result = {
      status: STATUS.NOT_FOUND,
      errors: [{ options: { code: 'NOT_FOUND' }, message, },],
    };
    res.status(404).json(result);
  };
}


/** Ensures a server error results in nice JSON sent back to client
 *  with details logged on console.
 */
function doErrors(app: Express.Application) {
  return async function (err: Error, req: Express.Request, res: Express.Response,
    next: Express.NextFunction) {
    const message = err.message ?? err.toString();
    const result = {
      status: STATUS.SERVER_ERROR,
      errors: [{ options: { code: 'INTERNAL' }, message }],
    };
    res.status(STATUS.SERVER_ERROR as number).json(result);
    console.error(result.errors);
  };
}


/************************* HATEOAS Utilities ***************************/

/** Return original URL for req */
function requestUrl(req: Express.Request) {
  return `${req.protocol}://${req.get('host')}${req.originalUrl}`;
}

function selfHref(req: Express.Request, id: string = '') {
  const url = new URL(requestUrl(req));
  return url.pathname + (id ? `/${id}` : url.search);
}

function selfResult<T>(req: Express.Request, result: T,
  status: number = STATUS.OK)
  : SuccessEnvelope<T> {
  return {
    isOk: true,
    status,
    links: { self: { href: selfHref(req), method: req.method } },
    result,
  };
}



/*************************** Mapping Errors ****************************/

//map from domain errors to HTTP status codes.  If not mentioned in
//this map, an unknown error will have HTTP status BAD_REQUEST.
const ERROR_MAP: { [code: string]: number } = {
  EXISTS: STATUS.CONFLICT,
  NOT_FOUND: STATUS.NOT_FOUND,
  BAD_REQ: STATUS.BAD_REQUEST,
  AUTH: STATUS.UNAUTHORIZED,
  DB: STATUS.INTERNAL_SERVER_ERROR,
  INTERNAL: STATUS.INTERNAL_SERVER_ERROR,
}

/** Return first status corresponding to first options.code in
 *  errors, but SERVER_ERROR dominates other statuses.  Returns
 *  BAD_REQUEST if no code found.
 */
function getHttpStatus(errors: Err[]): number {
  let status: number = 0;
  for (const err of errors) {
    if (err instanceof Err) {
      const code = err?.options?.code;
      const errStatus = (code !== undefined) ? ERROR_MAP[code] : -1;
      if (errStatus > 0 && status === 0) status = errStatus;
      if (errStatus === STATUS.INTERNAL_SERVER_ERROR) status = errStatus;
    }
  }
  return status !== 0 ? status : STATUS.BAD_REQUEST;
}

/** Map domain/internal errors into suitable HTTP errors.  Return'd
 *  object will have a "status" property corresponding to HTTP status
 *  code.
 */
function mapResultErrors(err: Error | ErrResult): ErrorEnvelope {
  const errors = (err instanceof ErrResult)
    ? err.errors
    : [new Err(err.message ?? err.toString()),];
  const status = getHttpStatus(errors);
  if (status === STATUS.SERVER_ERROR) console.error(errors);
  return { isOk: false, status, errors, };
}

