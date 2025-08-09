import { useState } from "react";
import { useTwitch } from "./hooks/useTwitch";

const TwitchListener = () => {
  const [twitchName, setTwitchName] = useState("");
  const { connect, isConnected } = useTwitch();

  const startListening = () => {
    connect(twitchName);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 twitch-purple">🎮 Connect to Twitch</h2>
      <p className="text-gray-300 mb-4">
        Enter the Twitch channel name you want to listen to
      </p>
      <input
        type="text"
        placeholder="Enter Twitch username..."
        onChange={(event) => setTwitchName(event.target.value)}
        className="gaming-input mb-8"
        disabled={isConnected}
      />
      <button
        disabled={isConnected}
        onClick={startListening}
        className="gaming-button mb-6"
      >
        {isConnected ? "🔗 Connected" : "🚀 Start Listening"}
      </button>
    </div>
  );
};

export default TwitchListener;
