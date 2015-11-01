'use strict';

var gulp = require('gulp');
var path = require('path');
var config = require('../config');
var util = require('../util');
var b2v = require('buffer-to-vinyl');
var dotenv = require('dotenv');
var fs = require('fs');
var gulpNgConfig = require('gulp-ng-config');
var browserSync = require('browser-sync');
var $ = require('gulp-load-plugins')();

// Creates a config.js Angular config module from env file
gulp.task('env', function() {
  var dest = path.join(config.paths.tmp, '/serve', config.paths.scripts);

  // Check if we even have a .env file to use
  if(!util.checkForEnv())
    return false

  // Gets the config settings for the current NODE_ENV, also stubs that in
  var ngConfig = {
    environment: process.env.NODE_ENV,
    constants: { NODE_ENV: process.env.NODE_ENV }
  };

  // Read the .env file
  var fileContent = fs.readFileSync(util.envFile(), "utf8");

  // Parse the .env to an object
  fileContent = dotenv.parse(fileContent);

  // Wrap the object in a main key, easier to include in angular
  var tmp = {}
  tmp[config.settings.envConstant] = fileContent;
  fileContent = tmp;

  // Stringify the .env file
  fileContent = JSON.stringify(fileContent);

  // Write the app config to an env file
  return b2v.stream(new Buffer(fileContent), 'env.js')
    .pipe(gulpNgConfig(config.settings.envModule, ngConfig)
    .on('error', util.errorHandler('ng-config')))
    .pipe(gulp.dest(dest))
    .pipe(browserSync.reload({ stream: true }))
});

// Helpers for setting the NODE_ENV before running a task
gulp.task('set-development', function() {
  util.loadEnv('.env', 'set-development');
  return process.env.NODE_ENV = 'development';
});

gulp.task('set-staging', function() {
  util.loadEnv('.env.staging', 'set-staging');
  return process.env.NODE_ENV = 'staging';
});

gulp.task('set-production', function() {
  util.loadEnv('.env.production', 'set-production');
  return process.env.NODE_ENV = 'production';
});
