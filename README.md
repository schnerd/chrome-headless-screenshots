**Note:** The Chrome team recently released [puppeteer](https://github.com/GoogleChrome/puppeteer), which is likely the best solution for headless chrome screenshots at this point. Please consider trying out puppeteer before diving in below, as this repo may become unmaintained in the future.

---

## Using headless Chrome as an automated screenshot tool

This repo contains an example implementation of using headless Chrome as an automated screenshot tool on linux, which is a common use case for PhantomJS. Contributions are welcome.

### Chrome Version

Headless Chrome is still new and unstable, and the API changes with each new major Chrome version. Our master branch is currently targeting **Chrome 60**–the current stable Chrome version. You may need to modify the script if you wish to target another version.

### Setup on Linux

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

# Run Chrome as background process
# https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
# --disable-gpu currently required, see link above
google-chrome --headless --hide-scrollbars --remote-debugging-port=9222 --disable-gpu &

# Take the screenshot
node index.js --url="http://www.eff.org"
```

The screenshot will then be available as *output.png*

### Setup on OSX

Headless Chrome is still highly unstable on OSX (see issue [#1](https://github.com/schnerd/chrome-headless-screenshots/issues/1)). At this point in time I recommend just running chrome & node in docker or vagrant (Vagrantfile pull requests welcome).

If you must run it natively, use the following commands:
```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --headless --remote-debugging-port=9222 --disable-gpu
node index.js --url="http://www.eff.org"
```

If screenshots on Mac do not appear to be working, please report an issue on [ChromeDevTools/devtools-protocol](https://github.com/ChromeDevTools/devtools-protocol), [cyrus-and/chrome-remote-interface](https://github.com/cyrus-and/chrome-remote-interface), or chromium itself.

### Setup on Docker

Build image:
```
docker build -t chrome-headless-screenshots-app .
```

Run container, saving output in local dir in the file output.png:
```
docker run -it -v ${PWD}:/var/output/ --rm chrome-headless-screenshots-app --url="http://www.eff.org"
```

Note that for newer versions of docker, you may see an error like:

```
libudev: udev_has_devtmpfs: name_to_handle_at on /dev: Operation not permitted
```

This appears to be harmless, and is caused by Chrome attempting to use /dev/shm for caching, which is more restricted in later versions of docker. If you really want to get rid of the warning then you can either dig a bit further to put together a seccomp file for chrome (see https://docs.docker.com/engine/security/seccomp/#significant-syscalls-blocked-by-the-default-profile for a start), or use `--security-opt seccomp:unconfined` but note that this is *not recommended* ("seccomp is instrumental for running Docker containers with least privilege. It is not recommended to change the default seccomp profile."). For now, we recommend just living with the warning.

### Other Resources

- [Getting Started with Headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome#screenshots)
- [Headless Chromium](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md)
- [Chrome Debugging Protocol Viewer](https://chromedevtools.github.io/debugger-protocol-viewer/tot/)
