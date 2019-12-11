The end goal of this project is to have something that calculates the Eddington Number from a Strava Athlete's activities.

## Getting Started
The app expects an `.env` file with the following key/values:
- DB_NAME: the name of the database
- DB_USER: the username for the database
- DB_PASS: the password for the username for the database
- DB_HOST: the database host
- DB_PORT: the port for the database
- SESSION_SECRET: a comma-delimited series of words to use for the session secret
- NODE_ENV: 'development' || anything else is treated as production
- STRAVA_CLIENT_ID: client Id for your Strava App
- STRAVA_CLIENT_SECRET: client secret for your Strava App

I've been using VS Code's Launch Configurations to run the app and load the `.env`
