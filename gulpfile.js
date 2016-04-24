/**
 * @file gulp
 * @author it_panda@163.com
 */
'use strict';
{	
	let gulp = require(`gulp`);

	let path = require(`./config.json`);

	let minifycss = require(`gulp-minify-css`);

	let postcss = require(`gulp-postcss`);	

	let cssgrace  = require(`cssgrace`);	

	let cssnext  = require(`postcss-cssnext`);					

	let jshint = require(`gulp-jshint`);           

	let uglify = require(`gulp-uglify`);            	

	let fontmin = require(`gulp-fontmin`);

	let imagesmin = require(`gulp-imagemin`);  

	let pngquant = require(`imagemin-pngquant`); 		    		

	let through = require(`through2`);	

	let html = require(`html-minifier`).minify;

	let cheerio = require(`cheerio`);

	let clean = require(`gulp-clean`);

	let rename = require(`gulp-rename`);

	let browserSync = require(`browser-sync`);

	let reload = browserSync.reload; 

	let processors = [
	    cssnext(),
	    cssgrace
	];

	gulp.task(`browser-sync`, () => {
	    return browserSync({
	    	port:8080,
	    	open:true,
	        server: {
	            baseDir: `./build`
	        }
	    });
	});

	gulp.task(`css`,() => {
		return gulp.src(path.src.css) 
			.pipe(postcss(processors))
			.pipe(rename({suffix: `.min`}))
			.pipe(minifycss())
			.pipe(gulp.dest(path.build.css))
			.pipe(reload({stream: true}));

	});

	gulp.task(`lint`,() => {
		return gulp.src(path.src.js)
			.pipe(jshint())
			.pipe(jshint.reporter(`default`));
	});

	gulp.task(`script`,() => {
		return gulp.src(path.src.js)
			.pipe(uglify())
			.pipe(rename({suffix: `.min`}))
			.pipe(gulp.dest(path.build.js))
			.pipe(reload({stream: true}));
	});

	gulp.task(`fonts`, (cb) => {

	    let buffers = [];

	    gulp.src(path.src.html)
	    	.on(`data`, (file) => {
	            buffers.push(file.contents);
	        })
	        .on(`end`, () => {
	            let text = Buffer.concat(buffers).toString(`utf-8`);
	            return minifyFont(text, cb);
	        });
	});

	gulp.task(`img`, () => {
	    return gulp.src(path.src.img)
			.pipe(imagesmin({
				progressive: true,
				use: [pngquant()] 
			}))
	        .pipe(gulp.dest(path.build.img))
			.pipe(reload({stream: true}));;
	});

	gulp.task(`html`, () => {

		return gulp.src(path.src.html)
			
			.pipe(through.obj( (file, encode,cb) => {
				
				let content = file.contents.toString(encode);

				let $ = cheerio.load(content,{decodeEntities:false});
				
				let aLink = $(`link`);

				let aScript = $(`script`);

				rep($,aLink);

				rep($,aScript);

				content = $.html();

				let miniHtml = html(content,{
					minifyCSS:true,
					minifyJS:true,
					collapseWhitespace:true,
					removeAttributeQuotes:true
				});
				file.contents = new Buffer(miniHtml,encode);
				cb(null,file,encode);				
			}))
			.pipe(gulp.dest(path.build.html))
			.pipe(reload({stream: true}));
	});

	gulp.task(`ico`, () => {
		return gulp.src(path.src.ico)
			.pipe(gulp.dest(path.build.html));
	});

	gulp.task(`clean`, () => {

	   	return gulp.src([path.build.html], {read: false})

	        .pipe(clean());
	});

	gulp.task(`default`,[`clean`], () => {
	    gulp.start(`browser-sync`, `lint`, `html`, `fonts`, `script`, `img`, `css`, `ico`);
	    gulp.watch(path.src.html, [`html`]);
	    gulp.watch(path.src.css, [`css`]);
	    gulp.watch(path.src.images, [`img`]);
	    gulp.watch(path.src.js, [`script`]);
	    gulp.watch(path.src.fonts, [`fonts`]);
	});

	let rep = ($,hrefs) => {

		hrefs.each((index, item) => {
					
			let oLink = $(item);

			if(oLink.attr(`rel`) === `stylesheet`){

				let href = oLink.attr(`href`).replace(/\.\w+$/g,(str) => {
					return `.min${str}`;
				});

				oLink.attr(`href`,href);

			}else if(oLink.attr(`type`) === `text/javascript`){

				let href = oLink.attr(`src`).replace(/\.\w+$/g,(str) => {
					return `.min${str}`;
				});

				oLink.attr(`src`,href);

			}
		});

	};

	let minifyFont = (text, cb) =>  {
	    return gulp.src(path.src.fonts)
	        .pipe(fontmin({
	            text: text
	        }))
	        .pipe(gulp.dest(path.build.fonts))
	        .on(`end`, cb);
	};
}
