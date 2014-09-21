// -*- indent-tabs-mode: t; -*-

'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var autoprefixer = require('autoprefixer-core');
var applySourceMap = require('vinyl-sourcemaps-apply');
var objectAssign = require('object-assign');

module.exports = function (opts, pluginOpts) {
	opts = opts || {};
	pluginOpts = pluginOpts || {};

	return through.obj(function (file, enc, cb) {

		// Ignore non-files and non-*.css files.
		if (file.isNull() || !file.path || !/\.css$/.test(file.path)) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-autoprefixer', 'Streaming not supported'));
			return;
		}

		var res;
		var fileOpts = objectAssign({}, opts);
		var useSourceMap = pluginOpts.map ? true : false;

		try {
			res = autoprefixer(fileOpts).process(file.contents.toString(), {
				map: file.sourceMap ? {annotation: false} : useSourceMap,
				from: file.relative,
				to: file.relative
			});

			file.contents = new Buffer(res.css);

			if (res.map && file.sourceMap) {
				applySourceMap(file, res.map.toString());
			}

			cb(null, file);
		} catch (err) {
			cb(new gutil.PluginError('gulp-autoprefixer', err, {fileName: file.path}));
		}
	});
};
