import { useEffect, useState } from "react";
import { MenuItem, Select } from "@mui/material";
import { Voice } from "@aws-sdk/client-polly";

export interface VoiceSettingsProps {
  pollyVoices: Voice[];
  twitchVoices: Record<string, Voice>;
  onChange: (voices: Record<string, Voice>) => void;
}

const VoiceSettings = (props: VoiceSettingsProps) => {
  const { twitchVoices, pollyVoices, onChange } = props;
  const [currentUser, setCurrentUser] = useState("");
  const [currentVoice, setCurrentVoice] = useState("");
  const [voices, setVoices] = useState<Record<string, Voice>>(twitchVoices);

  useEffect(() => {
    if (voices[currentUser] === undefined) return;
    if (voices[currentUser].Id === undefined) return;
    setCurrentVoice(voices[currentUser].Id ?? "");
  }, [currentUser, voices]);

  useEffect(() => {
    var newVoice = pollyVoices.find((x) => x.Id === currentVoice);
    if (newVoice === undefined) return;

    var newVoices = voices;
    newVoices[currentUser] = newVoice;
    setVoices(newVoices);
    onChange(voices);
  }, [currentVoice, currentUser, pollyVoices, voices, onChange]);

  return Object.entries(voices).length > 0 ? (
    <>
      <h3>Manual Voices</h3>
      <Select
        fullWidth
        sx={{ mt: "2rem", mb: "2rem" }}
        label="Chatters"
        value={currentUser}
        onChange={(event) => setCurrentUser(event.target.value)}
      >
        {Object.keys(voices).map((x) => (
          <MenuItem value={x}>{x}</MenuItem>
        ))}
      </Select>
      <Select
        sx={{ mb: "2rem" }}
        fullWidth
        label="Voice"
        value={currentVoice}
        onChange={(event) => setCurrentVoice(event.target.value)}
      >
        {props.pollyVoices.map((x) => (
          <MenuItem value={x.Id}>
            {x.Name} ({x.SupportedEngines?.join()})
          </MenuItem>
        ))}
      </Select>
    </>
  ) : null;
};

export default VoiceSettings;
