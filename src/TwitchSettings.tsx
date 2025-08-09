import { useStateContext } from "./StateContext";

const TwitchSettings = () => {
  const { twitchSettings, setTwitchSettings } = useStateContext();

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setTwitchSettings({ ...twitchSettings, [name]: checked });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">⚙️ Stream Settings</h3>
      <div className="space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            name="ModsOnly"
            checked={twitchSettings.ModsOnly}
            onChange={handleCheckboxChange}
            className="gaming-checkbox"
          />
          <span className="text-gray-200">🛡️ Moderators Only</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            name="DonatorVoice"
            checked={twitchSettings.DonatorVoice}
            onChange={handleCheckboxChange}
            className="gaming-checkbox"
          />
          <span className="text-gray-200">💎 Premium Voices for Subs/Donors</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            name="BitsOnly"
            checked={twitchSettings.BitsOnly}
            onChange={handleCheckboxChange}
            className="gaming-checkbox"
          />
          <span className="text-gray-200">💰 Only TTS messages with Bits</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            name="SubsOnly"
            checked={twitchSettings.SubsOnly}
            onChange={handleCheckboxChange}
            className="gaming-checkbox"
          />
          <span className="text-gray-200">🗣️ Subs only</span>
        </label>
      </div>
    </div>
  );
};

export default TwitchSettings;
