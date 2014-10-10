/**
 * An example student endpoint
 * @param req
 * @param res
 * @param next
 */
var getStudents = function (req, res, next) {
  res.json({
    students: [
      {
        studentId: 1233443453452345,
        name: 'Brian Johnson',
        education: 'Juris Doctorate'
      }
    ]
  });
};
/**
 *
 * @type {{get: getStudent, post: getStudent}}
 */
module.exports = {
  get: getStudents,
  post: getStudents
};
