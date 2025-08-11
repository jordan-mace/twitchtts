import { useEffect, useState } from "react";
import { GetVoice } from "@speechify/api/api/resources/tts";

export interface VoiceSettingsProps {
  pollyVoices: GetVoice[];
  twitchVoices: Record<string, GetVoice>;
  onChange: (voices: Record<string, GetVoice>) => void;
}

const VoiceSettings = (props: VoiceSettingsProps) => {
  const { twitchVoices, pollyVoices, onChange } = props;
  const [currentUser, setCurrentUser] = useState("");
  const [currentVoice, setCurrentVoice] = useState("");
  const [voices, setVoices] = useState<Record<string, GetVoice>>(twitchVoices);

  useEffect(() => {
    if (voices[currentUser] === undefined) return;
    if (voices[currentUser].id === undefined) return;
    setCurrentVoice(voices[currentUser].id ?? "");
  }, [currentUser, voices]);

  useEffect(() => {
    var newVoice = pollyVoices.find((x) => x.id === currentVoice);
    if (newVoice === undefined) return;

    var newVoices = voices;
    newVoices[currentUser] = newVoice;
    setVoices(newVoices);
    onChange(voices);
  }, [currentVoice, currentUser, pollyVoices, voices, onChange]);

  return Object.entries(voices).length > 0 ? (
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
            {Object.keys(voices).map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            🔊 Select Voice
          </label>
          <select
            className="gaming-select"
            aria-label="Voice"
            value={currentVoice}
            onChange={(event) => setCurrentVoice(event.target.value)}
          >
            <option value="" disabled>Choose a voice...</option>
            {props.pollyVoices.map((x, index) => (
              <option key={index} value={x.id}>
                {x.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  ) : (
    <div className="text-center py-8">
      <h3 className="text-2xl font-bold mb-4 twitch-purple">🎤 Voice Customization</h3>
      <div className="text-gray-400">
        <p className="mb-2">No chatters yet!</p>
        <p className="text-sm">Connect to a Twitch channel and wait for messages to customize voices</p>
      </div>
    </div>
  );
};

export default VoiceSettings;
