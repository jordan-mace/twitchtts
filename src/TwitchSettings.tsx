import { useEffect, useState } from "react";
import { Twitch } from "./TwitchContext";

export interface TwitchSettingsProps {
  settings: Twitch;
  onChange: (settings: Twitch) => void;
}

const TwitchSettings = (props: TwitchSettingsProps) => {
  const { onChange, settings } = props;
  const [modsOnly, setModsOnly] = useState(settings.ModsOnly);
  const [donatorVoice, setDonatorVoice] = useState(settings.DonatorVoice);
  const [subsOnly, setSubsOnly] = useState(settings.SubsOnly);
  const [bitsOnly, setBitsOnly] = useState(settings.BitsOnly);

  useEffect(() => {
    onChange({
      DonatorVoice: donatorVoice,
      ModsOnly: modsOnly,
      SubsOnly: subsOnly,
      BitsOnly: bitsOnly
    });
  }, [modsOnly, donatorVoice, subsOnly, bitsOnly]);

  return settings && (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">⚙️ Stream Settings</h3>
      <div className="space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={modsOnly}
            onChange={() => setModsOnly(!modsOnly)}
            className="gaming-checkbox"
          />
          <span className="text-gray-200">🛡️ Moderators Only</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={donatorVoice}
            onChange={() => setDonatorVoice(!donatorVoice)}
            className="gaming-checkbox"
          />
          <span className="text-gray-200">💎 Premium Voices for Subs/Donors</span>
        </label>
                <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={bitsOnly}
            onChange={() => setBitsOnly(!bitsOnly)}
            className="gaming-checkbox"
          />
          <span className="text-gray-200">💰 Only TTS messages with Bits</span>
        </label>
                <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={subsOnly}
            onChange={() => setSubsOnly(!subsOnly)}
            className="gaming-checkbox"
          />
          <span className="text-gray-200">🗣️ Subs only</span>
        </label>
      </div>
    </div>
  );
};

export default TwitchSettings;
