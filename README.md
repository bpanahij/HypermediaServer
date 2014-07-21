NodeJS Hypermedia Server
==================

A simple Hypermedia Server for NodeJS projects

Uses a directory structure and Accepts header to determine which file and file type top load.

Also, uses expressJS API to provide request/response/next functionality.

routes are provided with params, just as express does on it's own:
e.g.

directory:
/api/v1/students/:studentId

request uri:
/api/v1/students/3123123123

params are provided on the req object, like so:

{
  studentId: 3123123123
}

