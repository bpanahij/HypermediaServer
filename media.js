var path = require('path')
  , fs = require('fs')
  , _ = require('underscore');
/**
 *
 */
var rootDirectory = __dirname
  , errorPath = rootDirectory + '/error/index';
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
  var fileExtensions = _.map(mediaTypes, function (mediaType) {
    return mediaType.split(/[\+\/]/).pop();
  });
  if (_.contains(fileExtensions, '*')) {
    fileExtensions.push('js');
    mediaTypes.push('application/json');
  }
  if (_.contains(fileExtensions, 'json')) {
    fileExtensions.push('js');
    mediaTypes.push('application/json');
  }
  var mediaPath = req.originalUrl.sanitizePath().splitPath();
  var params = {};
  mediaPath.testPathParts(rootDirectory, params, function (finalPath, params) {
    findExistingFileExt(finalPath, fileExtensions, mediaTypes, function (filePathWithExtension, fileExt, mediaType) {
      mediaResponse(fileExt, mediaType, filePathWithExtension, req, res, params, next);
    });
  });
};
/**
 *
 * @param mediaPath
 * @param fileExtensions
 * @param mediaTypes
 * @param callback
 */
function findExistingFileExt(mediaPath, fileExtensions, mediaTypes, callback) {
  var foundFile = false;
  _.each(fileExtensions, function (fileExt, index) {
    var mediaType = mediaTypes[index]
      , fileInformation = mediaType.split(/[\/]/).pop()
      , fileName = fileInformation.split(/[\+]/).shift();
    if (fileName === fileExt || fileExt === 'js') {
      fileName = 'index';
    }
    fs.exists(mediaPath + '/' + fileName + '.' + fileExt, function (exists) {
      if (exists && !foundFile) {
        foundFile = true;
        callback(mediaPath + '/' + fileName + '.' + fileExt, fileExt, mediaType);
      }
    });
    fs.exists(mediaPath + '.' + fileExt, function (exists) {
      if (exists && !foundFile) {
        foundFile = true;
        callback(mediaPath + '.' + fileExt, fileExt, mediaType);
      }
    });
    // Handling the case where no file was found for that media Type
    if (index >= (fileExtensions.length - 1)) {
      setTimeout(function () {
        if (!foundFile) {
          foundFile = true;
          callback(errorPath + '.html', 'html', 'text/html');
        }
      }, 0);
    }
  });
}

/**
 *
 * @param fileExt
 * @param mediaType
 * @param mediaPath
 * @param req
 * @param res
 * @param params
 * @param next
 */
function mediaResponse(fileExt, mediaType, mediaPath, req, res, params, next) {
  // Set the response content-type header to match the accept header
  res.setHeader('Content-Type', mediaType);
  switch (fileExt) {
    case 'json':
      res.json(require(mediaPath));
      break;
    case 'js':
      req.params = params;
      require(mediaPath)[req.method.toLowerCase()](req, res, next);
      break;
    default:
      fs.readFile(mediaPath, function (err, data) {
        if (err) {
          res.setHeader('Content-Type', 'application/json');
          res.json({
            error: 'media-type: ' + mediaType + ' not supported.'
          });
          return;
        }
        res.send(data);
      });
      break;
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
