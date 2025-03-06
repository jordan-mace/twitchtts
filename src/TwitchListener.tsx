import { useContext, useEffect, useState } from "react";
import { ChatUserstate, Client } from "tmi.js";
import styled from "styled-components";
import Button from "@mui/material/Button";
import { Box, TextField } from "@mui/material";
import { TwitchContext } from "./TwitchContext";

export interface TwitchMessage {
  username: string | undefined;
  id: string | undefined;
  isSubbed: boolean;
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
  const { onMessage } = props;
  const twitchSettings = useContext(TwitchContext);
  const { ModsOnly } = twitchSettings;
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

  const isMod = (tags: ChatUserstate) =>
    tags.mod ||
    tags.badges?.broadcaster === "1" ||
    tags.badges?.staff === "1" ||
    tags.badges?.admin === "1" ||
    tags.badges?.moderator === "1" ||
    tags.badges?.global_mod === "1";

  useEffect(() => {
    if (!tmiClient) return;
    tmiClient.connect();
    tmiClient.on("message", (channel, tags, message, self) => {
      if (self) return;
      if (ModsOnly && !isMod(tags)) return;
      onMessage({
        username: tags.username,
        id: tags.id,
        isSubbed: tags.subscriber ?? false,
        message: message.toLowerCase(),
        play: true,
      });
    });
    tmiClient.on("connected", () => {
      onMessage({
        username: "SYSTEM",
        id: "connect",
        isSubbed: false,
        message: "Connected to Twitch!",
        play: false,
      });
    });
    setButtonDisabled(true);
  }, [tmiClient, onMessage, ModsOnly]);

  return (
    <Box sx={{ "& .MuiTextField-root": { mb: 1 } }}>
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
