// gulpfile.mjs
import gulp from "gulp";
import fileinclude from "gulp-file-include";
import cssnano from "gulp-cssnano";
import autoprefixer from "gulp-autoprefixer";
import htmlmin from "gulp-htmlmin";
import cachebust from "gulp-cache-bust";
import plumber from "gulp-plumber";
import { stream as critical } from "critical";
import { minify } from "uglify-js";
import sitemap from "gulp-sitemap";

export const css = () => {
  return gulp
    .src("src/css/styles.css")
    .pipe(plumber())
    .pipe(autoprefixer())
    .pipe(cssnano())
    .pipe(gulp.dest("dist/css"));
};

export const criticalTask = () => {
  return gulp
    .src("dist/**/*.html")
    .pipe(
      critical({ base: "dist/", inline: true, css: ["dist/css/styles.css"] })
    )
    .pipe(gulp.dest("dist"));
};

export const html = () => {
  return gulp
    .src(["src/**/*.html", "!src/components/*.html"]) // Exclude nav.html
    .pipe(fileinclude({ prefix: "@@", basepath: "@file" }))
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        minifyJS: function (text, inline) {
          return minify(text).code;
        },
      })
    ) // Minify HTML and inline JavaScript
    .pipe(cachebust({ type: "timestamp" }))
    .pipe(cachebust({ type: "timestamp" }))
    .pipe(gulp.dest("dist"));
};

export const generateSitemap = () => {
  return gulp
    .src("dist/**/*.html", {
      read: false, // Do not read the files, we're only interested in the paths
    })
    .pipe(
      sitemap({
        siteUrl: "https://www.everydaywebtools.com", // Replace with your site's URL
        lastmod: new Date().toISOString(),
        changefreq: 'weekly', // Example value, you can adjust as needed
        priority: '1.0' // All pages set to highest priority
      })
    )
    .pipe(gulp.dest("dist"));
};
export const robots = () => {
  return gulp.src("src/robots.txt").pipe(gulp.dest("dist"));
};

export const watch = () => {
  gulp.watch("src/**/*.html", gulp.series(html));
  gulp.watch("src/css/*.css", gulp.series(css));
};

export const build = gulp.series(html, css);
export default gulp.series(build, criticalTask, robots, generateSitemap, watch);
