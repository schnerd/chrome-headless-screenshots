## Using headless Chrome as an automated screenshot tool

This repo contains an example implementation of using headless Chrome as an automated screenshot tool on linux, which is a common use case for PhantomJS.

Contributions are welcome.

### Setup

The setup below was used on a [Vagrant](https://www.vagrantup.com/) running Ubuntu 14 Trusty Tahr. It assumes you've already cloned the repo and run `npm install`.

```sh
# Install Google Chrome
# https://askubuntu.com/questions/79280/how-to-install-chrome-browser-properly-via-command-line
sudo apt-get install libxss1 libappindicator1 libindicator7
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome*.deb  # Might show "errors", fixed by next line
sudo apt-get install -f

# Install Node Stable (v8)
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

# Take the screenshot
node index.js --url="http://www.eff.org"
```

The screenshot will then be available as *output.png*

### Other Resources

- [Getting Started with Headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome#screenshots)
- [Headless Chromium](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md)
- [Chrome Debugging Protocol Viewer](https://chromedevtools.github.io/debugger-protocol-viewer/tot/)
