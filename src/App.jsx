import { useEffect, useRef, useState } from "react";
import './App.css'

export default function WebSpeechTTS() {
    const synth = window.speechSynthesis;

    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(0);
    const [status, setStatus] = useState("Status: Ready.");
    const textRef = useRef();

    const isAndroid = /Android/i.test(navigator.userAgent);
    const isEdge = /EdgA/i.test(navigator.userAgent);

    // 🔥 NEW: Android Edge voice loader
    const loadAndroidVoices = () => {
        try {
            if (window.AndroidSpeech && window.AndroidSpeech.getVoices) {
                const json = window.AndroidSpeech.getVoices();
                const parsed = JSON.parse(json);

                setVoices(parsed);
                setStatus(`Status: Loaded ${parsed.length} Android voices.`);
                return true;
            }
        } catch (e) {
            console.log("AndroidSpeech error:", e);
        }
        return false;
    };

    // 🔥 Web Speech API loader (Firefox, Desktop)
    const loadWebVoices = () => {
        const v = synth.getVoices();
        if (v.length > 0) {
            setVoices(v);
            setStatus(`Status: Loaded ${v.length} voices.`);
            return true;
        }
        return false;
    };

    // 🔥 Combined loader
    const loadVoices = () => {
        if (isAndroid && isEdge) {
            if (loadAndroidVoices()) return;
        }
        loadWebVoices();
    };

    useEffect(() => {
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        setTimeout(loadVoices, 500);
    }, []);

    // 🔥 Speak using AndroidSpeech if available
    const speakAndroid = (text, voice) => {
        window.AndroidSpeech.speak(text, JSON.stringify(voice));
    };

    const speakWeb = (text, voice) => {
        synth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.voice = voice;
        utter.rate = 1;
        utter.pitch = 1;
        utter.volume = 1;

        utter.onstart = () => setStatus("Status: Speaking...");
        utter.onend = () => setStatus("Status: Finished speaking.");
        utter.onerror = (e) => setStatus(`Status: Error - ${e.error}`);

        synth.speak(utter);
    };

    const speak = () => {
        const text = textRef.current.value.trim();
        if (!text) return alert("Please enter some text");

        const voice = voices[selectedVoice];

        if (isAndroid && isEdge && window.AndroidSpeech) {
            speakAndroid(text, voice);
        } else {
            speakWeb(text, voice);
        }
    };

    const stop = () => {
        if (isAndroid && isEdge && window.AndroidSpeech) {
            window.AndroidSpeech.stop();
            setStatus("Status: Stopped.");
        } else {
            synth.cancel();
            setStatus("Status: Stopped.");
        }
    };

    // 🔥 Preview voice
    const previewVoice = (voice) => {
        if (isAndroid && isEdge && window.AndroidSpeech) {
            window.AndroidSpeech.speak("This is a preview of my voice.", JSON.stringify(voice));
        } else {
            speakWeb("This is a preview of my voice.", voice);
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
                            {v.name} ({v.lang})
                        </option>
                    ))}
                </select>

                <div className="status-area">{status}</div>

                <button className="outline margin-top" onClick={loadVoices}>
                    🔄 Load Available Voices
                </button>

                <h3 style={{ marginTop: "20px" }}>Voice Preview List</h3>

                <div className="voice-preview-list">
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {voices.map((voice, index) => (
                            <li key={index} style={{ marginBottom: "10px" }}>
                                <strong>{voice.name}</strong> ({voice.lang})
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
