GDdle - daily Geometry Dash level roll

SETUP (once)
1. Put the rated-levels spreadsheet (.xlsx) in this folder.
   Optional: save the "Most Useful GD Levels" page as useful.html here (makes famous levels rarer).
2. pip install pandas openpyxl
3. Double-click start.bat. The first run builds data\levels.json (a minute or two), then opens http://localhost:3000

COMMANDS (run in this folder)
node server.js            start the server
node check.js 4284013     score a level ID in the console
node force.js 4284013     force the next roll to that ID (refresh, press GENERATE)
node force.js clear       cancel a forced roll

HOSTING
Upload server.js, badges.js, public\ and data\levels.json to a Node host.
Set the SECRET environment variable to a long random string.
Tweak weights and EP tiers at the top of server.js; badge names and points are in badges.js.

POINTERCRATE 403?
If the builder prints "pointercrate fetch failed: 403", open these two links in your browser and save each page as
pointercrate1.json and pointercrate2.json in this folder, then rebuild (delete data\levels.json, run start.bat):
  https://pointercrate.com/api/v2/demons/listed/?limit=100&after=0
  https://pointercrate.com/api/v2/demons/listed/?limit=100&after=100

FEEDBACK (Discord webhook)
In Discord: Server Settings > Integrations > Webhooks > New Webhook > copy the URL.
Locally: put the URL alone on one line in a file named webhook.txt next to start.bat.
On a host: set the environment variable DISCORD_WEBHOOK to the URL.
Every message is also saved to data/feedback.jsonl as a backup. Never share or commit the webhook URL.

