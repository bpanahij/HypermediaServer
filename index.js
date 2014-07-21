/**
 * This Module Exposes a Hypermedia Server for NodeJS projects
 *
 *
 */
/**
 * Module dependencies.
 */
var express = require('express');
/**
 * Provide a config file and an express server app
 * This module will add a Hypermedia layer, which can serve
 * various media types from a directory structure:
 * {{rootDirectory}}/{{media-type}}/{{uri}}/{{mediaExt}}
 *
 * Where:
 * rootDirectory - is the root directory where all of your media directories exist
 * media-type -  is the media type specified in the Accepts: header (e.g. application/json, application/schema+json, text/html
 * uri - the requested resource uri, relative to the web server root
 * mediaExt - the extension to look for in the file structures (e.g. applications/json has a mediaExt of "json"
 *
 * @param config
 * @param app
 */
module.exports = function (config, app) {
  /**
   * Body Parsing Middleware
   */
  app.use(express.json({
    type: '*json',
    limit: config.limits.uploadMB
  }));
  app.use(express.urlencoded({
    extended: false
  }));
  /**
   * Media Finder and Caller
   */
  var media = require('./media')(config);
  app.use(config.apiPrefix, media);
};
