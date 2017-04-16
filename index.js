const CDP = require('chrome-remote-interface');
const argv = require('minimist')(process.argv.slice(2));
const file = require('fs');

// CLI Args
var url = argv.url || 'https://www.google.com';
var format = argv.format === 'jpeg' ? 'jpeg' : 'png';
var viewportWidth = argv.viewportWidth || 1440;
var viewportHeight = argv.viewportHeight || 900;
var aspectRatio = viewportWidth / viewportHeight;
var imgWidth = argv.imgWidth || viewportWidth;
var imgHeight = Math.floor(imgWidth / aspectRatio);
var delay = argv.delay || 0;
var userAgent = argv.userAgent;
var fullPage = argv.full;

// Start the Chrome Debugging Protocol
CDP(async function(client) {
  // Extract used DevTools domains.
  const {CSS, DOM, Emulation, Network, Page, Runtime} = client;

  // Enable events on domains we are interested in.
  await Page.enable();
  await DOM.enable();
  await CSS.enable();
  await Network.enable();

  // If user agent override was specified, pass to Network domain
  if (userAgent) {
    await Network.setUserAgentOverride({userAgent});
  }

  // Set up device resolution, etc.
  const deviceMetrics = {
    width: viewportWidth,
    height: viewportHeight,
    deviceScaleFactor: 0,
    mobile: false,
    fitWindow: false,
  };
  await Emulation.setDeviceMetricsOverride(deviceMetrics);
  await Emulation.setVisibleSize({width: imgWidth, height: imgHeight});

  // Navigate to target page and store frameId for later us
  const {frameId} = await Page.navigate({url});

  // Take screenshot after page has loaded.
  Page.loadEventFired(async () => {
    // Add a CSS rule that hides scrollbars for screenshot
    const {styleSheetId} = await CSS.createStyleSheet({frameId: frameId});
    await CSS.addRule({
      styleSheetId: styleSheetId,
      ruleText: '::-webkit-scrollbar { display: none; }',
      location: {startLine: 0, startColumn: 0, endLine: 0, endColumn: 0},
    });

    // In order to take a screenshot of the full page, we need to measure
    // its height and update the viewport accordingyl
    if (fullPage) {
      const {root: {nodeId: documentNodeId}} = await DOM.getDocument();
      const {nodeId: bodyNodeId} = await DOM.querySelector({
        selector: 'body',
        nodeId: documentNodeId,
      });
      const {model: {height}} = await DOM.getBoxModel({nodeId: bodyNodeId});

      await Emulation.setVisibleSize({width: imgWidth, height: height});
      // This forceViewport ensures that content outside the viewport is rendered,
      // otherwise it shows up as grey.
      await Emulation.forceViewport({x: 0, y: 0, scale: 1});
    }

    setTimeout(async function() {
      const screenshot = await Page.captureScreenshot({format});
      const buffer = new Buffer(screenshot.data, 'base64');
      file.writeFile('output.png', buffer, 'base64', function(err) {
        if (err) {
          console.error(err);
        } else {
          console.log('Screenshot saved');
        }
        client.close();
      });
    }, delay);
  });
}).on('error', err => {
  console.error('Cannot connect to browser:', err);
});
