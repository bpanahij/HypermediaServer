/**
 * An example student endpoint
 * @param req
 * @param res
 * @param next
 */
var getStudent = function (req, res, next) {
  res.json({
    studentId: req.params.studentId,
    student: {
      name: 'Brian Johnson',
      education: 'Juris Doctorate'
    }
  });
};
/**
 *
 * @type {{get: getStudent, post: getStudent}}
 */
module.exports = {
  get: getStudent,
  post: getStudent
};