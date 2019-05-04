const lighthouse = require('lighthouse'),
      chromeLauncher = require('chrome-launcher'),
      fs = require('fs');

const logdir = 'logs',
      interval = 300000; // every 5 minutes

const sites = [
  'm.babyshop.se',
  'm.babyshop.com',
  'm.alexandalexa.com/sv',
  'm.alexandalexa.com/en'
]

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

fyr = async (sites, logdir) => {
  const d = new Date();
  for (const site of sites) {
    const res = await launchChromeAndRunLighthouse('https://' + site, opts).then(results => {
      return results;
    })
    console.log(site + ': ' + res.categories.performance.score);

    fs.writeFile(logdir + '/' + encodeURIComponent(site) + '-' + d.getTime() + '.json', JSON.stringify(res, null, 4), function(err) {
      if(err) {
          return console.log(err);
      }
    }); 
  }
  console.log("Done!")
}

fyr(sites, logdir);
setInterval(() => {
  fyr(sites, logdir);
}, interval);