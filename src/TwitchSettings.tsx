import { useEffect, useState } from "react";
import styled from "styled-components";
import { Checkbox, FormControlLabel } from "@mui/material";
import { Twitch } from "./TwitchContext";

export interface TwitchSettingsProps {
  onChange: (settings: Twitch) => void;
}

const Label = styled(FormControlLabel)`
  width: 100%;
`;

const TwitchSettings = (props: TwitchSettingsProps) => {
  const { onChange } = props;
  const [modsOnly, setModsOnly] = useState(false);
  const [donatorVoice, setDonatorVoice] = useState(false);

  useEffect(() => {
    onChange({
      DonatorVoice: donatorVoice,
      ModsOnly: modsOnly,
    });
  }, [modsOnly, donatorVoice, onChange]);

  return (
    <>
      <Label
        control={<Checkbox onChange={() => setModsOnly(!modsOnly)} />}
        label="Mods only"
      />
      <Label
        control={<Checkbox onChange={() => setDonatorVoice(!donatorVoice)} />}
        label="Give Subs/Donator's better voice (costs more)"
      />
    </>
  );
};

export default TwitchSettings;
