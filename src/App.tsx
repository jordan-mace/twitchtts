import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

import { VoiceId } from "@aws-sdk/client-polly";
import {
  SynthesizeSpeechCommand,
  DescribeVoicesCommand,
} from "@aws-sdk/client-polly";
import TwitchListener, { TwitchMessage } from "./TwitchListener";
import { pollyClient } from "./Polly";

const TwitchContext = React.createContext("");

interface TwitchUserVoice {
  username: string | undefined;
  pollyVoice: string | undefined;
}

function App() {
  const [twitchChat] = useState<string[]>([]);
  const [pollyVoices, setPollyVoices] = useState<(string | undefined)[]>([]);
  const [twitchUserVoices] = useState<TwitchUserVoice[]>([]);

  const TTS = (message: string, pollyVoice: string | undefined) => {
    pollyClient
      .send(
        new SynthesizeSpeechCommand({
          Engine: "standard",
          OutputFormat: "mp3",
          Text: message,
          VoiceId: pollyVoice as VoiceId,
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
        audio.play();
      });
  };

  // Load Polly voices
  useEffect(() => {
    pollyClient
      .send(
        new DescribeVoicesCommand({
          Engine: "standard",
          LanguageCode: "en-US",
          IncludeAdditionalLanguageCodes: true,
        })
      )
      .then((result) => {
        if (result.Voices) setPollyVoices(result.Voices.map((x) => x.Id));
        else console.log("Could not get voices from Polly!");
      });
  }, []);

  const processMessage = (message: TwitchMessage) => {
    const username = message.username;
    var voiceToUse = twitchUserVoices.find((x) => x.username == username);

    twitchChat.push(`${message.username}: ${message.message}`);

    if (!message.play) return;

    if (voiceToUse == undefined) {
      const randomVoice = Math.floor(Math.random() * pollyVoices.length) + 1;
      const voice = {
        username: username,
        pollyVoice: pollyVoices[randomVoice],
      };
      voiceToUse = voice;
      console.log(`Giving ${username} the ${voiceToUse.pollyVoice} voice`);
      twitchUserVoices.push(voice);
    }

    TTS(message.message, voiceToUse.pollyVoice);
  };

  return (
    <TwitchContext.Provider value={twitchChat.join()}>
      <div className="App">
        <header className="App-header">
          <TwitchListener
            onMessage={(message: TwitchMessage) => processMessage(message)}
          />
          <textarea value={twitchChat} />
        </header>
      </div>
    </TwitchContext.Provider>
  );
}

export default App;
