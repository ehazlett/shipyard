/*******************************
            Set-up
*******************************/

var
  gulp      = require('gulp-help')(require('gulp')),

  // read user config to know what task to load
  config    = require('./semantic/tasks/config/user'),

  // import tasks
  build     = require('./semantic/tasks/build'),
  clean     = require('./semantic/tasks/clean'),
  version   = require('./semantic/tasks/version'),
  watch     = require('./semantic/tasks/watch'),
  bower     = require('gulp-bower'),
  livereload = require('gulp-livereload'),

  // docs tasks
  serveDocs = require('./semantic/tasks/docs/serve'),
  buildDocs = require('./semantic/tasks/docs/build'),

  // rtl
  buildRTL  = require('./semantic/tasks/rtl/build'),
  watchRTL  = require('./semantic/tasks/rtl/watch')
;

/*--------------
     Common
---------------*/

gulp.task('default', false, [
  'bower', 'watch'
]);

gulp.task('watch', 'Watch for site/theme changes', watch);
gulp.task('build', 'Builds all files from source', build);

gulp.task('bower', function() {
  return bower()
});

gulp.task('serve', function() {
    livereload.listen({port: 8080});
});

gulp.task('clean', 'Clean dist folder', clean);
gulp.task('version', 'Displays current version of Semantic', version);

