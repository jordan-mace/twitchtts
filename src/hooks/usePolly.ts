import { useEffect } from "react";
import { Voice } from "@aws-sdk/client-polly";
import {
  SynthesizeSpeechCommand,
  DescribeVoicesCommand,
} from "@aws-sdk/client-polly";
import { pollyClient } from "../Polly";
import { useStateContext } from "../StateContext";
import { TwitchMessage } from "../types";

export const usePolly = () => {
  const {
    pollyVoices,
    setPollyVoices,
    twitchVoices,
    setTwitchVoices,
    twitchChat,
    twitchSettings,
  } = useStateContext();

  // Load Polly voices on initial render
  useEffect(() => {
    if (pollyVoices.length > 0) return;

    const fetchVoices = async () => {
      const standardVoicesCmd = new DescribeVoicesCommand({
        Engine: "standard",
        LanguageCode: "en-US",
        IncludeAdditionalLanguageCodes: true,
      });
      const neuralVoicesCmd = new DescribeVoicesCommand({
        Engine: "neural",
        LanguageCode: "en-US",
        IncludeAdditionalLanguageCodes: true,
      });

      const [standardVoices, neuralVoices] = await Promise.all([
        pollyClient.send(standardVoicesCmd),
        pollyClient.send(neuralVoicesCmd),
      ]);

      const allVoices = [
        ...(standardVoices.Voices ?? []),
        ...(neuralVoices.Voices ?? []),
      ];
      setPollyVoices(allVoices);
    };

    fetchVoices().catch(console.error);
  }, [pollyVoices.length, setPollyVoices]);

  const TTS = (message: string, pollyVoice: Voice) => {
    if (!pollyVoice.SupportedEngines) {
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
        return output.AudioStream.transformToByteArray();
      })
      .then((array) => {
        if (!array) return;
        const audio = new Audio();
        const blob = new Blob([array], { type: "audio/mp3" });
        const url = window.URL.createObjectURL(blob);
        audio.src = url;
        audio.play().then(() => {
          window.URL.revokeObjectURL(url);
          audio.remove();
        });
      });
  };

  const pickRandomVoice = (isSubbed: boolean) => {
    if (isSubbed && twitchSettings.DonatorVoice) {
      const filtered = pollyVoices.filter((x) =>
        x.SupportedEngines?.includes("generative")
      );
      if (filtered.length > 0) {
        const randomVoice = Math.floor(Math.random() * filtered.length);
        return filtered[randomVoice];
      }
    }

    const randomVoice = Math.floor(Math.random() * pollyVoices.length);
    return pollyVoices[randomVoice];
  };

  const getVoice = (message: TwitchMessage) => {
    const { username, isSubbed } = message;
    if (!username) return pollyVoices[0];

    const voice = twitchVoices[username];

    if (!voice) {
      const randomVoice = pickRandomVoice(isSubbed);
      if (randomVoice) {
        console.log(`Giving ${username} the ${randomVoice.Name} voice`);
        setTwitchVoices({ ...twitchVoices, [username]: randomVoice });
        return randomVoice;
      }
      return pollyVoices[0]; // Fallback
    }

    console.log(`found voice ${voice.Name} for ${username}`);
    return voice;
  };

  // Effect to process new messages and trigger TTS
  useEffect(() => {
    if (twitchChat.length === 0) return;
    const lastMessage = twitchChat[twitchChat.length - 1];
    if (lastMessage && lastMessage.play && pollyVoices.length > 0) {
      TTS(lastMessage.message, getVoice(lastMessage));
    }
  }, [twitchChat, pollyVoices]); // Rerun when chat or voices change
};
