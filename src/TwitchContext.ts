import React from "react";

export interface Twitch {
    ModsOnly: boolean,
    DonatorVoice: boolean
}

const defaultTwitch: Twitch = {ModsOnly: false, DonatorVoice: false}

export const TwitchContext = React.createContext(defaultTwitch);