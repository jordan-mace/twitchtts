import { useEffect, useState } from "react";
import "./App.css";
import { Voice } from "@aws-sdk/client-polly";
import {
  SynthesizeSpeechCommand,
  DescribeVoicesCommand,
} from "@aws-sdk/client-polly";
import TwitchListener, { TwitchMessage } from "./TwitchListener";
import { pollyClient } from "./Polly";
import styled from "styled-components";
import { Twitch, TwitchContext } from "./TwitchContext";
import TwitchSettings from "./TwitchSettings";
import VoiceSettings from "./VoiceSettings";
import { Container } from "@mui/material";

const ChatBox = styled("div")`
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
    if (message.username === "Nightbot") return;
    if (message.message.startsWith("!")) return;

    TTS(message.message, message.isSubbed, getVoice(message));
  };

  return (
    <Container sx={{ mt: "5rem" }}>
      <TwitchContext.Provider value={twitch}>
        <div className="App">
          <TwitchListener
            onMessage={(message: TwitchMessage) => processMessage(message)}
          />
          <TwitchSettings onChange={(twitch: Twitch) => setTwitch(twitch)} />
          <div style={{ flexDirection: "row", display: "flex" }}>
            <div style={{ width: "50%" }}>
              <VoiceSettings
                pollyVoices={pollyVoices}
                twitchVoices={twitchVoices}
                onChange={(voices) => setTwitchVoices(voices)}
              />
            </div>
            <div style={{ width: "50%" }}>
              <h3>Chat</h3>
              <ChatBox>
                {twitchChat.map((x) => (
                  <p key={x.id}>
                    {x.username}: {x.message}
                  </p>
                ))}
              </ChatBox>
            </div>
          </div>
        </div>
      </TwitchContext.Provider>
    </Container>
  );
};

export default App;
