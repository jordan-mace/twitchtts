import "./App.css";
import { VITE_BUILD_ID } from "./Polly";
import TwitchListener from "./TwitchListener";
import TwitchSettings from "./TwitchSettings";
import VoiceSettings from "./VoiceSettings";
import { usePolly } from "./hooks/usePolly";
import { useTwitch } from "./hooks/useTwitch";
import { useStateContext } from "./StateContext";

const App: React.FC = () => {
  useTwitch();
  usePolly();

  const { twitchChat } = useStateContext();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="twitch-purple">Twitch</span> Voice Bot
          </h1>
          <p className="text-gray-300">
            Transform your stream with AI-powered text-to-speech
          </p>
          <p className="text-gray-300">Build {VITE_BUILD_ID}</p>
        </div>

        {/* Main Connection Card */}
        <div className="gaming-card max-w-3xl mb-16">
          <TwitchListener />
          <TwitchSettings />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-8">
          {/* Voice Settings */}
          <div className="gaming-card">
            <VoiceSettings />
          </div>

          {/* Chat Display */}
          <div className="gaming-card">
            <h3 className="text-center py-8 twitch-purple">Live Chat</h3>
            <div className="h-96 overflow-y-scroll max-h-400 space-y-2 pr-2">
              {twitchChat.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>No messages yet...</p>
                  <p className="text-sm">
                    Connect to a Twitch channel to see chat messages
                  </p>
                </div>
              ) : (
                twitchChat.map((x) => (
                  <div key={x.id} className="chat-message">
                    <span className="font-semibold twitch-purple">
                      {x.username}:{" "}
                    </span>
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
