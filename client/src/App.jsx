import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

export default function App() {
	const [code, setCode] = useState('// Start coding...');
	const [isRecording, setIsRecording] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	//   const [readOnly, setReadOnly] = useState(false)
	// const readOnly = isPlaying

	const mediaRecorderRef = useRef(null);
	const chunksRef = useRef([]);
	const oplogRef = useRef([]);
	const startTimeRef = useRef(0);

	const audioRef = useRef(null);
	const [savedData, setSavedData] = useState(null);

	// =========================
	// RECORDING
	// =========================

	const startRecording = async () => {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

		const recorder = new MediaRecorder(stream);
		mediaRecorderRef.current = recorder;

		chunksRef.current = [];
		oplogRef.current = [];
		startTimeRef.current = Date.now();

		recorder.ondataavailable = (e) => {
			chunksRef.current.push(e.data);
		};

		recorder.start();
		setIsRecording(true);
	};

	const saveToBackend = async (data) => {
		const reader = new FileReader();

		reader.readAsDataURL(data.audioBlob);

		reader.onloadend = async () => {
			const base64Audio = reader.result;

			await fetch('http://localhost:8000/api/scrims', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					title: 'test scrim',
					description: 'testing',
					videodescription: {
						oplog: data.oplog,
						audio: base64Audio, // optional
					},
					videourl: 'temp',
					oplogurl: 'temp',
					duration: data.duration,
				}),
			});
		};
	};

	const stopRecording = () => {
		mediaRecorderRef.current.stop();

		mediaRecorderRef.current.onstop = async () => {
			const audioBlob = new Blob(chunksRef.current, {
				type: 'audio/webm',
			});

			const data = {
				audioBlob,
				oplog: oplogRef.current,
				duration: (Date.now() - startTimeRef.current) / 1000,
			};

			if (oplogRef.current.length === 0) {
				oplogRef.current.push({
					time: 0,
					code,
				});
			}

			console.log('data: ', data);

			setSavedData(data);

			// 👉 API CALL (replace URL)
			//   const formData = new FormData()
			//   formData.append("audio", audioBlob)
			//   formData.append("oplog", JSON.stringify(data.oplog))
			//   formData.append("duration", data.duration)
			saveToBackend(data);

			console.log('data.oplog: ', data.oplog);

			//   await fetch("http://localhost:8080/api/scrim", {
			//     method: "POST",
			//     body: formData
			//   })

			alert('Saved to backend');
		};

		setIsRecording(false);
	};

	//   const saveStep = () => {
	//     if (!isRecording) return

	//     oplogRef.current.push({
	//       time: (Date.now() - startTimeRef.current) / 1000,
	//       code
	//     })
	//   }

	useEffect(() => {
		if (!isRecording) return;

		const interval = setInterval(() => {
			oplogRef.current.push({
				time: (Date.now() - startTimeRef.current) / 1000,
				code,
			});
		}, 300); // every 300ms → smooth typing effect

		return () => clearInterval(interval);
	}, [code, isRecording]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const handlePlay = () => setIsPlaying(true);
		const handlePause = () => setIsPlaying(false);
		const handleEnded = () => setIsPlaying(false);

		audio.addEventListener('play', handlePlay);
		audio.addEventListener('pause', handlePause);
		audio.addEventListener('ended', handleEnded);

		return () => {
			audio.removeEventListener('play', handlePlay);
			audio.removeEventListener('pause', handlePause);
			audio.removeEventListener('ended', handleEnded);
		};
	}, []);

	// =========================
	// PLAYBACK
	// =========================

	const applyOplog = (time) => {
		if (!savedData) return;

		let newCode = '';

		for (let op of savedData.oplog) {
			if (op.time <= time) {
				newCode = op.code;
			}
		}

		setCode(newCode);
	};

	const play = () => {
		if (!savedData) return;

		const audioURL = URL.createObjectURL(savedData.audioBlob);
		audioRef.current.src = audioURL;
		audioRef.current.play();
	};

	const pause = () => {
		audioRef.current.pause();

		// 🔥 force editor to become editable
		setTimeout(() => {
			setCode((prev) => prev);
		}, 0);
	};

	useEffect(() => {
		if (!audioRef.current || !savedData) return;

		const interval = setInterval(() => {
			if (audioRef.current && !audioRef.current.paused) {
				applyOplog(audioRef.current.currentTime);
			}
		}, 200);

		return () => clearInterval(interval);
	}, [savedData]);

	// =========================
	// UI
	// =========================

	return (
		<div style={{ padding: 20 }}>
			<h2>Scrim MVP</h2>

			<Editor
				key={isPlaying ? 'readonly' : 'editable'} // 🔥 FORCE REMOUNT
				height="400px"
				defaultLanguage="javascript"
				value={code}
				onChange={(val) => {
					if (!isPlaying) setCode(val || '');
				}}
				options={{
					readOnly: isPlaying,
					minimap: { enabled: false },
					fontSize: 14,
				}}
			/>

			<div style={{ marginTop: 10 }}>
				{/* Recording */}
				<button onClick={startRecording} disabled={isRecording}>
					Start Recording
				</button>

				<button onClick={stopRecording} disabled={!isRecording}>
					Stop Recording
				</button>

				<button disabled={!isRecording}>Save Step</button>

				{/* Playback */}
				<button onClick={play} disabled={!savedData || isPlaying}>
					Play
				</button>

				<button onClick={pause} disabled={!isPlaying}>
					Pause
				</button>
			</div>

			<audio ref={audioRef} controls style={{ marginTop: 10 }} />
			<iframe
				title="preview"
				style={{
					width: '100%',
					height: '200px',
					border: '1px solid #ccc',
					marginTop: '10px',
				}}
				srcDoc={`
            <html>
            <body>
                <div id="root"></div>
                <script>
                const root = document.getElementById('root');

                const log = console.log;
                console.log = function(...args) {
                    const el = document.createElement('div');
                    el.innerText = args.join(' ');
                    root.appendChild(el);
                    log(...args);
                };

                try {
                    ${code}
                } catch (e) {
                    root.innerHTML = "<pre>" + e + "</pre>";
                }
                </script>
            </body>
            </html>
        `}
			/>
		</div>
	);
}
