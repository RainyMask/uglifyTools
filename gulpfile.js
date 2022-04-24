const gulp = require('gulp');
const gulpif = require('gulp-if');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify');
const cleanCss = require('gulp-clean-css');
const lazypipe = require('lazypipe');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const config = require('./config');

const isIgnore = (file) => /\/miniprogram_npm\//.test(file.path);
const isJS = (file) => !isIgnore(file) && file.extname === '.js';
const isWXSS = (file) => !isIgnore(file) && file.extname === '.wxss';
const isWXML = (file) => !isIgnore(file) && file.extname === '.wxml';

// https://github.com/mishoo/UglifyJS#minify-options
const jsUglifyConfig = {
  compress: {
    drop_console: true,
  },
  output: {
    // output options
    beautify: true,
    comments: false,
  },
}

// https://github.com/kangax/html-minifier#options-quick-reference
const htmlMinConfig = {
  caseSensitive: true,
  collapseWhitespace: true,
  keepClosingSlash: true,
  removeComments: true
}

const jsChannel = lazypipe()
  .pipe(babel, { presets: ['@babel/env'] })
  .pipe(uglify, jsUglifyConfig)

gulp.task('minify', () => {
  return gulp.src([
    `${config.entry}/**/*`,
    `!${config.entry}/node_modules/*`,
  ], { allowEmpty: true })
    .pipe(gulpif(isJS, jsChannel()))
    .pipe(gulpif(isWXSS, cleanCss()))
    .pipe(gulpif(isWXML, htmlmin(htmlMinConfig)))
    .pipe(gulp.dest('./dist'))
})

gulp.task('clean', () => {
  return gulp.src('./dist', { allowEmpty: true, read: false })
    .pipe(clean());
})

gulp.task('build', gulp.series('clean', 'minify'))