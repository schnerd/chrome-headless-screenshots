const CDP = require('chrome-remote-interface');
const argv = require('minimist')(process.argv.slice(2));
const file = require('mz/fs');
const timeout = require('delay');

// CLI Args
const url = argv.url || 'https://www.google.com';
const format = argv.format === 'jpeg' ? 'jpeg' : 'png';
const viewportWidth = argv.viewportWidth || 1440;
const viewportHeight = argv.viewportHeight || 900;
const delay = argv.delay || 0;
const userAgent = argv.userAgent;
const fullPage = argv.full;
const output = argv.output || `output.${format === 'png' ? 'png' : 'jpg'}`;

init();

async function init() {
  try {
    // Start the Chrome Debugging Protocol
    const client = await CDP();
    // Extract used DevTools domains.
    const {DOM, Emulation, Network, Page, Runtime} = client;

    // Enable events on domains we are interested in.
    await Page.enable();
    await DOM.enable();
    await Network.enable();

    // If user agent override was specified, pass to Network domain
    if (userAgent) {
      await Network.setUserAgentOverride({userAgent});
    }

    // Set up viewport resolution, etc.
    const deviceMetrics = {
      width: viewportWidth,
      height: viewportHeight,
      deviceScaleFactor: 0,
      mobile: false,
      fitWindow: false,
    };
    await Emulation.setDeviceMetricsOverride(deviceMetrics);
    await Emulation.setVisibleSize({
      width: viewportWidth,
      height: viewportHeight,
    });

    // Navigate to target page
    await Page.navigate({url});

    // Wait for page load event to take screenshot
    await Page.loadEventFired();
    // If the `full` CLI option was passed, we need to measure the height of
    // the rendered page and use Emulation.setVisibleSize
    if (fullPage) {
      const {root: {nodeId: documentNodeId}} = await DOM.getDocument();
      const {nodeId: bodyNodeId} = await DOM.querySelector({
        selector: 'body',
        nodeId: documentNodeId,
      });
      const {model: {height}} = await DOM.getBoxModel({nodeId: bodyNodeId});

      await Emulation.setVisibleSize({width: viewportWidth, height: height});
      // This forceViewport call ensures that content outside the viewport is
      // rendered, otherwise it shows up as grey. Possibly a bug?
      await Emulation.forceViewport({x: 0, y: 0, scale: 1});
    }

    await timeout(delay);
    const screenshot = await Page.captureScreenshot({format});
    const buffer = new Buffer(screenshot.data, 'base64');
    await file.writeFile(output, buffer, 'base64');
    console.log('Screenshot saved');
    client.close();
  } catch (err) {
    console.error('Exception while taking screenshot:', err);
  }
}
