var control = require("../controller/controller");
var multer  = require('multer');
var connect = require("../services/database");
var fs = require('fs');
var joinPath = require('path.join');

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
  	var dir = 'public/images';
	if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}
    callback(null, dir)
  },
  filename: function (req, file, callback) {
    callback(null, sess.email.replace('.', '-') + '.jpg')
  }
});

var str = multer.diskStorage({
  destination: function (req, file, callback) {
  	var dir = joinPath('public/files/',req.session.name);
	if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
    }
    callback(null, dir);
  }
});

var text = multer({ storage: str});
var upload = multer({ storage: storage });
module.exports = function (app) {
	app.get('/', function(req, res) {
			sess = req.session;
			var status = [];
			if (sess.email) {
				control.getStatus(req, res, function (data) {
				  for(var i = 0; i < data.lenght; ++i) {
				  		status.push(data[i].status)
				  }

		          res.render("home", {error : false, msg: sess.name, ms2: sess.path, array: data});
		          });
			} else {
		 		res.render("home", {error: true});
		 	}
	});

	app.get('/signup', function(req, res) {
		sess = req.session;
		if (sess.email) {
		    res.redirect("/");
		   } else {
		 	res.render("sign_up");
		}
	});


	app.post('/signup',function(req, res) {
		control.signup(req, res, function(isSignUp, msg) {
			if(isSignUp) {
				res.redirect("/");
			} else {
				res.render("sign_up", {error: true,msg: msg});
			}
		}); 
	});

	app.get('/login', function(req, res) {
		sess = req.session;
		if (sess.email) {
		    res.redirect("/");
		} else {
		 	res.render("login");
		 }
	});

	app.post('/profile', upload.single('pic'), function (req, res, next) {
		sess = req.session;
		connect.insertImage(req.file.path.slice(7),sess.email);
		sess.path = req.file.path.slice(7);
		if (sess.email) {
			res.redirect("/");
		}	
	});

	app.post('/text', text.any(), function (req, res, next) {
		sess = req.session;
		connect.insertFile(sess, req.files[0].path.slice(7)); 
		if (sess.email) {
			res.redirect("/");
			}
			
		});


	app.post('/status',function(req, res) {
		control.status(req, res, function (status, msg) {
			if (status) {
				res.redirect("/");
			} else {
				res.render("login", {msg: msg});
			}
		}); 
	});

	app.post('/login', function(req, res) {
		control.login(req, res, function (isLogin, msg) {
			if (isLogin) {
				res.redirect("/");
			} else {
				res.render("login", {error: true, msg: msg});			}
		});
	});

	app.get('/logout', function(req, res) {
    	req.session.destroy(function(err) {
	    	if (err) {
	    		console.log(err);  
	    	} else {
	        	res.redirect('/');  
	        }  
    });

	});
}
