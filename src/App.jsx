import { useEffect, useRef, useState } from "react";
import './App.css'

export default function WebSpeechTTS() {
    const synth = window.speechSynthesis;

    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(0);
    const [status, setStatus] = useState("Status: Ready.");
    const textRef = useRef();

    // Load voices when available
    const loadVoices = () => {
        const v = synth.getVoices();
        if (v.length > 0) {
            setVoices(v);
            setStatus(`Status: Loaded ${v.length} voices.`);
        }
    };

    useEffect(() => {
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        // fallback load
        setTimeout(loadVoices, 500);
    }, []);

    const speak = () => {
        const text = textRef.current.value.trim();
        if (!text) return alert("Please enter some text");

        synth.cancel();

        const utter = new SpeechSynthesisUtterance(text);

        if (voices[selectedVoice]) {
            utter.voice = voices[selectedVoice];
        }

        utter.rate = 1;
        utter.pitch = 1;
        utter.volume = 1;

        utter.onstart = () => setStatus("Status: Speaking...");
        utter.onend = () => setStatus("Status: Finished speaking.");
        utter.onerror = (e) => setStatus(`Status: Error - ${e.error}`);

        synth.speak(utter);
    };

    const stop = () => {
        if (synth.speaking) {
            synth.cancel();
            setStatus("Status: Stopped.");
        }
    };

    return (
        <div className="container">
            <h1>🎤 Web Speech API (Browser Native TTS)</h1>

            <div className="tts-card">
                <textarea
                    ref={textRef}
                    defaultValue="Hello! I'm the native Web Speech API. Change my voice below and click Speak."
                />

                <div className="button-group">
                    <button onClick={speak}>🔊 Speak</button>
                    <button className="secondary" onClick={stop}>⏹️ Stop</button>
                </div>

                <label>Choose a voice:</label>
                <select
                    className="voice-selector"
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(Number(e.target.value))}
                >
                    {voices.length === 0 && (
                        <option>Loading voices…</option>
                    )}

                    {voices.map((v, i) => (
                        <option key={i} value={i}>
                            {v.name} ({v.lang}) {v.default ? " [Default]" : ""}
                        </option>
                    ))}
                </select>

                <div className="status-area">{status}</div>

                <button className="outline margin-top" onClick={loadVoices}>
                    🔄 Load Available Voices
                </button>
            </div>
        </div>
    );
}
