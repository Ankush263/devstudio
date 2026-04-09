import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Hexagon } from 'lucide-react';

export function FloatingPanel({
	children,
	defaultWidth = 420,
	defaultHeight = 300,
}) {
	const [pos, setPos] = useState({ x: null, y: 40 });
	const [size, setSize] = useState({ w: defaultWidth, h: defaultHeight });
	const [minimized, setMinimized] = useState(false);

	useEffect(() => {
		if (pos.x === null)
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setPos({
				x: window.innerWidth - defaultWidth - 24,
				y: window.innerHeight - defaultHeight - 60,
			});
	}, [defaultHeight, defaultWidth, pos.x]);

	const onDragStart = (e) => {
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
				w: Math.max(220, sw + ev.clientX - sx),
				h: Math.max(120, sh + ev.clientY - sy),
			});
		const onUp = () => {
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseup', onUp);
		};
		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseup', onUp);
	};

	if (pos.x === null) return null;

	return (
		<div
			style={{
				position: 'fixed',
				left: pos.x,
				top: pos.y,
				width: minimized ? 180 : size.w,
				height: minimized ? 36 : size.h,
				zIndex: 9999,
				transition: 'height .2s, width .2s',
			}}
			className="rounded-lg overflow-hidden shadow-2xl shadow-black/70 border border-zinc-700/50 flex flex-col bg-[#1e1e1e]"
		>
			{/* Drag handle / title bar */}
			<div
				onMouseDown={onDragStart}
				className={cn(
					'h-9 min-h-9 bg-zinc-800 flex items-center justify-between px-3 cursor-grab select-none',
					!minimized && 'border-b border-zinc-700',
				)}
			>
				<div className="flex items-center gap-1.5">
					<Hexagon
						className="w-3 h-3 text-blue-400 fill-blue-400/20"
						strokeWidth={1.5}
					/>
					<span className="font-mono text-[10px] font-semibold text-zinc-300 tracking-wider uppercase">
						Output
					</span>
				</div>
				<button
					onClick={() => setMinimized(!minimized)}
					className="text-zinc-500 hover:text-zinc-200 text-sm leading-none px-1 transition-colors"
				>
					{minimized ? '□' : '─'}
				</button>
			</div>

			{!minimized && (
				<div className="flex-1 relative overflow-hidden">
					{children}
					<div
						onMouseDown={onResizeStart}
						className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-end justify-end p-0.5"
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
				</div>
			)}
		</div>
	);
}
