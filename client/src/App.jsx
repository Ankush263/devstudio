import { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';

export default function App() {
	const [code, setCode] = useState('// Start coding...');
	const [isRecording, setIsRecording] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);

	// Refs for recording state (avoids stale closures in Monaco event handlers)
	const isRecordingRef = useRef(false);
	const isPlayingRef = useRef(false);

	// Pause/resume refs
	const pausedTimeRef = useRef(0);
	const pausedIndexRef = useRef(0);
	const pausedSnapshotRef = useRef('');

	// Recording refs
	const mediaRecorderRef = useRef(null);
	const chunksRef = useRef([]);
	const oplogRef = useRef([]);
	const startTimeRef = useRef(0);
	const editorRef = useRef(null);

	// Playback refs
	const audioRef = useRef(null);
	const lastAppliedIndexRef = useRef(0);
	const playbackIntervalRef = useRef(null);
	const audioBlobURLRef = useRef(null);

	const [savedData, setSavedData] = useState(null);

	// Keep refs in sync with state
	useEffect(() => {
		isRecordingRef.current = isRecording;
	}, [isRecording]);

	useEffect(() => {
		isPlayingRef.current = isPlaying;
	}, [isPlaying]);

	// Update Monaco readOnly when isPlaying changes
	useEffect(() => {
		if (editorRef.current) {
			editorRef.current.updateOptions({ readOnly: isPlaying });
		}
	}, [isPlaying]);

	// =========================
	// RECORDING
	// =========================

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const recorder = new MediaRecorder(stream);
			mediaRecorderRef.current = recorder;

			// Reset pause state
			pausedTimeRef.current = 0;
			pausedIndexRef.current = 0;
			pausedSnapshotRef.current = '';

			chunksRef.current = [];
			oplogRef.current = [];
			startTimeRef.current = Date.now();

			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) {
					chunksRef.current.push(e.data);
				}
			};

			// Capture the initial editor state as the first oplog entry
			const initialCode = editorRef.current
				? editorRef.current.getValue()
				: code;

			oplogRef.current.push({
				time: 0,
				changes: [
					{
						range: {
							startLineNumber: 1,
							startColumn: 1,
							endLineNumber: 1,
							endColumn: 1,
						},
						text: initialCode,
						isInitial: true, // flag so playback knows this is a full-replace
					},
				],
			});

			recorder.start(100); // collect chunks every 100ms for smoother data
			setIsRecording(true);
		} catch (err) {
			console.error('Failed to start recording:', err);
			alert('Microphone access denied or unavailable.');
		}
	};

	const stopRecording = () => {
		if (!mediaRecorderRef.current) return;

		mediaRecorderRef.current.stop();

		// Stop all audio tracks so the mic indicator goes away
		mediaRecorderRef.current.stream
			.getTracks()
			.forEach((t) => t.stop());

		mediaRecorderRef.current.onstop = () => {
			const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

			const data = {
				audioBlob,
				oplog: [...oplogRef.current],
				duration: (Date.now() - startTimeRef.current) / 1000,
			};

			console.log('Recording saved:', data.oplog.length, 'ops,', data.duration.toFixed(1), 's');
			setSavedData(data);

			// Optionally save to backend
			// saveToBackend(data);
		};

		setIsRecording(false);
	};

	// =========================
	// PLAYBACK
	// =========================

	const applyOplog = useCallback(
		(currentTime) => {
			if (!savedData || !editorRef.current) return;

			const model = editorRef.current.getModel();
			if (!model) return;

			while (
				lastAppliedIndexRef.current < savedData.oplog.length &&
				savedData.oplog[lastAppliedIndexRef.current].time <= currentTime
			) {
				const op = savedData.oplog[lastAppliedIndexRef.current];

				// The first op (index 0) is a full-replace of the initial code
				if (lastAppliedIndexRef.current === 0 && op.changes[0]?.isInitial) {
					model.setValue(op.changes[0].text);
				} else {
					for (const change of op.changes) {
						model.applyEdits([
							{
								range: new window.monaco.Range(
									change.range.startLineNumber,
									change.range.startColumn,
									change.range.endLineNumber,
									change.range.endColumn,
								),
								text: change.text,
							},
						]);
					}
				}

				lastAppliedIndexRef.current++;
			}

			setCode(model.getValue());
		},
		[savedData],
	);

	const play = () => {
		if (!savedData || !editorRef.current || !audioRef.current) return;

		const model = editorRef.current.getModel();
		if (!model) return;

		const resumeTime = pausedTimeRef.current || 0;
		const resumeIndex = pausedIndexRef.current || 0;

		// If resuming from pause, restore the exact paused snapshot
		// If playing from start, rebuild from oplog[0]
		if (resumeIndex > 0 && pausedSnapshotRef.current) {
			model.setValue(pausedSnapshotRef.current);
			setCode(pausedSnapshotRef.current);
		} else {
			// Playing from the beginning
			const initialCode =
				savedData.oplog?.[0]?.changes?.[0]?.text || '// Start coding...';
			model.setValue(initialCode);
			setCode(initialCode);
		}

		lastAppliedIndexRef.current = resumeIndex > 0 ? resumeIndex : 1; // skip initial op (already applied via setValue)

		// Create blob URL if needed
		if (audioBlobURLRef.current) {
			URL.revokeObjectURL(audioBlobURLRef.current);
		}
		audioBlobURLRef.current = URL.createObjectURL(savedData.audioBlob);
		audioRef.current.src = audioBlobURLRef.current;

		setIsPlaying(true);

		// Wait for audio to be ready, then seek and play
		const onCanPlay = () => {
			audioRef.current.removeEventListener('canplay', onCanPlay);
			audioRef.current.currentTime = resumeTime;
			audioRef.current.play().catch((err) => {
				console.error('Audio play failed:', err);
				setIsPlaying(false);
			});
		};

		audioRef.current.addEventListener('canplay', onCanPlay);
		// If already ready (e.g. same src), fire immediately
		if (audioRef.current.readyState >= 3) {
			audioRef.current.removeEventListener('canplay', onCanPlay);
			audioRef.current.currentTime = resumeTime;
			audioRef.current.play().catch((err) => {
				console.error('Audio play failed:', err);
				setIsPlaying(false);
			});
		}
	};

	const pause = () => {
		if (!audioRef.current || !editorRef.current) return;

		// Save the exact playback position
		pausedTimeRef.current = audioRef.current.currentTime;
		pausedIndexRef.current = lastAppliedIndexRef.current;
		pausedSnapshotRef.current = editorRef.current.getValue();

		audioRef.current.pause();
		setIsPlaying(false);
	};

	const restart = () => {
		// Reset all pause state to replay from the beginning
		pausedTimeRef.current = 0;
		pausedIndexRef.current = 0;
		pausedSnapshotRef.current = '';
		lastAppliedIndexRef.current = 0;

		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
		}

		setIsPlaying(false);

		// Reset editor to initial state
		if (savedData && editorRef.current) {
			const initialCode =
				savedData.oplog?.[0]?.changes?.[0]?.text || '// Start coding...';
			editorRef.current.getModel()?.setValue(initialCode);
			setCode(initialCode);
		}
	};

	// Playback sync interval — applies oplog entries as audio progresses
	useEffect(() => {
		if (isPlaying && savedData) {
			playbackIntervalRef.current = setInterval(() => {
				if (audioRef.current && !audioRef.current.paused) {
					applyOplog(audioRef.current.currentTime);
				}
			}, 50); // 50ms for smoother playback
		}

		return () => {
			if (playbackIntervalRef.current) {
				clearInterval(playbackIntervalRef.current);
				playbackIntervalRef.current = null;
			}
		};
	}, [isPlaying, savedData, applyOplog]);

	// Listen for audio ending
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const handleEnded = () => {
			setIsPlaying(false);
			// Apply any remaining ops
			if (savedData) {
				applyOplog(Infinity);
			}
		};

		audio.addEventListener('ended', handleEnded);
		return () => audio.removeEventListener('ended', handleEnded);
	}, [savedData, applyOplog]);

	// Cleanup blob URLs on unmount
	useEffect(() => {
		return () => {
			if (audioBlobURLRef.current) {
				URL.revokeObjectURL(audioBlobURLRef.current);
			}
		};
	}, []);

	// =========================
	// EDITOR MOUNT
	// =========================

	const handleEditorMount = (editor) => {
		editorRef.current = editor;

		// Capture every content change during recording
		editor.onDidChangeModelContent((event) => {
			// Use ref, not state — this closure would otherwise be stale
			if (!isRecordingRef.current) return;

			const changes = event.changes.map((c) => ({
				range: {
					startLineNumber: c.range.startLineNumber,
					startColumn: c.range.startColumn,
					endLineNumber: c.range.endLineNumber,
					endColumn: c.range.endColumn,
				},
				text: c.text,
			}));

			oplogRef.current.push({
				time: (Date.now() - startTimeRef.current) / 1000,
				changes,
			});
		});
	};

	// =========================
	// UI
	// =========================

	return (
		<div style={{ padding: 20 }}>
			<h2>Scrim MVP</h2>

			<Editor
				onMount={handleEditorMount}
				height="400px"
				defaultLanguage="javascript"
				defaultValue={code}
				onChange={(val) => {
					// Only allow user edits to update state when NOT playing
					if (!isPlayingRef.current) {
						setCode(val || '');
					}
				}}
				options={{
					readOnly: isPlaying,
					minimap: { enabled: false },
					fontSize: 14,
				}}
			/>

			<div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
				{/* Recording controls */}
				<button
					onClick={startRecording}
					disabled={isRecording || isPlaying}
					style={{
						background: isRecording ? '#ccc' : '#e74c3c',
						color: 'white',
						border: 'none',
						padding: '8px 16px',
						borderRadius: 4,
						cursor: isRecording || isPlaying ? 'not-allowed' : 'pointer',
					}}
				>
					⏺ Start Recording
				</button>

				<button
					onClick={stopRecording}
					disabled={!isRecording}
					style={{
						background: !isRecording ? '#ccc' : '#333',
						color: 'white',
						border: 'none',
						padding: '8px 16px',
						borderRadius: 4,
						cursor: !isRecording ? 'not-allowed' : 'pointer',
					}}
				>
					⏹ Stop Recording
				</button>

				<div style={{ width: 1, background: '#ccc', margin: '0 4px' }} />

				{/* Playback controls */}
				<button
					onClick={play}
					disabled={!savedData || isPlaying || isRecording}
					style={{
						background:
							!savedData || isPlaying || isRecording ? '#ccc' : '#27ae60',
						color: 'white',
						border: 'none',
						padding: '8px 16px',
						borderRadius: 4,
						cursor:
							!savedData || isPlaying || isRecording
								? 'not-allowed'
								: 'pointer',
					}}
				>
					{/* eslint-disable-next-line react-hooks/refs */}
					▶ {pausedTimeRef.current > 0 && !isPlaying ? 'Resume' : 'Play'}
				</button>

				<button
					onClick={pause}
					disabled={!isPlaying}
					style={{
						background: !isPlaying ? '#ccc' : '#f39c12',
						color: 'white',
						border: 'none',
						padding: '8px 16px',
						borderRadius: 4,
						cursor: !isPlaying ? 'not-allowed' : 'pointer',
					}}
				>
					⏸ Pause
				</button>

				<button
					onClick={restart}
					disabled={!savedData || isRecording}
					style={{
						background: !savedData || isRecording ? '#ccc' : '#8e44ad',
						color: 'white',
						border: 'none',
						padding: '8px 16px',
						borderRadius: 4,
						cursor: !savedData || isRecording ? 'not-allowed' : 'pointer',
					}}
				>
					⏮ Restart
				</button>
			</div>

			{isRecording && (
				<div style={{ marginTop: 8, color: '#e74c3c', fontWeight: 'bold' }}>
					{/*  eslint-disable-next-line react-hooks/refs */}
					🔴 Recording... ({oplogRef.current.length} ops captured)
				</div>
			)}

			<audio ref={audioRef} controls style={{ marginTop: 10, width: '100%' }} />

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