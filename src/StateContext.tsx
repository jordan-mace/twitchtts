import { Voice } from "@aws-sdk/client-polly";
import { createContext, ReactNode, useContext, useState } from "react";
import { useLocalStorage } from "hooks-ts";
import { Twitch, TwitchMessage } from "./types";

interface StateContextProps {
  twitchChat: TwitchMessage[];
  setTwitchChat: (chat: TwitchMessage[]) => void;
  twitchSettings: Twitch;
  setTwitchSettings: (settings: Twitch) => void;
  pollyVoices: Voice[];
  setPollyVoices: (voices: Voice[]) => void;
  twitchVoices: Record<string, Voice>;
  setTwitchVoices: (voices: Record<string, Voice>) => void;
}

const StateContext = createContext<StateContextProps | undefined>(undefined);

export const StateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [twitchChat, setTwitchChat] = useState<TwitchMessage[]>([]);
  const [twitchSettings, setTwitchSettings] = useLocalStorage<Twitch>("settings", {
    ModsOnly: false,
    DonatorVoice: false,
    SubsOnly: false,
    BitsOnly: false
  });
  const [pollyVoices, setPollyVoices] = useLocalStorage<Voice[]>("polly", []);
  const [twitchVoices, setTwitchVoices] = useLocalStorage<Record<string, Voice>>("voices", {});

  return (
    <StateContext.Provider
      value={{
        twitchChat,
        setTwitchChat,
        twitchSettings,
        setTwitchSettings,
        pollyVoices,
        setPollyVoices,
        twitchVoices,
        setTwitchVoices,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error("useStateContext must be used within a StateProvider");
  }
  return context;
};
