const { src, dest, series, parallel } = require("gulp");
const gulppostcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');

// a function for HTML task
function htmlTask() {
  return src('src/*.html')
    .pipe(dest('dist/'))
}

// a function for JS file task
function scriptTask() {
  return src('src/*.js')
  .pipe(sourcemaps.init())
  .pipe(concat('all.js'))
  .pipe(sourcemaps.write())
  .pipe(dest('dist/'))
}

// a function for CSS files task
function stylesTask() {
  return src('src/*.css')
    .pipe(sourcemaps.init())
    .pipe(gulppostcss([ autoprefixer(), cssnano() ]))
    .pipe(concat('all.css'))
    .pipe(sourcemaps.write())
    .pipe(dest('dist/'))
}

exports.default = series(htmlTask,  parallel(scriptTask, stylesTask));