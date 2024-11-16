import { useEffect, useState } from "react";
import { Client } from "tmi.js";
import styled from "styled-components";
import Button from "@mui/material/Button";
import { Box, TextField } from "@mui/material";

export interface TwitchMessage {
  username: string | undefined;
  message: string;
  play: boolean;
}

const UsernameBox = styled(TextField)`
  width: 100%;
`;
const ListenButton = styled(Button)`
  width: 100%;
  margin-bottom: 3rem;
`;

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
    <Box sx={{ "& .MuiTextField-root": { m: 1, width: "25ch" } }}>
      <h2>Enter your Twitch username</h2>
      <UsernameBox
        fullWidth
        variant="outlined"
        onChange={(event) => setTwitchName(event.target.value)}
      />
      <ListenButton
        variant="contained"
        disabled={buttonDisabled}
        onClick={startListening}
      >
        Start listening
      </ListenButton>
    </Box>
  );
};

export default TwitchListener;
