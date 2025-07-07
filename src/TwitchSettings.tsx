import { useEffect, useState } from "react";
import { Twitch } from "./TwitchContext";

export interface TwitchSettingsProps {
  onChange: (settings: Twitch) => void;
}

const TwitchSettings = (props: TwitchSettingsProps) => {
  const { onChange } = props;
  const [modsOnly, setModsOnly] = useState(false);
  const [donatorVoice, setDonatorVoice] = useState(false);

  useEffect(() => {
    onChange({
      DonatorVoice: donatorVoice,
      ModsOnly: modsOnly,
    });
  }, [modsOnly, donatorVoice]);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">⚙️ Stream Settings</h3>
      <div className="space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            onChange={() => setModsOnly(!modsOnly)}
            className="gaming-checkbox"
          />
          <span className="text-gray-200">🛡️ Moderators Only</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            onChange={() => setDonatorVoice(!donatorVoice)}
            className="gaming-checkbox"
          />
          <span className="text-gray-200">💎 Premium Voices for Subs/Donors</span>
        </label>
      </div>
    </div>
  );
};

export default TwitchSettings;
