import { useContext, useEffect, useState } from "react";
import { ChatUserstate, Client } from "tmi.js";


import { TwitchContext } from "./TwitchContext";

export interface TwitchMessage {
  username: string | undefined;
  id: string | undefined;
  isSubbed: boolean;
  message: string;
  play: boolean;
}


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
  }, [tmiClient, ModsOnly]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 twitch-purple">🎮 Connect to Twitch</h2>
      <p className="text-gray-300 mb-4">Enter the Twitch channel name you want to listen to</p>
      <input
        type="text"
        placeholder="Enter Twitch username..."
        onChange={(event) => setTwitchName(event.target.value)}
        className="gaming-input mb-8"
      />
      <button
        disabled={buttonDisabled}
        onClick={startListening}
        className="gaming-button mb-6"
      >
        {buttonDisabled ? "🔗 Connected" : "🚀 Start Listening"}
      </button>
    </div>
  );
};

export default TwitchListener;
