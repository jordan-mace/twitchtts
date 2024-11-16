# TwitchTTS

Adding TTS support to your Twitch stream! Simply plug your username in and listen to your chat!

## Features

- Realistic voices via AWS Polly
- Each Twitch chatter is assigned a random voice
- Ability to restrict TTS to moderators
- Manually override a chatter's assigned voice (coming soon)
- Ability to give donators/subscribers a higher quality voice (coming soon)

## Getting started

Checkout the repo, go into the directory, and create a `.env` file.

You will need to set the `REACT_APP_AWS_ACCESS_KEY`, `REACT_APP_AWS_SECRET_KEY`, and `REACT_APP_AWS_REGION` variables.

Then run `npm run start` to run locally.
