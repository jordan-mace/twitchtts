import { Component, useEffect, useState } from "react";
import "./App.css";
import { VoiceId } from "@aws-sdk/client-polly";
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

interface TwitchUserVoice {
  username: string | undefined;
  pollyVoice: string | undefined;
}

const App: React.FC = () => {
  const [twitchChat, setTwitchChat] = useState<TwitchMessage[]>([]);
  const [twitch, setTwitch] = useState<Twitch>({
    ModsOnly: false,
    DonatorVoice: false,
  });
  const [standardVoices, setStandardVoices] = useState<(string | undefined)[]>(
    []
  );
  const [generativeVoices, setGenerativeVoices] = useState<
    (string | undefined)[]
  >([]);
  const [twitchUserVoices, setTwitchVoices] = useState<TwitchUserVoice[]>([]);

  const chatLogs: TwitchMessage[] = [];
  const voices: TwitchUserVoice[] = [];

  const TTS = (
    message: string,
    isSubbed: boolean | undefined,
    pollyVoice: string | undefined
  ) => {
    pollyClient
      .send(
        new SynthesizeSpeechCommand({
          Engine: isSubbed ? "generative" : "standard",
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
        audio.play().then(() => audio.remove());
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
        if (result.Voices) setStandardVoices(result.Voices.map((x) => x.Id));
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
        if (result.Voices) setGenerativeVoices(result.Voices.map((x) => x.Id));
        else console.log("Could not get voices from Polly!");
      });
  }, []);

  const pickRandomVoice = (
    username: string | undefined,
    Voices: (string | undefined)[]
  ) => {
    const randomVoice = Math.floor(Math.random() * Voices.length + 1);
    const voice = {
      username: username,
      pollyVoice: Voices[randomVoice],
    };
    return voice;
  };

  const getVoice = (message: TwitchMessage) => {
    const username = message.username;
    const isSubbed = message.isSubbed;

    var voiceToUse = twitchUserVoices.find((x) => x.username === username);

    if (voiceToUse === undefined) {
      voiceToUse = pickRandomVoice(
        username,
        isSubbed ? generativeVoices : standardVoices
      );
      console.log(`Giving ${username} the ${voiceToUse.pollyVoice} voice`);
    }

    if (voiceToUse.pollyVoice === undefined)
      voiceToUse.pollyVoice = standardVoices[0];

    voices.push(voiceToUse);
    setTwitchVoices(voices);
    return voiceToUse;
  };

  const processMessage = (message: TwitchMessage) => {
    chatLogs.push(message);
    setTwitchChat(chatLogs);

    if (!message.play) return;

    TTS(message.message, message.isSubbed, getVoice(message).pollyVoice);
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
