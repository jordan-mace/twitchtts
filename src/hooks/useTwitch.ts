import { useEffect, useState } from "react";
import { ChatUserstate, Client } from "tmi.js";
import { useStateContext } from "../StateContext";
import { TwitchMessage } from "../types";

export const useTwitch = () => {
    const { twitchSettings, setTwitchChat } = useStateContext();
    const [tmiClient, setTmiClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const connect = (channel: string) => {
        if (channel) {
            const client = new Client({
                connection: {
                    secure: true,
                    reconnect: true,
                },
                channels: [channel],
            });
            setTmiClient(client);
        }
    };

    useEffect(() => {
        if (!tmiClient) {
            setIsConnected(false);
            return;
        }

        const isMod = (tags: ChatUserstate) =>
            tags.mod ||
            tags.badges?.broadcaster === "1" ||
            tags.badges?.staff === "1" ||
            tags.badges?.admin === "1" ||
            tags.badges?.moderator === "1" ||
            tags.badges?.global_mod === "1";

        const isCommand = (message: string) => message.startsWith("!");

        const isLikelyBot = (tags: ChatUserstate) =>
            tags.username === "nightbot" || tags.username === "streamlabs";

        const hasBits = (tags: ChatUserstate) => tags.bits !== undefined;

        const isSubbed = (tags: ChatUserstate) => tags.subscriber;

        const onMessageHandler = (
            channel: string,
            tags: ChatUserstate,
            message: string,
            self: boolean
        ) => {
            if (self) return;

            const { ModsOnly, BitsOnly, SubsOnly } = twitchSettings;

            if (ModsOnly && !isMod(tags)) return;
            if (BitsOnly && !hasBits(tags)) return;
            if (SubsOnly && !isSubbed(tags)) return;
            if (isCommand(message) || isLikelyBot(tags)) return;

            const newMessage: TwitchMessage = {
                username: tags.username,
                id: tags.id,
                isSubbed: tags.subscriber ?? false,
                message: message.toLowerCase(),
                play: true,
            };

            setTwitchChat((oldChat) => [...oldChat, newMessage]);
        };

        const onConnectedHandler = () => {
            setIsConnected(true);
            setTwitchChat((oldChat) => [
                ...oldChat,
                {
                    username: "SYSTEM",
                    id: `connect.${Date.now()}`,
                    isSubbed: false,
                    message: "Connected to Twitch!",
                    play: false,
                },
            ]);
        };

        tmiClient.on("message", onMessageHandler);
        tmiClient.on("connected", onConnectedHandler);

        tmiClient.connect().catch(console.error);

        return () => {
            tmiClient.off("message", onMessageHandler);
            tmiClient.off("connected", onConnectedHandler);
            tmiClient.disconnect();
        };
    }, [tmiClient, twitchSettings, setTwitchChat]);

    return { isConnected, connect };
};
