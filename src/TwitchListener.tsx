import { useEffect, useState } from "react";
import { Client } from "tmi.js";
import { Styled } from "styled-components";

export interface TwitchMessage {
  username: string | undefined;
  message: string;
  play: boolean;
}

export interface TwitchListenerProps {
  onMessage: (message: TwitchMessage) => void;
}

const TwitchListener = (props: TwitchListenerProps) => {
  const [twitchName, setTwitchName] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [tmiClient, setTmiClient] = useState<null | Client>(null);

  const startListening = () => {
    setTmiClient(
      new Client({
        connection: {
          secure: true,
          reconnect: true,
        },
        channels: [twitchName],
      })
    );
  };

  useEffect(() => {
    if (!tmiClient) return;
    tmiClient.connect();
    tmiClient.on("message", (channel, tags, message, self) => {
      if (self) return;
      props.onMessage({
        username: tags.username,
        message: message.toLowerCase(),
        play: true,
      });
    });
    tmiClient.on("connected", () => {
      props.onMessage({
        username: "SYSTEM",
        message: "Connected to Twitch!",
        play: false,
      });
    });
    setButtonDisabled(true);
  }, [tmiClient]);

  return (
    <>
      <p>Enter your Twitch username</p>
      <input onChange={(event) => setTwitchName(event.target.value)} />
      <button disabled={buttonDisabled} onClick={startListening}>
        Start listening
      </button>
    </>
  );
};

export default TwitchListener;
