module.exports = function(grunt) {
	grunt.initConfig({
		meta: {
			version: '0.1.0',
			banner: '/*! PROJECT_NAME - v<%= meta.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'* http://PROJECT_WEBSITE/\n' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
			'YOUR_NAME; Licensed MIT */'
		},
		lint: {
			files: ['grunt.js', 'lib/**/*.js', 'test/**/*.js']
		},
		qunit: {
			files: ['test/**/*.html']
		},
		concat: {
			alljs: {
				src: [
				'./javascript/underscore-min.js',
				'./javascript/jquery.js',		
				'./javascript/backbone-min.js',
				'./javascript/app.js',
				'./bootstrap/js/bootstrap.js'
				],
				dest: './javascript/all.js'
			},
			allcss:{
				src:[
					"./bootstrap/css/bootstrap.css",
					"./bootstrap/css/bootstrap-responsive.css",
					"./css/app.css"
				],
				dest:'./css/all.css'
			}
		},
		min: {
			alljs: {
				src: ['./javascript/all.js'],
				dest: './javascript/all.min.js'
			},
			// allcss:{
			// 	src:['./css/all.css'],
			// 	dest:'./css/all.min.css'
			// }
		},
		watch: {
			files: '<config:lint.files>',
			tasks: 'lint qunit'
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: true
			},
			globals: {
				jQuery: true
			}
		},
		uglify: {}
	});

	grunt.registerTask('default', 'concat min');

};
