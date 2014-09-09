gulp = require 'gulp'
watch = require 'gulp-watch'
jade = require 'gulp-jade'
coffee = require 'gulp-coffee'
sass = require 'gulp-ruby-sass'
uglify = require 'gulp-uglify'

gulp.task 'default', ->
  gulp.src('src/jade/index.jade')
    #.pipe(watch())
    .pipe(jade())
    .pipe(gulp.dest('public'))
  gulp.src('src/sass/application.sass')
    #.pipe(watch())
    # .pipe(sass style: 'compressed')
    .pipe(sass style: 'expanded')
    .pipe(gulp.dest('public/css'))
  gulp.src('src/coffee/application.coffee')
    #.pipe(watch())
    .pipe(coffee())
    # .pipe(uglify())
    .pipe(gulp.dest('public/js'))
  gulp.src('src/coffee/server.coffee')
    #.pipe(watch())
    .pipe(coffee())
    # .pipe(uglify())
    .pipe(gulp.dest('./'))
