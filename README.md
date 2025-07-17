# Billscanner
Example web server and client that accepts an image document of an invoice or other itemized bill, and then using AI scans and extracts the items and their respective costs.

### Requires
* nodeJS ver 20.17.0 or later
* npm ver 10.8.2 or later

### Environment Configuration
The web server portion of this application requires keys to loaded into environment variables:
* ANTHROPIC_CLAUDE_MODEL - a string naming the type of an Anthropic AI model: OPUS, CLAUDE, HAIKU, SONNET [default]
*  ANTHROPIC_API_KEY - the OAUTH API key for making calls to Anthropic's AI API
*  PORT - [default: 4000] the tcp port for the web server to listen for HTTP.  This var is mainly used when running the service on Heroku. 


## Installation
To install this application, clone the repository and run `npm install`

## Launching
Launching the appliations involves starting the web service, and then browsing to the home page:

### Running on Local PC
Launch web service: `npm run local`
Browse to `http://localhost:4000`

### Running on Heroku
It is assumed that you have correctly configured Heroku's environment, and that Heroku has created for you an instance-name (example: `https://billscanner-b05102d70878.herokuapp.com/`).
Simply open your browser and visit the heroku instance-name.

## Web Client Session
The web client is a simple HTML/CSS/JS client that allows you to submit an invoice image/pdf file to the cloud for analysis and extraction of data.  The Webserver then returns the extracted data in JSON.

Follow these steps:
1.  Click on the `Browse` button to select the invoice image file
2.  Click on the `Send to Claude` button to begin the analysis and extraction.  It may take a few seconds for this to complete.  The results will populate in the `Results` section
3.  If you wish, you can download as a JSON file, the extracted data.  Simply click on the `Download` button
   