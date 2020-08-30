let fs = require('fs');
let path = require('path');

let express = require('express')
let router = express.Router()

let argv = require('../utils/argv');
let fm = require('../utils/file_manager');

router.get('/', function (req, res) {
  let body;
  let path = (req.query.path ? req.query.path : '.')

  if (fs.existsSync(argv.directory + path)) {
    let stats = fs.statSync(argv.directory + path);

    if (stats.isFile()) {
      res.sendFile(argv.directory + path, { dotfiles: 'allow' })
    } else {
      body = fm.listDirectory(argv.directory + path)
      res.send(body);
      res.end();
    }
  } else {
    res.send({ 'message': 'no file or directory' })
  }
})

router.delete('/', function (req, res) {
  let backUrl;
  let path = (req.query.path ? req.query.path : '.')

  // calculate the previous page
  if (req.query.path && req.query.path.split("/").length > 1) {
    backUrl = "?path=" + req.query.path.split("/").slice(0, -1).join('/')
  } else {
    backUrl = '/'
  }

  if (fs.existsSync(argv.directory + path)) {
    let stats = fs.statSync(argv.directory + path);

    try {
      if (stats.isFile()) {
        console.log('is file')
        fs.unlinkSync(argv.directory + path)
      } else {
        if (fs.readdirSync(argv.directory + path).length != 0) {
          res.send({ 'message': 'directory not empty' })
        } else {
          console.log('is folder')
          fs.rmdirSync(argv.directory + path, { recursive: true })
        }
      }

      console.log('deletion complete');
      res.writeHead(302, {
        'Location': `http://localhost:${+argv.port}${backUrl}`
      });
      res.end();
    } catch (err) {
      console.error(err)
      res.writeHead(302, {
        'Location': `http://localhost:${+argv.port}${backUrl}`
      });
      res.end();
    }
  } else {
    res.send({ 'message': 'no file or directory' })
    res.writeHead(302, {
      'Location': `http://localhost:${+argv.port}${backUrl}`
    });
    res.end();
  }
})

router.put('/', function (req, res) {
  let backUrl;

  // calculate the previous page
  if (req.query.path && req.query.path.split("/").length > 1) {
    backUrl = "?path=" + req.query.path.split("/").slice(0, -1).join('/')
  } else {
    backUrl = '/'
  }

  if (!req.body.targetPath) {
    console.log('targetPath needed!')
    res.send({ 'message': 'targetPath needed' })
    return
  }

  if (!req.query.path) {
    console.log('path needed!')
    res.send({ 'message': 'path needed' })
    return
  }

  if (fs.existsSync(argv.directory + req.query.path)) {
    fs.renameSync(argv.directory + req.query.path, argv.directory + req.body.targetPath)
    res.writeHead(302, {
      'Location': `http://localhost:${+argv.port}${backUrl}`
    });
    res.end()
  } else {
    res.send({ 'message': 'no file or directory' })
  }
})

router.post('/', function (req, res) {
  if (!req.query.path) {
    console.log('path needed!')
    res.send({ 'message': 'path needed' })
    return
  }

  if (fs.existsSync(argv.directory + req.query.path)) {
    res.send({ 'message': 'directory already exists' })
  } else {
    fs.mkdirSync(argv.directory + req.query.path, { recursive: true });
    res.end()
  }
})


module.exports = router
