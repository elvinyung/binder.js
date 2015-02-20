'use strict';

var gulp = require('gulp'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  del = require('del'),
  rename = require('gulp-rename'),
  livereload = require('gulp-livereload'),
  jshint = require('gulp-jshint'),
  notify = require('gulp-notify');

var paths = {
  js: 'lib'
};

var dests = {
  js: 'dist'
};

gulp.task('clean', function(cb) {
  del('dist', cb);
});

gulp.task('js', function() {
  return gulp.src(paths.js)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('binder.js'))
    .pipe(rename({ suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(dests.js))
    .pipe(notify({ mesage: 'linted and minified js' }));
});

gulp.task('default', ['clean'], function() {
  gulp.start('js');
});
