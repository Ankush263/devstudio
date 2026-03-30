import { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';

// ── Resizable floating panel (Scrimba-style) ──────────────────────────
function FloatingPanel({ children, defaultWidth = 380, defaultHeight = 260 }) {
	const panelRef = useRef(null);
	const [pos, setPos] = useState({ x: null, y: 40 });
	const [size, setSize] = useState({ w: defaultWidth, h: defaultHeight });
	const [minimized, setMinimized] = useState(false);

	// Set initial position to bottom-right once mounted
	useEffect(() => {
		if (pos.x === null) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setPos({ x: window.innerWidth - defaultWidth - 32, y: window.innerHeight - defaultHeight - 80 });
		}
	}, [defaultHeight, defaultWidth, pos.x]);

	const onDragStart = (e) => {
		e.preventDefault();
		const startX = e.clientX - pos.x;
		const startY = e.clientY - pos.y;
		const onMove = (ev) => setPos({ x: ev.clientX - startX, y: ev.clientY - startY });
		const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseup', onUp);
	};

	const onResizeStart = (e) => {
		e.preventDefault();
		e.stopPropagation();
		const startX = e.clientX;
		const startY = e.clientY;
		const startW = size.w;
		const startH = size.h;
		const onMove = (ev) => {
			setSize({
				w: Math.max(220, startW + (ev.clientX - startX)),
				h: Math.max(120, startH + (ev.clientY - startY)),
			});
		};
		const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseup', onUp);
	};

	if (pos.x === null) return null;

	return (
		<div
			ref={panelRef}
			style={{
				position: 'fixed',
				left: pos.x,
				top: pos.y,
				width: minimized ? 220 : size.w,
				height: minimized ? 36 : size.h,
				zIndex: 9999,
				borderRadius: 8,
				overflow: 'hidden',
				boxShadow: '0 8px 32px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.06)',
				display: 'flex',
				flexDirection: 'column',
				background: '#1e1e1e',
				border: '1px solid #333',
				transition: 'height 0.2s ease, width 0.2s ease',
			}}
		>
			{/* Title bar */}
			<div
				onMouseDown={onDragStart}
				style={{
					height: 36,
					minHeight: 36,
					background: '#2d2d2d',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '0 10px',
					cursor: 'grab',
					userSelect: 'none',
					borderBottom: minimized ? 'none' : '1px solid #404040',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<svg width="14" height="14" viewBox="0 0 16 16" fill="#569cd6"><path d="M4 2v12l8-6z" /></svg>
					<span style={{ color: '#cccccc', fontSize: 12, fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace", fontWeight: 500, letterSpacing: '.3px' }}>
						OUTPUT
					</span>
				</div>
				<div style={{ display: 'flex', gap: 4 }}>
					<button onClick={() => setMinimized(!minimized)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px' }}>
						{minimized ? '□' : '─'}
					</button>
				</div>
			</div>

			{/* Content */}
			{!minimized && (
				<div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
					{children}
					{/* Resize handle */}
					<div
						onMouseDown={onResizeStart}
						style={{
							position: 'absolute',
							bottom: 0,
							right: 0,
							width: 18,
							height: 18,
							cursor: 'nwse-resize',
							display: 'flex',
							alignItems: 'flex-end',
							justifyContent: 'flex-end',
							padding: 2,
						}}
					>
						<svg width="12" height="12" viewBox="0 0 12 12">
							<path d="M11 1v10H1" fill="none" stroke="#555" strokeWidth="1.5" />
							<path d="M11 5v6H5" fill="none" stroke="#555" strokeWidth="1.5" />
						</svg>
					</div>
				</div>
			)}
		</div>
	);
}

// ── Recording timer display ───────────────────────────────────────────
function RecordingTimer({ startTime, isRecording }) {
	const [elapsed, setElapsed] = useState(0);
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		if (!isRecording) { setElapsed(0); return; }
		const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 200);
		return () => clearInterval(iv);
	}, [isRecording, startTime]);
	const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
	const s = String(elapsed % 60).padStart(2, '0');
	return <span>{m}:{s}</span>;
}

// ══════════════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════════════
export default function App() {
	const [code, setCode] = useState('// Start coding...');
	const [isRecording, setIsRecording] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);

	const isRecordingRef = useRef(false);
	const isPlayingRef = useRef(false);

	const pausedTimeRef = useRef(0);
	const pausedIndexRef = useRef(0);
	const pausedSnapshotRef = useRef('');

	const mediaRecorderRef = useRef(null);
	const chunksRef = useRef([]);
	const oplogRef = useRef([]);
	const startTimeRef = useRef(0);
	const editorRef = useRef(null);

	const audioRef = useRef(null);
	const lastAppliedIndexRef = useRef(0);
	const playbackIntervalRef = useRef(null);
	const audioBlobURLRef = useRef(null);

	const [savedData, setSavedData] = useState(null);
	const [recordingStartTime, setRecordingStartTime] = useState(0);

	useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);
	useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
	useEffect(() => {
		if (editorRef.current) editorRef.current.updateOptions({ readOnly: isPlaying });
	}, [isPlaying]);

	// ── RECORDING ─────────────────────────────────────────────────────
	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const recorder = new MediaRecorder(stream);
			mediaRecorderRef.current = recorder;

			pausedTimeRef.current = 0;
			pausedIndexRef.current = 0;
			pausedSnapshotRef.current = '';
			chunksRef.current = [];
			oplogRef.current = [];
			startTimeRef.current = Date.now();
			setRecordingStartTime(Date.now());

			recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };

			const initialCode = editorRef.current ? editorRef.current.getValue() : code;
			oplogRef.current.push({
				time: 0,
				changes: [{ range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }, text: initialCode, isInitial: true }],
			});

			recorder.start(100);
			setIsRecording(true);
		} catch (err) {
			console.error('Failed to start recording:', err);
		}
	};

	const stopRecording = () => {
		if (!mediaRecorderRef.current) return;
		mediaRecorderRef.current.stop();
		mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
		mediaRecorderRef.current.onstop = () => {
			const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
			setSavedData({ audioBlob, oplog: [...oplogRef.current], duration: (Date.now() - startTimeRef.current) / 1000 });
		};
		setIsRecording(false);
	};

	// ── PLAYBACK ──────────────────────────────────────────────────────
	const applyOplog = useCallback((currentTime) => {
		if (!savedData || !editorRef.current) return;
		const model = editorRef.current.getModel();
		if (!model) return;

		while (lastAppliedIndexRef.current < savedData.oplog.length && savedData.oplog[lastAppliedIndexRef.current].time <= currentTime) {
			const op = savedData.oplog[lastAppliedIndexRef.current];
			if (lastAppliedIndexRef.current === 0 && op.changes[0]?.isInitial) {
				model.setValue(op.changes[0].text);
			} else {
				for (const change of op.changes) {
					model.applyEdits([{ range: new window.monaco.Range(change.range.startLineNumber, change.range.startColumn, change.range.endLineNumber, change.range.endColumn), text: change.text }]);
				}
			}
			lastAppliedIndexRef.current++;
		}
		setCode(model.getValue());
	}, [savedData]);

	const play = () => {
		if (!savedData || !editorRef.current || !audioRef.current) return;
		const model = editorRef.current.getModel();
		if (!model) return;

		const resumeTime = pausedTimeRef.current || 0;
		const resumeIndex = pausedIndexRef.current || 0;

		if (resumeIndex > 0 && pausedSnapshotRef.current) {
			model.setValue(pausedSnapshotRef.current);
			setCode(pausedSnapshotRef.current);
		} else {
			const initialCode = savedData.oplog?.[0]?.changes?.[0]?.text || '// Start coding...';
			model.setValue(initialCode);
			setCode(initialCode);
		}

		lastAppliedIndexRef.current = resumeIndex > 0 ? resumeIndex : 1;

		if (audioBlobURLRef.current) URL.revokeObjectURL(audioBlobURLRef.current);
		audioBlobURLRef.current = URL.createObjectURL(savedData.audioBlob);
		audioRef.current.src = audioBlobURLRef.current;
		setIsPlaying(true);

		const onCanPlay = () => {
			audioRef.current.removeEventListener('canplay', onCanPlay);
			audioRef.current.currentTime = resumeTime;
			audioRef.current.play().catch(() => setIsPlaying(false));
		};
		audioRef.current.addEventListener('canplay', onCanPlay);
		if (audioRef.current.readyState >= 3) {
			audioRef.current.removeEventListener('canplay', onCanPlay);
			audioRef.current.currentTime = resumeTime;
			audioRef.current.play().catch(() => setIsPlaying(false));
		}
	};

	const pause = () => {
		if (!audioRef.current || !editorRef.current) return;
		pausedTimeRef.current = audioRef.current.currentTime;
		pausedIndexRef.current = lastAppliedIndexRef.current;
		pausedSnapshotRef.current = editorRef.current.getValue();
		audioRef.current.pause();
		setIsPlaying(false);
	};

	const restart = () => {
		pausedTimeRef.current = 0;
		pausedIndexRef.current = 0;
		pausedSnapshotRef.current = '';
		lastAppliedIndexRef.current = 0;
		if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
		setIsPlaying(false);
		if (savedData && editorRef.current) {
			const initialCode = savedData.oplog?.[0]?.changes?.[0]?.text || '// Start coding...';
			editorRef.current.getModel()?.setValue(initialCode);
			setCode(initialCode);
		}
	};

	useEffect(() => {
		if (isPlaying && savedData) {
			playbackIntervalRef.current = setInterval(() => {
				if (audioRef.current && !audioRef.current.paused) applyOplog(audioRef.current.currentTime);
			}, 50);
		}
		return () => { if (playbackIntervalRef.current) { clearInterval(playbackIntervalRef.current); playbackIntervalRef.current = null; } };
	}, [isPlaying, savedData, applyOplog]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;
		const handleEnded = () => { setIsPlaying(false); if (savedData) applyOplog(Infinity); };
		audio.addEventListener('ended', handleEnded);
		return () => audio.removeEventListener('ended', handleEnded);
	}, [savedData, applyOplog]);

	useEffect(() => { return () => { if (audioBlobURLRef.current) URL.revokeObjectURL(audioBlobURLRef.current); }; }, []);

	// ── EDITOR MOUNT ──────────────────────────────────────────────────
	const handleEditorMount = (editor) => {
		editorRef.current = editor;
		editor.onDidChangeModelContent((event) => {
			if (!isRecordingRef.current) return;
			const changes = event.changes.map((c) => ({
				range: { startLineNumber: c.range.startLineNumber, startColumn: c.range.startColumn, endLineNumber: c.range.endLineNumber, endColumn: c.range.endColumn },
				text: c.text,
			}));
			oplogRef.current.push({ time: (Date.now() - startTimeRef.current) / 1000, changes });
		});
	};

	// ══════════════════════════════════════════════════════════════════
	//  UI
	// ══════════════════════════════════════════════════════════════════

	return (
		<>
			{/* Google Font */}
			<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

			<style>{`
				* { margin: 0; padding: 0; box-sizing: border-box; }
				html, body, #root { height: 100%; background: #1e1e1e; overflow: hidden; }

				@keyframes pulse-rec { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }
				@keyframes slide-up { from { transform: translateY(6px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

				.toolbar-btn {
					display: inline-flex; align-items: center; gap: 6px;
					padding: 0 12px; height: 32px;
					background: transparent; border: 1px solid #404040; color: #ccc;
					border-radius: 4px; cursor: pointer;
					font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 500;
					letter-spacing: .3px; transition: all .15s ease; white-space: nowrap;
				}
				.toolbar-btn:hover:not(:disabled) { background: #2a2d2e; border-color: #528bff; color: #fff; }
				.toolbar-btn:disabled { opacity: .35; cursor: not-allowed; }
				.toolbar-btn.rec { border-color: #f44747; color: #f44747; }
				.toolbar-btn.rec:hover:not(:disabled) { background: rgba(244,71,71,.12); }
				.toolbar-btn.rec.active { background: rgba(244,71,71,.15); border-color: #f44747; color: #f44747; animation: pulse-rec 1.4s ease-in-out infinite; }
				.toolbar-btn.stop { border-color: #ccc; }
				.toolbar-btn.stop:hover:not(:disabled) { background: #333; }
				.toolbar-btn.play { border-color: #4ec9b0; color: #4ec9b0; }
				.toolbar-btn.play:hover:not(:disabled) { background: rgba(78,201,176,.1); }
				.toolbar-btn.pause { border-color: #dcdcaa; color: #dcdcaa; }
				.toolbar-btn.pause:hover:not(:disabled) { background: rgba(220,220,170,.08); }
				.toolbar-btn.restart { border-color: #c586c0; color: #c586c0; }
				.toolbar-btn.restart:hover:not(:disabled) { background: rgba(197,134,192,.08); }

				.status-bar {
					height: 24px; background: #007acc; display: flex; align-items: center;
					padding: 0 12px; font-family: 'JetBrains Mono', monospace;
					font-size: 11px; color: #fff; justify-content: space-between;
					transition: background .3s ease;
				}
				.status-bar.recording { background: #c72e2e; }
				.status-bar.playing { background: #2ea84a; }

				.tab {
					display: inline-flex; align-items: center; gap: 6px;
					padding: 0 16px; height: 100%; background: #1e1e1e;
					border-right: 1px solid #252526; border-top: 2px solid #007acc;
					color: #fff; font-size: 12px;
					font-family: 'JetBrains Mono', monospace;
				}

				.audio-player {
					display: flex; align-items: center; gap: 8px;
					padding: 0 12px; height: 36px; background: #252526;
					border-top: 1px solid #333;
				}
				.audio-player audio { height: 28px; flex: 1; filter: invert(1) hue-rotate(180deg); opacity: .7; }
			`}</style>

			<div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: "'JetBrains Mono', monospace" }}>

				{/* ── Title Bar ─────────────────────────────────────────── */}
				<div style={{ height: 36, background: '#323233', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #252526' }}>
					<span style={{ color: '#888', fontSize: 12, letterSpacing: '.5px' }}>SCRIM</span>
				</div>

				{/* ── Toolbar ──────────────────────────────────────────── */}
				<div style={{
					height: 44, background: '#252526', display: 'flex', alignItems: 'center',
					padding: '0 12px', gap: 6, borderBottom: '1px solid #1e1e1e',
				}}>
					<button className={`toolbar-btn rec ${isRecording ? 'active' : ''}`} onClick={startRecording} disabled={isRecording || isPlaying}>
						<span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
						{isRecording ? 'REC' : 'RECORD'}
					</button>

					<button className="toolbar-btn stop" onClick={stopRecording} disabled={!isRecording}>
						<span style={{ width: 8, height: 8, background: 'currentColor', display: 'inline-block', borderRadius: 1 }} />
						STOP
					</button>

					<div style={{ width: 1, height: 20, background: '#404040', margin: '0 6px' }} />

					<button className="toolbar-btn play" onClick={play} disabled={!savedData || isPlaying || isRecording}>
						<svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor"><path d="M0 0l10 6-10 6z" /></svg>
						{/* eslint-disable-next-line react-hooks/refs */}
						{pausedTimeRef.current > 0 && !isPlaying ? 'RESUME' : 'PLAY'}
					</button>

					<button className="toolbar-btn pause" onClick={pause} disabled={!isPlaying}>
						<svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor"><rect x="1" width="3" height="12" /><rect x="6" width="3" height="12" /></svg>
						PAUSE
					</button>

					<button className="toolbar-btn restart" onClick={restart} disabled={!savedData || isRecording}>
						<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1v4h4M11 11V7H7" /><path d="M9.5 4.5A4.5 4.5 0 002 3.5M2.5 7.5A4.5 4.5 0 0010 8.5" /></svg>
						RESTART
					</button>

					<div style={{ flex: 1 }} />

					{isRecording && (
						<div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f44747', fontSize: 12, animation: 'slide-up .3s ease' }}>
							<span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f44747', animation: 'pulse-rec 1s ease-in-out infinite' }} />
							<RecordingTimer startTime={recordingStartTime} isRecording={isRecording} />
						</div>
					)}

					{savedData && !isRecording && (
						<span style={{ color: '#666', fontSize: 11 }}>
							{savedData.oplog.length} ops · {savedData.duration.toFixed(1)}s
						</span>
					)}
				</div>

				{/* ── Tab bar ──────────────────────────────────────────── */}
				<div style={{ height: 36, background: '#252526', display: 'flex', alignItems: 'stretch' }}>
					<div className="tab">
						<svg width="14" height="14" viewBox="0 0 16 16" fill="#e8ab53"><path d="M2 2h5l2 2h5v10H2z" /></svg>
						scrim.js
					</div>
				</div>

				{/* ── Editor ──────────────────────────────────────────── */}
				<div style={{ flex: 1, position: 'relative' }}>
					<Editor
						onMount={handleEditorMount}
						height="100%"
						defaultLanguage="javascript"
						defaultValue={code}
						theme="vs-dark"
						onChange={(val) => { if (!isPlayingRef.current) setCode(val || ''); }}
						options={{
							readOnly: isPlaying,
							minimap: { enabled: true, scale: 1, showSlider: 'mouseover' },
							fontSize: 14,
							fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
							fontLigatures: true,
							lineHeight: 22,
							padding: { top: 12, bottom: 12 },
							scrollBeyondLastLine: false,
							smoothScrolling: true,
							cursorBlinking: 'smooth',
							cursorSmoothCaretAnimation: 'on',
							renderLineHighlight: 'gutter',
							bracketPairColorization: { enabled: true },
							guides: { bracketPairs: true },
						}}
					/>
				</div>

				{/* ── Audio bar ────────────────────────────────────────── */}
				{savedData && (
					<div className="audio-player">
						<svg width="12" height="12" viewBox="0 0 16 16" fill="#888"><path d="M2 5v6h3l4 4V1L5 5z" /><path d="M12 4a5 5 0 010 8M10 6a3 3 0 010 4" fill="none" stroke="#888" strokeWidth="1.2" /></svg>
						<audio ref={audioRef} controls style={{ flex: 1 }} />
					</div>
				)}
				{!savedData && <audio ref={audioRef} style={{ display: 'none' }} />}

				{/* ── Status bar ───────────────────────────────────────── */}
				<div className={`status-bar ${isRecording ? 'recording' : isPlaying ? 'playing' : ''}`}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
						{isRecording && <span>⏺ Recording</span>}
						{isPlaying && <span>▶ Playing</span>}
						{!isRecording && !isPlaying && <span>Ready</span>}
					</div>
					<div style={{ display: 'flex', gap: 16 }}>
						<span>JavaScript</span>
						<span>UTF-8</span>
					</div>
				</div>
			</div>

			{/* ── Floating Output Panel (Scrimba-style) ──────────────── */}
			<FloatingPanel>
				<iframe
					title="preview"
					style={{ width: '100%', height: '100%', border: 'none', background: '#1e1e1e' }}
					srcDoc={`
						<html>
						<head><style>
							body { background: #1e1e1e; color: #d4d4d4; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; padding: 10px; margin: 0; line-height: 1.6; }
							div { animation: fade-in .15s ease; }
							@keyframes fade-in { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; } }
							pre { color: #f44747; white-space: pre-wrap; word-break: break-all; }
						</style></head>
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
							try { ${code} } catch (e) { root.innerHTML = "<pre>" + e + "</pre>"; }
							</script>
						</body>
						</html>
					`}
				/>
			</FloatingPanel>
		</>
	);
}