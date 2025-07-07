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

You will need to set the `VITE_AWS_ACCESS_KEY`, `VITE_AWS_SECRET_KEY`, and `VITE_AWS_REGION` variables.

Then run `npm run start` to run locally.

### Docker

To run the docker image, simply run

```
docker run -e VITE_AWS_ACCESS_KEY= -e VITE_AWS_SECRET_KEY=your-secret-key VITE_AWS_REGION=your-region -p 3000:3000 twitchtts
```

And the site will be available at http://localhost:3000/

### Docker Compose

Checkout the `docker-compose.yml` file as an example.
