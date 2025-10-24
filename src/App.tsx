import { useEffect, useState } from "react";
import "./App.css";
import TwitchListener, { TwitchMessage } from "./TwitchListener";
import { speechifyClient, VITE_BUILD_ID } from "./Polly";
import { Twitch } from "./TwitchContext";
import TwitchSettings from "./TwitchSettings";
import VoiceSettings from "./VoiceSettings";
import { useLocalStorage } from "hooks-ts";
import { GetVoice } from "@speechify/api/api/resources/tts";

const App: React.FC = () => {
  const [twitchChat, setTwitchChat] = useState<TwitchMessage[]>([]);
  const [twitch, setTwitch] = useLocalStorage<Twitch>("settings", {
    ModsOnly: false,
    DonatorVoice: false,
    SubsOnly: false,
    BitsOnly: false
  });

  const [speechifyVoices, setSpeechifyVoices] = useLocalStorage<GetVoice[]>("polly", []);
  const [twitchVoices, setTwitchVoices] = useLocalStorage<Record<string, GetVoice>>("voices", {});

  const TTS = (
    message: string,
    speechifyVoice: GetVoice
  ) => {
    speechifyClient.tts.audio.speech({
      input: message,
      voiceId: speechifyVoice.id,
      audioFormat: "mp3"
    })
    .then((response) => response.audioData)
    .then((audioData) => {
      const audio = new Audio("data:audio/mp3;base64," + audioData);
      audio.play().then(() => audio.remove());
    })
  };

  // Load Polly voices
  useEffect(() => {
    if(speechifyVoices.length > 0) return;

    const getVoices = async() => {
      const voices = await speechifyClient.tts.voices.list();
      setSpeechifyVoices(voices);
      return voices;
    }

    getVoices();
  }, []);

  const pickRandomVoice = (isSubbed: boolean, Voices: GetVoice[]) => {
    if (isSubbed && twitch.DonatorVoice) {
      const randomVoice = Math.floor(Math.random() * Voices.length - 1);
      return Voices[randomVoice];
    }

    const randomVoice = Math.floor(Math.random() * Voices.length - 1);
    return Voices[randomVoice];
  };

  const getVoice = (message: TwitchMessage) => {
    const username = message.username;
    if (username === undefined) 
      return speechifyVoices[0];

    const isSubbed = message.isSubbed;
    const voice = twitchVoices[username];

    if (voice === undefined) {
      var randomVoice = pickRandomVoice(isSubbed, speechifyVoices);
      console.log(`Giving ${username} the ${randomVoice.displayName} voice`);
      var newArray = twitchVoices;
      newArray[username] = randomVoice;
      setTwitchVoices(newArray);
      return randomVoice;
    }

    console.log(`found voice ${voice.displayName} for ${username}`);
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
                pollyVoices={speechifyVoices}
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
