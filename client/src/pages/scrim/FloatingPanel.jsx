import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Hexagon } from 'lucide-react';

function TrafficLight({ color, hoverColor, symbol, onClick }) {
	const [hovered, setHovered] = useState(false);
	return (
		<button
			onMouseDown={(e) => e.stopPropagation()}
			onClick={onClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			className="w-3 h-3 rounded-full flex items-center justify-center shrink-0 transition-colors"
			style={{ backgroundColor: hovered ? hoverColor : color }}
		>
			<span
				className="font-bold leading-none select-none"
				style={{
					fontSize: 8,
					color: 'rgba(0,0,0,0.55)',
					opacity: hovered ? 1 : 0,
					transition: 'opacity 0.1s',
				}}
			>
				{symbol}
			</span>
		</button>
	);
}

const TITLE_H = 36;

export function FloatingPanel({ children, defaultWidth = 420, defaultHeight = 300 }) {
	const [pos, setPos] = useState({ x: null, y: 40 });
	const [size, setSize] = useState({ w: defaultWidth, h: defaultHeight });
	const [minimized, setMinimized] = useState(false);
	const [closed, setClosed] = useState(false);
	const [maximized, setMaximized] = useState(false);
	const prevStateRef = useRef(null);

	useEffect(() => {
		if (pos.x === null)
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setPos({
				x: window.innerWidth - defaultWidth - 24,
				y: window.innerHeight - defaultHeight - 60,
			});
	}, [defaultHeight, defaultWidth, pos.x]);

	const onDragStart = (e) => {
		if (maximized) return;
		e.preventDefault();
		const sx = e.clientX - pos.x,
			sy = e.clientY - pos.y;
		const onMove = (ev) => setPos({ x: ev.clientX - sx, y: ev.clientY - sy });
		const onUp = () => {
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseup', onUp);
		};
		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseup', onUp);
	};

	const onResizeStart = (e) => {
		e.preventDefault();
		e.stopPropagation();
		const sx = e.clientX,
			sy = e.clientY,
			sw = size.w,
			sh = size.h;
		const onMove = (ev) =>
			setSize({
				w: Math.max(280, sw + ev.clientX - sx),
				h: Math.max(160, sh + ev.clientY - sy),
			});
		const onUp = () => {
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseup', onUp);
		};
		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseup', onUp);
	};

	const toggleMaximize = () => {
		if (!maximized) {
			prevStateRef.current = { pos: { ...pos }, size: { ...size } };
			setMaximized(true);
		} else {
			if (prevStateRef.current) {
				setPos(prevStateRef.current.pos);
				setSize(prevStateRef.current.size);
			}
			setMaximized(false);
		}
	};

	if (closed || pos.x === null) return null;

	return (
		<div
			style={{
				position: 'fixed',
				left: minimized ? pos.x : maximized ? 300 : pos.x,
				top: minimized ? pos.y : maximized ? 50 : pos.y,
				width: minimized ? 200 : maximized ? '60vw' : size.w,
				height: minimized ? TITLE_H : maximized ? '90vh' : size.h,
				zIndex: 9999,
				transition: 'height .15s, width .15s',
			}}
			className="rounded-lg overflow-hidden shadow-2xl shadow-black/70 border border-zinc-700/50 flex flex-col bg-[#1e1e1e]"
		>
			{/* ── Title bar ── */}
			<div
				onMouseDown={onDragStart}
				className={cn(
					'flex items-center px-3 relative select-none',
					!minimized && 'border-b border-zinc-700/60',
					!maximized && 'cursor-grab',
				)}
				style={{ height: TITLE_H, minHeight: TITLE_H, background: '#2d2d2d' }}
			>
				<div className="flex items-center gap-1.5 z-10">
					<TrafficLight
						color="#ff5f57"
						hoverColor="#ff3b30"
						symbol="×"
						onClick={() => setClosed(true)}
					/>
					<TrafficLight
						color="#febc2e"
						hoverColor="#ffb500"
						symbol="–"
						onClick={() => setMinimized(!minimized)}
					/>
					<TrafficLight
						color="#28c840"
						hoverColor="#00b818"
						symbol={maximized ? '⊡' : '⊞'}
						onClick={toggleMaximize}
					/>
				</div>

				<div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none">
					<Hexagon
						className="w-3 h-3 text-blue-400 fill-blue-400/20"
						strokeWidth={1.5}
					/>
					<span className="font-mono text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">
						Output
					</span>
				</div>
			</div>

			{/* ── Output body ── */}
			{!minimized && (
				<div className="flex-1 overflow-hidden min-h-0 relative">
					{children}
					{!maximized && (
						<div
							onMouseDown={onResizeStart}
							className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-end justify-end p-0.5 z-10"
						>
							<svg width="10" height="10" viewBox="0 0 12 12">
								<path
									d="M11 1v10H1"
									fill="none"
									stroke="#444"
									strokeWidth="1.5"
								/>
								<path d="M11 5v6H5" fill="none" stroke="#444" strokeWidth="1.5" />
							</svg>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
