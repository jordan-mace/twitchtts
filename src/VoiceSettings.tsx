import { useState } from "react";
import { useStateContext } from "./StateContext";

const VoiceSettings = () => {
  const { pollyVoices, twitchVoices, setTwitchVoices } = useStateContext();
  const [currentUser, setCurrentUser] = useState("");

  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceId = event.target.value;
    const newVoice = pollyVoices.find((v) => v.Id === voiceId);
    if (newVoice && currentUser) {
      setTwitchVoices({ ...twitchVoices, [currentUser]: newVoice });
    }
  };

  const currentVoiceId = (currentUser && twitchVoices[currentUser]?.Id) || "";

  return Object.keys(twitchVoices).length > 0 ? (
    <div>
      <h3 className="text-2xl font-bold mb-4 twitch-purple">🎤 Voice Customization</h3>
      <p className="text-gray-300 mb-6">Assign specific voices to your chatters</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            👤 Select Chatter
          </label>
          <select
            className="gaming-select"
            aria-label="Chatters"
            value={currentUser}
            onChange={(event) => setCurrentUser(event.target.value)}
          >
            <option value="" disabled>Choose a chatter...</option>
            {Object.keys(twitchVoices).map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </div>

        {currentUser && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              🔊 Select Voice
            </label>
            <select
              className="gaming-select"
              aria-label="Voice"
              value={currentVoiceId}
              onChange={handleVoiceChange}
            >
              <option value="" disabled>Choose a voice...</option>
              {pollyVoices.map((x, index) => (
                <option key={index} value={x.Id}>
                  {x.Name} ({x.SupportedEngines?.join(", ")})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="text-center py-8">
      <h3 className="text-2xl font-bold mb-4 twitch-purple">🎤 Voice Customization</h3>
      <div className="text-gray-400">
        <p className="mb-2">No chatters yet!</p>
        <p className="text-sm">
          Connect to a Twitch channel and wait for messages to customize voices
        </p>
      </div>
    </div>
  );
};

export default VoiceSettings;
