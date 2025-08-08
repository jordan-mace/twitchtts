import { useEffect, useState } from "react";
import "./App.css";
import { Voice } from "@aws-sdk/client-polly";
import {
  SynthesizeSpeechCommand,
  DescribeVoicesCommand,
} from "@aws-sdk/client-polly";
import TwitchListener, { TwitchMessage } from "./TwitchListener";
import { pollyClient, VITE_BUILD_ID } from "./Polly";
import { Twitch } from "./TwitchContext";
import TwitchSettings from "./TwitchSettings";
import VoiceSettings from "./VoiceSettings";
import { useLocalStorage } from "hooks-ts";

const App: React.FC = () => {
  const [twitchChat, setTwitchChat] = useState<TwitchMessage[]>([]);
  const [twitch, setTwitch] = useLocalStorage<Twitch>("settings", {
    ModsOnly: false,
    DonatorVoice: false,
    SubsOnly: false,
    BitsOnly: false
  });
  const [pollyVoices, setPollyVoices] = useLocalStorage<Voice[]>("polly", []);
  const [twitchVoices, setTwitchVoices] = useLocalStorage<Record<string, Voice>>("voices", {});

  const TTS = (
    message: string,
    pollyVoice: Voice
  ) => {
    if (pollyVoice.SupportedEngines === undefined) {
      console.log(`Undefined engine for pollyVoice ${pollyVoice.Id}`);
      return;
    }

    pollyClient
      .send(
        new SynthesizeSpeechCommand({
          Engine: pollyVoice.SupportedEngines[0],
          OutputFormat: "mp3",
          Text: message,
          VoiceId: pollyVoice.Id,
        })
      )
      .then((output) => {
        if (!output.AudioStream) return;
        return output.AudioStream?.transformToByteArray();
      })
      .then((array) => {
        if (!array) return;
        const audio = new Audio();
        var blob = new Blob([array], { type: "audio/mp3" });
        var url = window.URL.createObjectURL(blob);
        audio.src = url;
        audio.play().then(() => audio.remove());
      });
  };

  // Load Polly voices
  useEffect(() => {
    if(pollyVoices.length > 0) return;
    
    var voices: Voice[] = [];

    pollyClient
      .send(
        new DescribeVoicesCommand({
          Engine: "standard",
          LanguageCode: "en-US",
          IncludeAdditionalLanguageCodes: true,
        })
      )
      .then((result) => {
        if (result.Voices) voices.push(...result.Voices);
        else console.log("Could not get voices from Polly!");
      });

    pollyClient
      .send(
        new DescribeVoicesCommand({
          Engine: "neural",
          LanguageCode: "en-US",
          IncludeAdditionalLanguageCodes: true,
        })
      )
      .then((result) => {
        if (result.Voices) voices.push(...result.Voices);
        else console.log("Could not get voices from Polly!");
      });

    setPollyVoices(voices);
  }, []);

  const pickRandomVoice = (isSubbed: boolean, Voices: Voice[]) => {
    if (isSubbed && twitch.DonatorVoice) {
      const filtered = Voices.filter((x) =>
        x.SupportedEngines?.includes("generative")
      );
      const randomVoice = Math.floor(Math.random() * filtered.length - 1);
      return filtered[randomVoice];
    }

    const randomVoice = Math.floor(Math.random() * Voices.length - 1);
    return Voices[randomVoice];
  };

  const getVoice = (message: TwitchMessage) => {
    const username = message.username;
    if (username === undefined) return pollyVoices[0];

    const isSubbed = message.isSubbed;
    const voice = twitchVoices[username];

    if (voice === undefined) {
      var randomVoice = pickRandomVoice(isSubbed, pollyVoices);
      console.log(`Giving ${username} the ${randomVoice.Name} voice`);
      var newArray = twitchVoices;
      newArray[username] = randomVoice;
      setTwitchVoices(newArray);
      return randomVoice;
    }

    console.log(`found voice ${voice.Name} for ${username}`);
    return voice;
  };

  const processMessage = (message: TwitchMessage) => {
    setTwitchChat((oldChat) => [...oldChat, message]);

    if (!message.play) return;
    if (message.username === "nightbot") return;
    if (message.message.startsWith("!")) return;

    TTS(message.message, getVoice(message));
  };

  return (
    <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="twitch-purple">Twitch</span> Voice Bot
            </h1>
            <p className="text-gray-300">Transform your stream with AI-powered text-to-speech</p>
            <p className="text-gray-300">Build {VITE_BUILD_ID}</p>
          </div>

          {/* Main Connection Card */}
          <div className="gaming-card max-w-3xl mb-16">
            <TwitchListener
              twitchSettings={twitch}
              onMessage={(message: TwitchMessage) => processMessage(message)}
            />
            <TwitchSettings settings={twitch} onChange={(twitch: Twitch) => setTwitch(twitch)} />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-8">
            {/* Voice Settings */}
            <div className="gaming-card">
              <VoiceSettings
                pollyVoices={pollyVoices}
                twitchVoices={twitchVoices}
                onChange={(voices) => setTwitchVoices(voices)}
              />
            </div>

            {/* Chat Display */}
            <div className="gaming-card">
              <h3 className="text-center py-8 twitch-purple">Live Chat</h3>
              <div className="h-96 overflow-y-scroll max-h-400 space-y-2 pr-2">
                {twitchChat.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <p>No messages yet...</p>
                    <p className="text-sm">Connect to a Twitch channel to see chat messages</p>
                  </div>
                ) : (
                  twitchChat.map((x) => (
                    <div key={x.id} className="chat-message">
                      <span className="font-semibold twitch-purple">{x.username}: </span>
                      <span className="ml-2">{x.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default App;
