const { series, src, dest } = require("gulp")

const babel = require("gulp-babel")
const rename = require("gulp-rename")
const decomment = require('gulp-decomment');
const del = require('del');
const minify = require('gulp-minify');
const plumber = require("gulp-plumber")

function jsBuild(done) {
  return (
    src("./src/dropdown.js")
      .pipe(plumber())
      .pipe(
        babel({
          plugins: ['@babel/plugin-proposal-class-properties'],
          presets: [
            [
                "@babel/env",
                {
                    targets: [">= 0.5%", "ie 11"]
                }
             ]
          ]
        })
      )
      .pipe(decomment({ trim: true, safe: true}))
      .pipe(dest("./dist"))
      .pipe(dest("./tmp/"))
  )
}

function jsMin(done) {
  const file = "./tmp/dropdown.js"
  return (
    src(file)
      .pipe(plumber())
      .pipe(minify({ preserveComments: 'some' }))
      .pipe(dest("./tmp"))
  )
}

function jsRenameMin(done) {
  const file = "./tmp/dropdown-min.js";
  return (
    src(file)
      .pipe(rename('dropdown.min.js'))
      .pipe(dest("./dist"))
  )
}


function clean(done) {
    return del('./tmp', {force:true});

}




exports.default = series(jsBuild, jsMin, jsRenameMin, clean)