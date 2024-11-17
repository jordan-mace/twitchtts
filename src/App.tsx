import { Component, useEffect, useState } from "react";
import "./App.css";
import { Voice, VoiceId } from "@aws-sdk/client-polly";
import {
  SynthesizeSpeechCommand,
  DescribeVoicesCommand,
} from "@aws-sdk/client-polly";
import TwitchListener, { TwitchMessage } from "./TwitchListener";
import { pollyClient } from "./Polly";
import styled from "styled-components";
import { Twitch, TwitchContext } from "./TwitchContext";
import TwitchSettings from "./TwitchSettings";

const Box = styled("div")`
  flex-direction: row;
  width: 30rem;
  margin-top: 5rem;
  margin-left: 40rem;
`;

const ChatBox = styled("div")`
  width: 100%;
  height: 500px;
  overflow-y: scroll;
  padding-left: 0;
  list-style-type: none;
`;

const App: React.FC = () => {
  const [twitchChat, setTwitchChat] = useState<TwitchMessage[]>([]);
  const [twitch, setTwitch] = useState<Twitch>({
    ModsOnly: false,
    DonatorVoice: false,
  });
  const [pollyVoices, setPollyVoices] = useState<Voice[]>([]);
  const [twitchVoices, setTwitchVoices] = useState<Record<string, Voice>>({});

  const TTS = (
    message: string,
    isSubbed: boolean | undefined,
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

    pollyClient
      .send(
        new DescribeVoicesCommand({
          Engine: "generative",
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
    if (isSubbed) {
      const filtered = Voices.filter((x) =>
        x.SupportedEngines?.includes("generative")
      );
      const randomVoice = Math.floor(Math.random() * filtered.length + 1);
      return filtered[randomVoice];
    }

    const randomVoice = Math.floor(Math.random() * Voices.length + 1);
    return Voices[randomVoice];
  };

  const getVoice = (message: TwitchMessage) => {
    const username = message.username;
    if (username === undefined) return pollyVoices[0];

    const isSubbed = message.isSubbed;
    const voice = twitchVoices[username];
    console.log(`found voice ${voice?.Name} for ${username}`);

    if (voice === undefined) {
      var randomVoice = pickRandomVoice(isSubbed, pollyVoices);
      console.log(`Giving ${username} the ${randomVoice.Name} voice`);
      var newArray = twitchVoices;
      newArray[username] = randomVoice;
      setTwitchVoices(newArray);
      return randomVoice;
    }

    return voice;
  };

  const processMessage = (message: TwitchMessage) => {
    setTwitchChat((oldChat) => [...oldChat, message]);

    if (!message.play) return;

    TTS(message.message, message.isSubbed, getVoice(message));
  };

  return (
    <>
      <Box>
        <TwitchContext.Provider value={twitch}>
          <div className="App">
            <TwitchListener
              onMessage={(message: TwitchMessage) => processMessage(message)}
            />
            <TwitchSettings onChange={(twitch: Twitch) => setTwitch(twitch)} />
            <ChatBox>
              {twitchChat.map((x) => (
                <p key={x.id}>
                  {x.username}: {x.message}
                </p>
              ))}
            </ChatBox>
          </div>
        </TwitchContext.Provider>
      </Box>
    </>
  );
};

export default App;
