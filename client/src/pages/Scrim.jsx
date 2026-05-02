import { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from '@/components/ui/dialog';
import {
	Circle,
	Square,
	Play,
	Pause,
	RotateCcw,
	GitFork,
	Plus,
	X,
	Menu,
	Volume2,
	Hexagon,
	ChevronRight,
	Atom,
	Terminal,
	PanelLeft,
} from 'lucide-react';
import { FileExplorer } from './scrim/FileExplorer';
import { FloatingPanel } from './scrim/FloatingPanel';
import { ScrimSidebar } from './scrim/ScrimSidebar';

// ─────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────
const API_BASE = 'http://localhost:8000/api';

function api(path, opts = {}) {
	const token = localStorage.getItem('jwt');
	return fetch(`${API_BASE}${path}`, {
		...opts,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...opts.headers,
		},
	}).then(async (r) => {
		if (!r.ok) throw new Error(await r.text());
		return r.json().catch(() => null);
	});
}

// ─────────────────────────────────────────────
//  AUTH MODAL
// ─────────────────────────────────────────────
function AuthModal({ onAuth }) {
	const [mode, setMode] = useState('login');
	const [form, setForm] = useState({ username: '', email: '', password: '' });
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const submit = async () => {
		setError('');
		setLoading(true);
		try {
			const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';
			const body =
				mode === 'login'
					? { email: form.email, password: form.password }
					: {
							username: form.username,
							email: form.email,
							password: form.password,
						};
			const data = await api(endpoint, {
				method: 'POST',
				body: JSON.stringify(body),
			});
			if (data?.token) {
				localStorage.setItem('jwt', data.token);
				onAuth(data);
			}
		} catch (e) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && !loading) submit();
	};

	return (
		<>
			<style>{`
				@keyframes auth-slide-up {
					from { opacity: 0; transform: translateY(20px) scale(0.97); }
					to   { opacity: 1; transform: translateY(0)   scale(1); }
				}
				@keyframes auth-fade-in {
					from { opacity: 0; }
					to   { opacity: 1; }
				}
				.auth-backdrop { animation: auth-fade-in 0.2s ease forwards; }
				.auth-card     { animation: auth-slide-up 0.28s cubic-bezier(0.22,1,0.36,1) forwards; }
				.auth-tab-active { position: relative; }
				.auth-input:focus { border-color: rgba(96,165,250,0.6) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important; }
				.auth-btn-primary {
					background: linear-gradient(135deg, #3b82f6, #6366f1);
					transition: all 0.2s ease;
				}
				.auth-btn-primary:hover:not(:disabled) {
					background: linear-gradient(135deg, #2563eb, #4f46e5);
					transform: translateY(-1px);
					box-shadow: 0 4px 20px rgba(99,102,241,0.4);
				}
				.auth-btn-primary:active:not(:disabled) { transform: translateY(0); }
				.auth-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
				.auth-mode-btn { transition: all 0.2s cubic-bezier(0.22,1,0.36,1); }
				.auth-error { animation: auth-slide-up 0.2s ease forwards; }
			`}</style>
			<div className="auth-backdrop fixed inset-0 z-99999 flex items-center justify-center"
				style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}>
				<div
					className="auth-card relative w-full max-w-sm mx-4 rounded-2xl flex flex-col overflow-hidden"
					style={{
						background: 'linear-gradient(160deg, #18181b 0%, #09090b 100%)',
						border: '1px solid rgba(255,255,255,0.07)',
						boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
					}}
				>
					{/* Top gradient accent bar */}
					<div style={{
						height: '2px',
						background: 'linear-gradient(90deg, transparent, #3b82f6, #6366f1, transparent)',
					}} />

					<div className="p-8 flex flex-col gap-6">
						{/* Logo */}
						<div className="flex flex-col items-center gap-3 mb-1">
							<div style={{
								width: 48, height: 48, borderRadius: 14,
								background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1))',
								border: '1px solid rgba(59,130,246,0.25)',
								display: 'flex', alignItems: 'center', justifyContent: 'center',
								boxShadow: '0 0 20px rgba(59,130,246,0.15)',
							}}>
								<Hexagon className="w-6 h-6 text-blue-400" strokeWidth={1.5}
									style={{ fill: 'rgba(59,130,246,0.2)' }} />
							</div>
							<div className="text-center">
								<div className="font-mono text-xl font-bold tracking-[0.25em] text-white" style={{
									background: 'linear-gradient(90deg,#93c5fd,#a5b4fc)',
									WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
								}}>SCRIM</div>
								<div className="text-zinc-500 text-[11px] mt-0.5 tracking-wider">
									{mode === 'login' ? 'Welcome back' : 'Create your account'}
								</div>
							</div>
						</div>

						{/* Tab toggle */}
						<div className="flex rounded-xl p-1 gap-1" style={{
							background: 'rgba(255,255,255,0.04)',
							border: '1px solid rgba(255,255,255,0.06)',
						}}>
							{['login', 'signup'].map((m) => (
								<button
									key={m}
									onClick={() => { setMode(m); setError(''); }}
									className="auth-mode-btn flex-1 py-2.5 px-4 rounded-lg text-[11px] font-mono font-semibold tracking-widest uppercase text-center"
									style={mode === m ? {
										background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
										color: '#fff',
										boxShadow: '0 2px 12px rgba(99,102,241,0.35)',
									} : {
										color: 'rgba(161,161,170,0.8)',
										background: 'transparent',
									}}
								>
									{m}
								</button>
							))}
						</div>

						{/* Fields */}
						<div className="flex flex-col gap-4" onKeyDown={handleKeyDown}>
							{mode === 'signup' && (
								<AuthField
									label="Username"
									value={form.username}
									onChange={(v) => setForm((f) => ({ ...f, username: v }))}
									placeholder="your_username"
									autoFocus
								/>
							)}
							<AuthField
								label="Email"
								type="email"
								value={form.email}
								onChange={(v) => setForm((f) => ({ ...f, email: v }))}
								placeholder="you@example.com"
								autoFocus={mode === 'login'}
							/>
							<AuthField
								label="Password"
								type={showPassword ? 'text' : 'password'}
								value={form.password}
								onChange={(v) => setForm((f) => ({ ...f, password: v }))}
								placeholder="••••••••"
								rightAction={
									<button
										type="button"
										onClick={() => setShowPassword((s) => !s)}
										style={{ color: 'rgba(113,113,122,0.8)', fontSize: 10, fontFamily: 'monospace',
											background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', letterSpacing: '0.05em' }}
									>
										{showPassword ? 'HIDE' : 'SHOW'}
									</button>
								}
							/>
						</div>

						{/* Error */}
						{error && (
							<div className="auth-error flex items-start gap-2.5 rounded-xl px-3.5 py-3" style={{
								background: 'rgba(220,38,38,0.08)',
								border: '1px solid rgba(239,68,68,0.2)',
							}}>
								<span style={{ color: '#f87171', fontSize: 12, lineHeight: 1.5, fontFamily: 'monospace' }}>
									⚠ {error}
								</span>
							</div>
						)}

						{/* Submit */}
						<button
							onClick={submit}
							disabled={loading}
							className="auth-btn-primary w-full font-mono uppercase font-bold text-white rounded-xl"
							style={{ height: 44, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
								fontSize: 11, letterSpacing: '0.18em', padding: '0 16px' }}
						>
							{loading ? (
								<span style={{ letterSpacing: '0.3em' }}>···</span>
							) : (
								mode === 'login' ? 'Sign In →' : 'Create Account →'
							)}
						</button>

						{/* Footer toggle hint */}
						<p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(113,113,122,0.7)', fontFamily: 'monospace' }}>
							{mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
							<button
								onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
								style={{ color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}
							>
								{mode === 'login' ? 'Sign up' : 'Sign in'}
							</button>
						</p>
					</div>
				</div>
			</div>
		</>
	);
}

function AuthField({ label, value, onChange, type = 'text', placeholder = '', autoFocus = false, rightAction }) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<label style={{
					fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em',
					textTransform: 'uppercase', color: 'rgba(113,113,122,0.9)', fontWeight: 600,
				}}>
					{label}
				</label>
				{rightAction}
			</div>
			<input
				className="auth-input"
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				autoFocus={autoFocus}
				style={{
					width: '100%', height: 44, padding: '0 16px',
					background: 'rgba(255,255,255,0.04)',
					border: '1px solid rgba(255,255,255,0.08)',
					borderRadius: 10, outline: 'none',
					color: '#e4e4e7', fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
					transition: 'border-color 0.2s, box-shadow 0.2s',
					boxSizing: 'border-box',
				}}
				onFocus={(e) => {
					e.target.style.borderColor = 'rgba(96,165,250,0.5)';
					e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
				}}
				onBlur={(e) => {
					e.target.style.borderColor = 'rgba(255,255,255,0.08)';
					e.target.style.boxShadow = 'none';
				}}
			/>
		</div>
	);
}

// ─────────────────────────────────────────────
//  PREVIEW PANEL
// ─────────────────────────────────────────────
const CONSOLE_INTERCEPT = `<script>
window.parent.postMessage({type:'console_clear'},'*');
(function(){
  var _l=console.log,_e=console.error,_w=console.warn;
  function _pm(level,args){window.parent.postMessage({type:'console',level:level,args:args.map(function(x){return typeof x==='object'?JSON.stringify(x):String(x);})},'*');}
  console.log=function(){_l.apply(console,arguments);_pm('log',Array.prototype.slice.call(arguments));};
  console.error=function(){_e.apply(console,arguments);_pm('error',Array.prototype.slice.call(arguments));};
  console.warn=function(){_w.apply(console,arguments);_pm('warn',Array.prototype.slice.call(arguments));};
})();
</script>`;

function buildSrcDoc(files, reactMode) {
	const get = (ext) =>
		files.find((f) => f.name.endsWith(`.${ext}`))?.content || '';

	if (reactMode) {
		const jsxContent =
			files.find((f) => f.name.endsWith('.jsx'))?.content || '';
		return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${CONSOLE_INTERCEPT}
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>body{margin:0;background:#1e1e1e;color:#d4d4d4;font-family:sans-serif;}</style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
  try {
    ${jsxContent}
    const el = typeof App !== 'undefined' ? React.createElement(App) : React.createElement('div', null, 'Export a default <App /> component');
    ReactDOM.createRoot(document.getElementById('root')).render(el);
  } catch(e) {
    console.error(String(e));
    document.getElementById('root').innerHTML = '<pre style="color:#f44747;padding:12px">'+e+'</pre>';
  }
  </script>
</body>
</html>`;
	}

	const html = get('html') || '<div id="root"></div>';
	const css = get('css');
	const js = get('js');

	return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
${CONSOLE_INTERCEPT}
${css ? `<style>${css}</style>` : ''}
<style>body{background:#1e1e1e;color:#d4d4d4;font-family:'JetBrains Mono','Courier New',monospace;font-size:13px;padding:12px;margin:0;line-height:1.6;}</style>
</head>
<body>
${html}
${js ? `<script>try{${js}}catch(e){console.error(String(e));}</script>` : ''}
</body>
</html>`;
}

// ─────────────────────────────────────────────
//  SAVE MODAL
// ─────────────────────────────────────────────
function SaveModal({ defaultTitle, onSave, onCancel, loading }) {
	const [title, setTitle] = useState(defaultTitle || '');
	const [description, setDescription] = useState('');

	return (
		<Dialog open onOpenChange={() => onCancel()}>
			<DialogContent className="bg-zinc-950 border-blue-800/50 text-zinc-100 font-mono w-96 shadow-2xl shadow-black/80">
				<DialogHeader>
					<DialogTitle className="text-blue-400 flex items-center gap-2 text-sm">
						<Square className="w-4 h-4 fill-red-500 text-red-500" />
						Save Recording
					</DialogTitle>
					<DialogDescription className="text-zinc-400 text-[11px] leading-relaxed">
						Recording stopped. Give your scrim a name and description before saving.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-3 py-1">
					<div className="flex flex-col gap-1.5">
						<Label className="text-[10px] font-mono tracking-widest uppercase text-zinc-500">
							Title <span className="text-red-400">*</span>
						</Label>
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="My awesome scrim"
							className="bg-zinc-900 border-zinc-800 text-zinc-200 font-mono text-[12px] h-9 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50"
						/>
					</div>
					<div className="flex flex-col gap-1.5">
						<Label className="text-[10px] font-mono tracking-widest uppercase text-zinc-500">
							Description
						</Label>
						<Input
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="What does this scrim cover?"
							className="bg-zinc-900 border-zinc-800 text-zinc-200 font-mono text-[12px] h-9 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50"
						/>
					</div>
				</div>

				<DialogFooter className="gap-2">
					<Button
						variant="outline"
						onClick={onCancel}
						className="flex-1 font-mono text-[11px] tracking-widest uppercase border-zinc-700 bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 h-9"
					>
						Discard
					</Button>
					<Button
						onClick={() => onSave({ title, description })}
						disabled={loading || !title.trim()}
						className="flex-1 font-mono text-[11px] tracking-widest uppercase bg-blue-500 hover:bg-blue-400 text-zinc-950 font-bold h-9"
					>
						{loading ? '···' : 'Save Scrim'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ─────────────────────────────────────────────
//  FORK MODAL
// ─────────────────────────────────────────────
function ForkModal({ scrim, onFork, onCancel, loading }) {
	const [title, setTitle] = useState(`Fork of ${scrim?.title || 'scrim'}`);

	return (
		<Dialog open onOpenChange={() => onCancel()}>
			<DialogContent className="bg-zinc-950 border-emerald-800/50 text-zinc-100 font-mono w-90 shadow-2xl shadow-black/80">
				<DialogHeader>
					<DialogTitle className="text-emerald-400 flex items-center gap-2 text-sm">
						<GitFork className="w-4 h-4" />
						Save as Fork
					</DialogTitle>
					<DialogDescription className="text-zinc-400 text-[11px] leading-relaxed">
						You paused playback and edited code. Save your changes as a new
						forked scrim?
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-1.5 py-1">
					<Label className="text-[10px] font-mono tracking-widest uppercase text-zinc-500">
						Fork Title
					</Label>
					<Input
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="bg-zinc-900 border-zinc-800 text-zinc-200 font-mono text-[12px] h-9 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50"
					/>
				</div>

				<DialogFooter className="gap-2">
					<Button
						variant="outline"
						onClick={onCancel}
						className="flex-1 font-mono text-[11px] tracking-widest uppercase border-zinc-700 bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 h-9"
					>
						Discard
					</Button>
					<Button
						onClick={() => onFork(title)}
						disabled={loading}
						className="flex-1 font-mono text-[11px] tracking-widest uppercase bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold h-9"
					>
						{loading ? '···' : 'Fork & Save'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ─────────────────────────────────────────────
//  RECORDING TIMER
// ─────────────────────────────────────────────
function RecordingTimer({ startTime, isRecording }) {
	const [elapsed, setElapsed] = useState(0);
	useEffect(() => {
		if (!isRecording) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setElapsed(0);
			return;
		}
		const iv = setInterval(
			() => setElapsed(Math.floor((Date.now() - startTime) / 1000)),
			200,
		);
		return () => clearInterval(iv);
	}, [isRecording, startTime]);
	const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
	const s = String(elapsed % 60).padStart(2, '0');
	return (
		<span className="font-mono tabular-nums">
			{m}:{s}
		</span>
	);
}

// ─────────────────────────────────────────────
//  TOOLBAR BUTTON
// ─────────────────────────────────────────────
function ToolbarBtn({
	children,
	variant = 'default',
	active,
	className,
	...props
}) {
	const variants = {
		default:
			'border-zinc-700 text-zinc-400 hover:border-blue-500 hover:text-white hover:bg-zinc-800',
		rec: cn(
			'border-red-600 text-red-400 hover:bg-red-950/30',
			active && 'bg-red-950/20 animate-pulse',
		),
		stop: 'border-zinc-600 text-zinc-500 hover:border-zinc-400 hover:text-zinc-200',
		play: 'border-teal-600 text-teal-400 hover:bg-teal-950/20 hover:text-teal-300',
		pause: 'border-yellow-600/70 text-yellow-400 hover:bg-yellow-950/20',
		restart: 'border-purple-600/70 text-purple-400 hover:bg-purple-950/20',
		fork: 'border-emerald-600 text-emerald-400 hover:bg-emerald-950/20 animate-[fork-pulse_2s_ease_infinite]',
	};

	return (
		<button
			className={cn(
				'inline-flex justify-center items-center w-18 gap-1.5 px-3 h-7.5 bg-transparent border rounded',
				'font-mono text-[11px] font-medium tracking-wide whitespace-nowrap',
				'transition-all duration-150 cursor-pointer',
				'disabled:opacity-30 disabled:cursor-not-allowed',
				variants[variant],
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}

// ─────────────────────────────────────────────
//  DEFAULTS
// ─────────────────────────────────────────────
const DEFAULT_FILES = [
	{
		id: 'f-html',
		name: 'index.html',
		language: 'html',
		content: '<h1 style="color:#61afef">Hello, Scrim!</h1>\n<p>Edit me ✨</p>',
	},
	{
		id: 'f-css',
		name: 'style.css',
		language: 'css',
		content: 'body {\n  font-family: sans-serif;\n  padding: 20px;\n}',
	},
	{
		id: 'f-js',
		name: 'script.js',
		language: 'javascript',
		content: 'console.log("Hello from scrim!");\n',
	},
];

const LANG_MAP = {
	html: 'html',
	css: 'css',
	js: 'javascript',
	jsx: 'javascript',
	ts: 'typescript',
	json: 'json',
	md: 'markdown',
};

// ─────────────────────────────────────────────
//  CONSOLE PANEL
// ─────────────────────────────────────────────
function ConsolePanel({ logs, height, onHeightChange, onClear }) {
	const logsRef = useRef(null);
	const isOpen = height > 0;
	const hasErrors = logs.some((l) => l.level === 'error');

	useEffect(() => {
		if (logsRef.current && isOpen)
			logsRef.current.scrollTop = logsRef.current.scrollHeight;
	}, [logs, isOpen]);

	const onDragStart = (e) => {
		e.preventDefault();
		const startY = e.clientY;
		const startH = height;
		const onMove = (ev) => {
			const delta = startY - ev.clientY;
			const newH = Math.max(0, Math.min(Math.floor(window.innerHeight * 0.6), startH + delta));
			onHeightChange(newH < 24 ? 0 : newH);
		};
		const onUp = () => {
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseup', onUp);
		};
		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseup', onUp);
	};

	const HEADER_H = 30;

	return (
		<div
			className="shrink-0 flex flex-col bg-[#1a1a1a]"
			style={{
				height: HEADER_H + (isOpen ? height : 0),
				borderTop: '1px solid rgba(63,63,70,0.5)',
			}}
		>
			{/* Header / drag handle */}
			<div
				onMouseDown={onDragStart}
				className="flex items-center justify-between px-3 select-none cursor-ns-resize hover:bg-zinc-800/30 transition-colors shrink-0"
				style={{ height: HEADER_H, minHeight: HEADER_H }}
			>
				<div className="flex items-center gap-2">
					<Terminal
						className={cn('w-3 h-3', hasErrors ? 'text-red-400' : 'text-zinc-500')}
					/>
					<span
						className={cn(
							'font-mono text-[10px] font-semibold tracking-wider uppercase',
							hasErrors ? 'text-red-400' : 'text-zinc-500',
						)}
					>
						Console
					</span>
					{logs.length > 0 && (
						<span
							className={cn(
								'px-1 rounded text-[9px] font-mono',
								hasErrors ? 'bg-red-900/50 text-red-300' : 'bg-zinc-700/80 text-zinc-400',
							)}
						>
							{logs.length}
						</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					{logs.length > 0 && (
						<button
							onMouseDown={(e) => e.stopPropagation()}
							onClick={(e) => { e.stopPropagation(); onClear(); }}
							className="font-mono text-[9px] tracking-wider uppercase text-zinc-600 hover:text-zinc-300 transition-colors"
						>
							clear
						</button>
					)}
					<button
						onMouseDown={(e) => e.stopPropagation()}
						onClick={(e) => { e.stopPropagation(); onHeightChange(isOpen ? 0 : 180); }}
						className="text-zinc-600 hover:text-zinc-300 transition-colors text-[11px] leading-none px-0.5"
					>
						{isOpen ? '↓' : '↑'}
					</button>
				</div>
			</div>

			{/* Log entries */}
			{isOpen && (
				<div
					ref={logsRef}
					className="flex-1 overflow-y-auto px-3 py-1.5 font-mono text-[11px] leading-relaxed"
					style={{ scrollbarWidth: 'thin', scrollbarColor: '#3f3f3f transparent' }}
				>
					{logs.length === 0 ? (
						<span className="text-zinc-700 italic text-[10px]">No console output</span>
					) : (
						logs.map((log, i) => (
							<div
								key={i}
								className={cn(
									'flex gap-2 py-0.5 border-b border-zinc-800/40 last:border-0',
									log.level === 'error' && 'text-[#f87171]',
									log.level === 'warn' && 'text-[#fbbf24]',
									log.level === 'log' && 'text-[#d4d4d4]',
								)}
							>
								<span className="text-zinc-600 shrink-0 select-none w-3">
									{log.level === 'error' ? '✕' : log.level === 'warn' ? '⚠' : '>'}
								</span>
								<span className="break-all">{log.args?.join(' ')}</span>
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────────────────────────────
export default function Scrim() {
	// ── auth ──
	const [user, setUser] = useState(() => {
		const tok = localStorage.getItem('jwt');
		if (!tok) return null;
		try {
			return JSON.parse(atob(tok.split('.')[1]));
		} catch {
			return null;
		}
	});

	// ── scrims ──
	const [scrims, setScrims] = useState([]);
	const [activeScrim, setActiveScrim] = useState(null);
	const [showSidebar, setShowSidebar] = useState(false);

	// ── files ──
	const [files, setFiles] = useState(DEFAULT_FILES);
	const [activeFile, setActiveFile] = useState(DEFAULT_FILES[0]);

	// ── react mode ──
	const [reactMode, setReactMode] = useState(false);

	// ── recording / playback ──
	const [isRecording, setIsRecording] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [savedData, setSavedData] = useState(null);
	const [recordingStartTime, setRecordingStartTime] = useState(0);

	// ── save modal ──
	const [showSaveModal, setShowSaveModal] = useState(false);
	const [saveLoading, setSaveLoading] = useState(false);
	const [pendingSaveData, setPendingSaveData] = useState(null);

	// ── fork ──
	const [showForkModal, setShowForkModal] = useState(false);
	const [forkLoading, setForkLoading] = useState(false);
	const [pausedEditing, setPausedEditing] = useState(false);

	// ── console ──
	const [consoleLogs, setConsoleLogs] = useState([]);
	const [consoleHeight, setConsoleHeight] = useState(0);

	// ── file explorer ──
	const [showExplorer, setShowExplorer] = useState(true);

	// refs
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
	const activeFileRef = useRef(activeFile);

	useEffect(() => {
		isRecordingRef.current = isRecording;
	}, [isRecording]);
	useEffect(() => {
		isPlayingRef.current = isPlaying;
	}, [isPlaying]);
	useEffect(() => {
		activeFileRef.current = activeFile;
	}, [activeFile]);

	useEffect(() => {
		if (editorRef.current)
			editorRef.current.updateOptions({ readOnly: isPlaying });
	}, [isPlaying]);

	useEffect(() => {
		if (!user) return;
		api('/scrims')
			.then((data) => setScrims(data?.scrims || []))
			.catch(() => {});
	}, [user]);

	useEffect(() => {
		const handler = (e) => {
			if (!e.data || typeof e.data !== 'object') return;
			if (e.data.type === 'console_clear') setConsoleLogs([]);
			else if (e.data.type === 'console') setConsoleLogs((prev) => [...prev, e.data]);
		};
		window.addEventListener('message', handler);
		return () => window.removeEventListener('message', handler);
	}, []);

	const fileLanguage = (name) => {
		const ext = name?.split('.').pop()?.toLowerCase();
		return LANG_MAP[ext] || 'javascript';
	};

	const updateFileContent = useCallback((id, content) => {
		setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, content } : f)));
		if (activeFileRef.current?.id === id) {
			setActiveFile((prev) => (prev ? { ...prev, content } : prev));
		}
	}, []);

	// ── RECORDING ──
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
			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) chunksRef.current.push(e.data);
			};
			oplogRef.current.push({
				time: 0,
				type: 'snapshot',
				files: files.map((f) => ({
					id: f.id,
					name: f.name,
					content: f.content,
				})),
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
			const data = {
				audioBlob,
				oplog: [...oplogRef.current],
				duration: (Date.now() - startTimeRef.current) / 1000,
			};
			setSavedData(data);
			if (activeScrim) {
				setPendingSaveData(data);
				setShowSaveModal(true);
			}
		};
		setIsRecording(false);
	};

	const handleSaveScrim = async ({ title, description }) => {
		if (!activeScrim || !pendingSaveData) return;
		setSaveLoading(true);
		try {
			await api(`/scrims/${activeScrim.id}`, {
				method: 'PATCH',
				body: JSON.stringify({
					title: title.trim(),
					description: description.trim(),
					duration: Math.ceil(pendingSaveData.duration),
					videodescription: { oplog: pendingSaveData.oplog },
				}),
			});
			setActiveScrim((prev) => ({ ...prev, title: title.trim() }));
			setScrims((prev) =>
				prev.map((s) =>
					s.id === activeScrim.id ? { ...s, title: title.trim() } : s,
				),
			);
			setShowSaveModal(false);
			setPendingSaveData(null);
		} catch (e) {
			console.error('Failed to save scrim:', e);
		} finally {
			setSaveLoading(false);
		}
	};

	// ── PLAYBACK ──
	const applyOplog = useCallback(
		(currentTime) => {
			if (!savedData) return;
			while (
				lastAppliedIndexRef.current < savedData.oplog.length &&
				savedData.oplog[lastAppliedIndexRef.current].time <= currentTime
			) {
				const op = savedData.oplog[lastAppliedIndexRef.current];
				if (op.type === 'snapshot') {
					setFiles(
						op.files.map((f) => ({ ...f, language: fileLanguage(f.name) })),
					);
					const first = op.files[0];
					if (first)
						setActiveFile({ ...first, language: fileLanguage(first.name) });
				} else if (op.type === 'edit') {
					setFiles((prev) =>
						prev.map((f) =>
							f.id === op.fileId ? { ...f, content: op.snapshot } : f,
						),
					);
					if (editorRef.current && activeFileRef.current?.id === op.fileId) {
						const model = editorRef.current.getModel();
						if (model) {
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
					}
				}
				lastAppliedIndexRef.current++;
			}
		},
		[savedData],
	);

	const play = () => {
		if (!savedData || !audioRef.current) return;
		const resumeTime = pausedTimeRef.current || 0;
		const resumeIndex = pausedIndexRef.current || 0;

		if (resumeIndex > 0 && pausedSnapshotRef.current) {
			try {
				const snap = JSON.parse(pausedSnapshotRef.current);
				setFiles(snap);
				setActiveFile(snap[0]);
			} catch {
				/* empty */
			}
		} else {
			const snapshot = savedData.oplog?.[0];
			if (snapshot?.files) {
				setFiles(
					snapshot.files.map((f) => ({ ...f, language: fileLanguage(f.name) })),
				);
				setActiveFile({
					...snapshot.files[0],
					language: fileLanguage(snapshot.files[0].name),
				});
			}
		}

		lastAppliedIndexRef.current = resumeIndex > 0 ? resumeIndex : 1;

		if (audioBlobURLRef.current) URL.revokeObjectURL(audioBlobURLRef.current);
		audioBlobURLRef.current = URL.createObjectURL(savedData.audioBlob);
		audioRef.current.src = audioBlobURLRef.current;
		setIsPlaying(true);
		setPausedEditing(false);

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
		if (!audioRef.current) return;
		pausedTimeRef.current = audioRef.current.currentTime;
		pausedIndexRef.current = lastAppliedIndexRef.current;
		pausedSnapshotRef.current = JSON.stringify(files);
		audioRef.current.pause();
		setIsPlaying(false);
		setPausedEditing(true);
	};

	const restart = () => {
		pausedTimeRef.current = 0;
		pausedIndexRef.current = 0;
		pausedSnapshotRef.current = '';
		lastAppliedIndexRef.current = 0;
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
		}
		setIsPlaying(false);
		setPausedEditing(false);
		if (savedData) {
			const snapshot = savedData.oplog?.[0];
			if (snapshot?.files) {
				setFiles(
					snapshot.files.map((f) => ({ ...f, language: fileLanguage(f.name) })),
				);
				setActiveFile({
					...snapshot.files[0],
					language: fileLanguage(snapshot.files[0].name),
				});
			}
		}
	};

	useEffect(() => {
		if (isPlaying && savedData) {
			playbackIntervalRef.current = setInterval(() => {
				if (audioRef.current && !audioRef.current.paused)
					applyOplog(audioRef.current.currentTime);
			}, 50);
		}
		return () => {
			if (playbackIntervalRef.current) {
				clearInterval(playbackIntervalRef.current);
				playbackIntervalRef.current = null;
			}
		};
	}, [isPlaying, savedData, applyOplog]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;
		const handleEnded = () => {
			setIsPlaying(false);
			if (savedData) applyOplog(Infinity);
		};
		audio.addEventListener('ended', handleEnded);
		return () => audio.removeEventListener('ended', handleEnded);
	}, [savedData, applyOplog]);

	useEffect(() => {
		return () => {
			if (audioBlobURLRef.current) URL.revokeObjectURL(audioBlobURLRef.current);
		};
	}, []);

	// ── EDITOR ──
	const handleEditorMount = (editor) => {
		editorRef.current = editor;
		editor.onDidChangeModelContent((event) => {
			if (!isRecordingRef.current) return;
			const currentFile = activeFileRef.current;
			if (!currentFile) return;
			const content = editor.getValue();
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
				type: 'edit',
				fileId: currentFile.id,
				changes,
				snapshot: content,
			});
		});
	};

	// ── FILE MANAGEMENT ──
	const addFile = async (name) => {
		const id = `f-${Date.now()}`;
		const lang = fileLanguage(name);
		const defaults = {
			html: '<div>Hello</div>',
			css: 'body {}',
			js: 'console.log("hello");\n',
			jsx: 'export default function App() {\n  return <h1>Hello</h1>;\n}\n',
		};
		const ext = name.split('.').pop().toLowerCase();
		const content = defaults[ext] || '';
		const newFile = { id, name, language: lang, content };

		if (activeScrim) {
			try {
				const created = await api(`/scrims/${activeScrim.id}/files`, {
					method: 'POST',
					body: JSON.stringify({ name, language: lang, content }),
				});
				newFile.id = created?.id || id;
			} catch {
				/* empty */
			}
		}

		setFiles((prev) => [...prev, newFile]);
		setActiveFile(newFile);
		if (name.endsWith('.jsx')) setReactMode(true);
	};

	const deleteFile = (f) => {
		setFiles((prev) => {
			const next = prev.filter((x) => x.id !== f.id);
			if (activeFile?.id === f.id && next.length > 0) setActiveFile(next[0]);
			return next;
		});
	};

	// ── SCRIM MANAGEMENT ──
	const createNewScrim = async () => {
		const title = prompt('Scrim title:', 'Untitled Scrim');
		if (!title) return;
		try {
			const s = await api('/scrims', {
				method: 'POST',
				body: JSON.stringify({ title, description: '' }),
			});
			setScrims((prev) => [s, ...prev]);
			loadScrim(s);
		} catch (e) {
			alert('Failed to create scrim: ' + e.message);
		}
	};

	const loadScrim = async (s) => {
		setActiveScrim(s);
		setShowSidebar(false);
		setSavedData(null);
		setIsPlaying(false);
		setPausedEditing(false);
		try {
			const data = await api(`/scrims/${s.id}`);
			const apiFiles = data?.files || [];
			if (apiFiles.length > 0) {
				const mapped = apiFiles.map((f) => ({
					...f,
					language: fileLanguage(f.name),
				}));
				setFiles(mapped);
				setActiveFile(mapped[0]);
			} else {
				setFiles(DEFAULT_FILES);
				setActiveFile(DEFAULT_FILES[0]);
			}
		} catch {
			setFiles(DEFAULT_FILES);
			setActiveFile(DEFAULT_FILES[0]);
		}
	};

	// ── FORK ──
	const handleFork = async (title) => {
		if (!activeScrim) return;
		setForkLoading(true);
		try {
			const forked = await api(`/scrims/${activeScrim.id}/fork`, {
				method: 'POST',
				body: JSON.stringify({
					title,
					fork_time: pausedTimeRef.current,
					fork_oplog_index: pausedIndexRef.current,
					file_snapshots: files.map((f) => ({
						id: f.id,
						name: f.name,
						content: f.content,
					})),
				}),
			});
			setScrims((prev) => [forked, ...prev]);
			setActiveScrim(forked);
			setShowForkModal(false);
			setPausedEditing(false);
		} catch (e) {
			alert('Fork failed: ' + e.message);
		} finally {
			setForkLoading(false);
		}
	};

	// ── DERIVED ──
	const srcDoc = buildSrcDoc(files, reactMode);
	const hasJsx = files.some((f) => f.name.endsWith('.jsx'));

	const statusVariant = isRecording
		? 'bg-red-700'
		: isPlaying
			? 'bg-emerald-700'
			: pausedEditing
				? 'bg-amber-800'
				: 'bg-[#007acc]';

	return (
		<>
			<link
				href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
				rel="stylesheet"
			/>

			<style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        html,body,#root { height:100%; background:#1e1e1e; overflow:hidden; }
        @keyframes fork-pulse {
          0%,100%{box-shadow:0 0 0 0 rgba(52,211,153,0)}
          50%{box-shadow:0 0 0 4px rgba(52,211,153,.2)}
        }
        .audio-scrubber { height:26px; flex:1; filter:invert(1) hue-rotate(180deg); opacity:.6; }
      `}</style>

			{!user && (
				<AuthModal
					onAuth={(d) => setUser(d.user || { username: 'User', email: '' })}
				/>
			)}

			{showSaveModal && activeScrim && (
				<SaveModal
					defaultTitle={activeScrim.title}
					onSave={handleSaveScrim}
					onCancel={() => {
						setShowSaveModal(false);
						setPendingSaveData(null);
					}}
					loading={saveLoading}
				/>
			)}

			{showForkModal && activeScrim && (
				<ForkModal
					scrim={activeScrim}
					onFork={handleFork}
					onCancel={() => setShowForkModal(false)}
					loading={forkLoading}
				/>
			)}

			<TooltipProvider delayDuration={300}>
				<div className="flex flex-col h-screen font-mono overflow-hidden bg-[#1e1e1e]">
					{/* ── Title Bar ─────────────────────────────── */}
					<div className="h-8.5 bg-[#323233] flex items-center px-3 justify-between border-b border-[#252526] shrink-0">
						<div className="flex items-center gap-2">
							<Hexagon
								className="w-4 h-4 text-blue-400 fill-blue-400/20"
								strokeWidth={1.5}
							/>
							<span className="text-blue-400 text-[13px] font-bold tracking-[0.15em] uppercase">
								Scrim
							</span>
							{activeScrim && (
								<div className="flex items-center gap-1 text-zinc-500 text-[11px]">
									<ChevronRight className="w-3 h-3" />
									<span>{activeScrim.title}</span>
									{activeScrim.forked_from && (
										<GitFork className="w-3 h-3 text-emerald-500 ml-0.5" />
									)}
								</div>
							)}
						</div>

						<div className="flex items-center gap-2">
							{hasJsx && (
								<button
									onClick={() => setReactMode(!reactMode)}
									className={cn(
										'flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-mono tracking-widest uppercase cursor-pointer transition-all',
										reactMode
											? 'bg-cyan-950/40 border-cyan-600 text-cyan-400'
											: 'bg-transparent border-zinc-700 text-zinc-500 hover:text-zinc-300',
									)}
								>
									<Atom className="w-3 h-3" />
									React {reactMode ? 'On' : 'Off'}
								</button>
							)}
							{user && (
								<button
									onClick={() => setShowSidebar(!showSidebar)}
									className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-700 text-zinc-500 hover:text-zinc-200 bg-transparent text-[10px] tracking-widest uppercase cursor-pointer transition-colors"
								>
									<Menu className="w-3 h-3" />
									Scrims
								</button>
							)}
						</div>
					</div>

					<div className="flex flex-1 overflow-hidden">
						{/* ── Sidebar ──────────────────────────────── */}
						{showSidebar && (
							<ScrimSidebar
								user={user}
								scrims={scrims}
								activeScrimId={activeScrim?.id}
								onSelect={loadScrim}
								onCreate={createNewScrim}
								onClose={() => setShowSidebar(false)}
							/>
						)}

						{/* ── Editor Column ─────────────────────────── */}
						<div className="flex-1 flex flex-col overflow-hidden">
							{/* ── Toolbar ────────────────────────────── */}
							<div className="h-10.5 bg-[#252526] flex items-center px-2.5 gap-1.5 border-b border-[#1e1e1e] shrink-0">
								<button
									onClick={() => setShowExplorer((v) => !v)}
									title="Toggle file explorer"
									className={cn(
										'flex items-center justify-center w-7 h-7 rounded border transition-all',
										showExplorer
											? 'border-blue-500/60 text-blue-400 bg-blue-500/10'
											: 'border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500',
									)}
								>
									<PanelLeft className="w-3.5 h-3.5" />
								</button>
								<div className="w-px h-4 bg-zinc-700" />
								<ToolbarBtn
									variant="rec"
									active={isRecording}
									onClick={startRecording}
									disabled={isRecording || isPlaying}
								>
									<Circle className="w-2 h-2 fill-current" />
									{isRecording ? 'Rec' : 'Record'}
								</ToolbarBtn>

								<ToolbarBtn
									variant="stop"
									onClick={stopRecording}
									disabled={!isRecording}
								>
									<Square className="w-2 h-2 fill-current" />
									Stop
								</ToolbarBtn>

								<div className="w-px h-4 bg-zinc-700 mx-1" />

								<ToolbarBtn
									variant="play"
									onClick={play}
									disabled={!savedData || isPlaying || isRecording}
								>
									<Play className="w-2.5 h-2.5 fill-current" />
									{pausedTimeRef.current > 0 && !isPlaying ? 'Resume' : 'Play'}
								</ToolbarBtn>

								<ToolbarBtn
									variant="pause"
									onClick={pause}
									disabled={!isPlaying}
								>
									<Pause className="w-2.5 h-2.5 fill-current" />
									Pause
								</ToolbarBtn>

								<ToolbarBtn
									variant="restart"
									onClick={restart}
									disabled={!savedData || isRecording}
								>
									<RotateCcw className="w-2.5 h-2.5" />
									Restart
								</ToolbarBtn>

								{pausedEditing && (
									<ToolbarBtn
										variant="fork"
										onClick={() => setShowForkModal(true)}
									>
										<GitFork className="w-2.5 h-2.5" />
										Save Fork
									</ToolbarBtn>
								)}

								<div className="flex-1" />

								{isRecording && (
									<div className="flex items-center gap-2 text-red-400 text-[11px]">
										<span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
										<RecordingTimer
											startTime={recordingStartTime}
											isRecording={isRecording}
										/>
									</div>
								)}

								{savedData && !isRecording && (
									<span className="text-zinc-600 text-[10px]">
										{savedData.oplog.length} ops ·{' '}
										{savedData.duration.toFixed(1)}s
									</span>
								)}
							</div>

							{/* ── Explorer + Editor row ─────────────── */}
							<div className="flex-1 flex overflow-hidden min-h-0">
								{/* File Explorer sidebar */}
								{showExplorer && (
									<FileExplorer
										files={files}
										activeFile={activeFile}
										onSelect={(f) => {
											setActiveFile(f);
											if (f.name.endsWith('.jsx')) setReactMode(true);
										}}
										onAdd={addFile}
										onDelete={deleteFile}
										disabled={isPlaying}
									/>
								)}

								{/* ── Monaco Editor ─────────────────────── */}
								<div className="flex-1 min-w-0 min-h-0 relative overflow-hidden">
									{files.map((f) => (
										<div
											key={f.id}
											className="absolute inset-0"
											style={{
												visibility:
													f.id === activeFile?.id ? 'visible' : 'hidden',
											}}
										>
											<Editor
												path={f.id}
												onMount={
													f.id === activeFile?.id ? handleEditorMount : undefined
												}
												height="100%"
												language={f.language || fileLanguage(f.name)}
												value={f.content}
												theme="vs-dark"
												onChange={(val) => {
													if (!isPlayingRef.current)
														updateFileContent(f.id, val || '');
												}}
												options={{
													readOnly: isPlaying,
													minimap: { enabled: false },
													fontSize: 14,
													fontFamily:
														"'JetBrains Mono','Fira Code','Cascadia Code',monospace",
													fontLigatures: true,
													lineHeight: 22,
													padding: { top: 10, bottom: 10 },
													scrollBeyondLastLine: false,
													smoothScrolling: true,
													cursorBlinking: 'smooth',
													cursorSmoothCaretAnimation: 'on',
													renderLineHighlight: 'gutter',
													bracketPairColorization: { enabled: true },
													guides: { bracketPairs: true },
													wordWrap: 'on',
												}}
											/>
										</div>
									))}
								</div>
							</div>

							{/* ── Console Panel ─────────────────────── */}
							<ConsolePanel
								logs={consoleLogs}
								height={consoleHeight}
								onHeightChange={setConsoleHeight}
								onClear={() => setConsoleLogs([])}
							/>

							{/* ── Audio Bar ─────────────────────────── */}
							<div
								className={cn(
									'flex items-center gap-2 px-2.5 shrink-0 bg-[#252526] border-t border-zinc-800',
									savedData ? 'h-9' : 'h-0 overflow-hidden border-0',
								)}
							>
								<Volume2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
								<audio ref={audioRef} controls className="audio-scrubber flex-1" />
							</div>

							{/* ── Status Bar ────────────────────────── */}
							<div
								className={cn(
									'h-5.5 flex items-center px-3 justify-between transition-colors duration-300 shrink-0',
									statusVariant,
								)}
							>
								<div className="flex items-center gap-2 text-white text-[10px]">
									{isRecording && <span>⏺ Recording</span>}
									{isPlaying && <span>▶ Playing</span>}
									{pausedEditing && !isPlaying && (
										<span>✎ Paused — editing (fork to save)</span>
									)}
									{!isRecording && !isPlaying && !pausedEditing && (
										<span>Ready</span>
									)}
								</div>
								<div className="flex items-center gap-3 text-white/80 text-[10px]">
									{activeFile && (
										<span>
											{activeFile.language || fileLanguage(activeFile.name)}
										</span>
									)}
									{reactMode && <span className="text-cyan-300">⚛ React</span>}
									<span>UTF-8</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</TooltipProvider>

			{/* ── Floating Output Panel ──────────────────── */}
			<FloatingPanel defaultWidth={420} defaultHeight={300}>
				<iframe
					key={srcDoc.length}
					title="preview"
					className="w-full h-full border-none bg-[#1e1e1e]"
					srcDoc={srcDoc}
					sandbox="allow-scripts"
				/>
			</FloatingPanel>
		</>
	);
}
