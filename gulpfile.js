var gulp = require('gulp');
var tslint = require('gulp-tslint');
var del = require('del');
var exec = require('child_process').exec;
var nodemon = require('gulp-nodemon');
var runSequence = require('run-sequence');

gulp.task('vet', function () {
  return gulp.src('./src/**/*.ts')
    .pipe(tslint())
    .pipe(tslint.report());
});

gulp.task('clean', function () {
  return del(['./dist/**/*', '!dist']);
});

gulp.task('compile', function (done) {
  exec('tsc -p src/', function (err, stdout, stderr) {
    console.log(stdout);
    done();
  });
});

gulp.task('build', function (done) {
  runSequence('vet', 'clean', ['compile'], done);
});

gulp.task('build-no-clean', function (done) {
  runSequence('vet', ['compile'], done);
});

gulp.task('watch', ['build-no-clean'], function () {
  return gulp.watch(['src/**/*.ts'], ['build-no-clean']);
});

gulp.task('start', ['watch'], function () {
  return nodemon({
    script: 'dist/server.js',
    watch: 'dist',
    delay: 1000, // Delay in milliseconds
  });
});