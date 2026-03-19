import { useEffect, useRef, useState } from "react";
import './App.css'

export default function WebSpeechTTS() {
    const synth = window.speechSynthesis;

    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(0);
    const [status, setStatus] = useState("Status: Ready.");
    const textRef = useRef();

    const isAndroid = /Android/i.test(navigator.userAgent);

    const forceAndroidVoiceLoad = () => {
        const dummy = new SpeechSynthesisUtterance(" ");
        synth.speak(dummy);
        synth.cancel();
    };

    const loadVoices = () => {
        let v = synth.getVoices();

        if (v.length > 0) {
            setVoices(v);
            setStatus(`Status: Loaded ${v.length} voices.`);
            return;
        }

        if (isAndroid) {
            forceAndroidVoiceLoad();
        }
    };

    const startVoicePolling = () => {
        let attempts = 0;
        const maxAttempts = 20;

        const interval = setInterval(() => {
            const v = synth.getVoices();
            if (v.length > 0) {
                clearInterval(interval);
                setVoices(v);
                setStatus(`Status: Loaded ${v.length} voices.`);
            }
            attempts++;
            if (attempts >= maxAttempts) clearInterval(interval);
        }, 300);
    };

    useEffect(() => {
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        if (isAndroid) {
            startVoicePolling();
        }

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

    const previewVoice = (voice) => {
        synth.cancel();
        const utter = new SpeechSynthesisUtterance("This is a preview of my voice.");
        utter.voice = voice;
        utter.rate = 1;
        utter.pitch = 1;
        utter.volume = 1;
        synth.speak(utter);
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

                {/* 🔥 Scrollable Voice Preview List */}
                <h3 style={{ marginTop: "20px" }}>Voice Preview List</h3>

                <div className="voice-preview-list">
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {voices.map((voice, index) => (
                            <li key={index} style={{ marginBottom: "10px" }}>
                                <strong>{voice.name}</strong> ({voice.lang})
                                {voice.default && " [Default]"}
                                <button
                                    style={{ marginLeft: "10px" }}
                                    onClick={() => previewVoice(voice)}
                                >
                                    ▶ Preview
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
