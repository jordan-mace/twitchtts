import { Voice } from "@aws-sdk/client-polly";

export interface Twitch {
    ModsOnly: boolean,
    SubsOnly: boolean,
    BitsOnly: boolean,
    DonatorVoice: boolean
}

export interface TwitchMessage {
  username: string | undefined;
  id: string | undefined;
  isSubbed: boolean;
  message: string;
  play: boolean;
}

// I'll also add the other interfaces here to have a single source of truth for types.
export interface TwitchSettingsProps {
    settings: Twitch;
    onChange: (settings: Twitch) => void;
}

export interface VoiceSettingsProps {
    pollyVoices: Voice[];
    twitchVoices: Record<string, Voice>;
    onChange: (voices: Record<string, Voice>) => void;
}

export interface TwitchListenerProps {
    twitchSettings: Twitch
    onMessage: (message: TwitchMessage) => void;
}
