const lighthouse = require('lighthouse'),
      chromeLauncher = require('chrome-launcher'),
      fs = require('fs');

const logdir = 'logs',
      interval = 300000;

/*
 * Programmatic lighthouse logging
 * https://github.com/GoogleChrome/lighthouse/
 */

launchChromeAndRunLighthouse = (url, opts, config = null) => {
  return chromeLauncher.launch({chromeFlags: opts.chromeFlags}).then(chrome => {
    opts.port = chrome.port;
    return lighthouse(url, opts, config).then(results => {
      return chrome.kill().then(() => results.lhr)
    });
  });
}

const opts = {
  chromeFlags: ['--headless'],
  onlyCategories: ['performance'],
};

var fyr = () => {
  console.log('Running audit for... ' + process.argv[2]);
    var d = new Date();
    launchChromeAndRunLighthouse('https://' + process.argv[2], opts).then(results => {
        delete results.audits['screenshot-thumbnails'];
        fs.writeFile(logdir + '/' + process.argv[2] + '-' + d.getTime() + '.json', JSON.stringify(results.audits, null, 4), function(err) {
            if(err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        }); 
    })
}

// Run once and then every -interval-
fyr();
setInterval(() => {
    fyr();
}, interval);