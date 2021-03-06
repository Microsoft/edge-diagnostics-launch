var urlparse = require('url').parse
var urlformat = require('url').format
var child_process = require('child_process')
var path = require('path')
var fs = require('fs');
var os = require('os')

function launch(url, options, callback) {
  var args = []
  options = options || {}

  if (options.port) {
    args.push('--port', options.port);
  }

  if (url && url.length) {
    var urlObj = urlparse(url, true)
    delete urlObj.search   // url.format does not want search attribute
    url = urlformat(urlObj)
    args.push('--launch ' + url)
  }


  if (options.adapterPath) {
    var command = options.adapterPath
  } else {
    for (var i = 0; i < module.paths.length; i++) {
      var command = path.resolve(module.paths[i], 'edge-diagnostics-adapter',
                                 'dist', os.arch(), 'EdgeDiagnosticsAdapter.exe')

      if (fs.existsSync(command)) {
        break;
      }
    }
  }

  var process = child_process.spawn(command, args)

  if (callback) {
    process.stdout.on('data', function(chunk) {
      if (/server listening on port \d{4}/g.test(chunk.toString('utf-8'))) {
        callback(null)
      }
    })

    process.stderr.on('data', function(err) {
      callback(err)
    })
  }

  return process
}

module.exports = launch
