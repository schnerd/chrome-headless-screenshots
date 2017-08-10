FROM node:8.2.1

# Install chrome
RUN apt-get update
RUN apt-get install -y libxss1 libappindicator1 libindicator7
RUN wget --quiet https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN dpkg -i google-chrome*.deb; exit 0
## above might show "errors", fixed by next line
RUN apt-get install -y -f

# Prepare app directory
RUN mkdir -p /usr/src/app
ADD . /usr/src/app

# Install dependencies
WORKDIR /usr/src/app
RUN npm install

# Prepare output area
RUN mkdir -p /var/output/

# Make executable
RUN chmod +x ./run.sh

ENTRYPOINT [ "./run.sh" ]
