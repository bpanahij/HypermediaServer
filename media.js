var path = require('path')
  , fs = require('fs');
/**
 *
 */
var rootDirectory = __dirname
  , errorPath = rootDirectory + '/error';
/**
 *
 * @param config
 * @returns {routeRequest}
 */
module.exports = function (config) {
  rootDirectory = config.rootDirectory;
  errorPath = config.errorPath ? config.errorPath : errorPath;
  return routeRequest;
};
/**
 *
 * @param req
 * @param res
 * @param next
 */
var routeRequest = function (req, res, next) {
  var accepts = req.headers['accept'];
  var mediaTypes = accepts.split(',');
  var mediaType = mediaTypes.shift();
  var mediaExts = mediaType.split(/[\+\/]/);
  var mediaExt = mediaExts.pop();
  var ext;
  switch (mediaExt) {
    case 'json':
      switch (mediaType) {
        case 'application/schema+json':
          ext = '.json';
          break;
        default:
          ext = '.js';
      }
      break;
  }
  res.setHeader('Content-Type', mediaType);
  var mediaPath = req.originalUrl.sanitizePath().splitPath();
  mediaPath.unshift(accepts);
  mediaPath.push('index' + ext);
  var params = {};
  mediaPath.testPathParts(rootDirectory, params, function (finalPath, params) {
    mediaResponse(mediaExt, mediaType, finalPath, req, res, params, next)
  });
};

/**
 *
 * @param mediaExt
 * @param mediaType
 * @param mediaPath
 * @param req
 * @param res
 * @param params
 * @param next
 */
function mediaResponse(mediaExt, mediaType, mediaPath, req, res, params, next) {
  switch (mediaExt) {
    case 'json':
      switch (mediaType) {
        case 'application/schema+json':
          res.json(require(mediaPath));
          break;
        default:
          req.params = params;
          require(mediaPath)[req.method.toLowerCase()](req, res, next);
      }
      break;
    case 'html':

  }
}
/**
 *
 * @returns {string}
 */
String.prototype.sanitizePath = function () {
  return this.replace(/\?.*$/, '');
};
/**
 *
 * @returns {Array}
 */
String.prototype.splitPath = function () {
  return this.split('/').filter(function (part) {
    return part.length;
  });
};
/**
 *
 * @param rootPath
 * @param params
 * @param callback
 * @returns {Array}
 */
Array.prototype.testPathParts = function (rootPath, params, callback) {
  var that = this;
  if (this.length === 0) {
    callback(rootPath, params);
    return this;
  }
  var pathSegment = this.shift();
  var nextPath = path.join(rootPath, pathSegment);
  fs.exists(nextPath, function (exists) {
    if (exists) {
      that.testPathParts(nextPath, params, callback);
    } else {
      fs.readdir(rootPath, function (err, files) {
        var matches;
        for (var index in files) {
          if (files.hasOwnProperty(index)) {
            matches = files[index].match(/:(.*)/);
            if (!matches) {
              callback(errorPath, params);
              return this;
            }
            params[matches[1]] = pathSegment;
            nextPath = path.join(rootPath, files[index]);
            that.testPathParts(nextPath, params, callback);
            return;
          }
        }
      });
    }
  });
  return this;
};
