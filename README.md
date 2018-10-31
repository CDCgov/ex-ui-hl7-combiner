# Whitelabel Onboarding Tool Dashboarding

## Running Locally

### Before you start
You will need to have the following installed before getting up and running locally:

- Docker, [Installation guides](https://docs.docker.com/install/)
- Docker Compose, [Installation guides](https://docs.docker.com/compose/install/)
- **Windows Users**: This project uses `Make`, please see [Cygwin](http://www.cygwin.com/) for running commands in this README

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

You can find the most recent version of the Create React App guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

### Installation

This app is dependent on two FDNS NPM packages.

* [FDNS JS SDK](https://www.npmjs.com/package/fdns-js-sdk)
* [FDNS React UI](https://www.npmjs.com/package/fdns-ui-react)


Run `npm i` to install dependencies.

### Run

To start the background processes necessary, run docker compose to spin up `fdns-ms-combiner`, `fdns-ms-hl7-utils`, and `fdns-ms-object`, which are all needed to run this app:

    docker-compose up -d

Make sure your `/public/config.js` file contains the correct port references for these instances. If you are not using Identity you may ignore that URL and change the `SECURE_MODE` property to `false`.

To start the app:

    npm start

You should be able to visit `http://localhost:3000/` to view the dashboard.

To stop running the docker background images:

	docker-compose down

## Using the app

A fresh instance will require MMG configs to be uploaded as JSON via the ADMIN button in the footer.