import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FilePlus, ChevronDown, ChevronRight } from 'lucide-react';

const FILE_ICON = (ext) => {
	const map = {
		html: { label: '<>', color: '#e34c26' },
		css:  { label: '#',  color: '#519aba' },
		js:   { label: 'JS', color: '#cbcb41' },
		jsx:  { label: '⚛',  color: '#61dafb' },
		ts:   { label: 'TS', color: '#007acc' },
		tsx:  { label: '⚛',  color: '#007acc' },
		json: { label: '{}', color: '#cbcb41' },
		md:   { label: 'MD', color: '#8a8a8a' },
	};
	return map[ext] ?? { label: '·', color: '#808080' };
};

export function FileExplorer({ files, activeFile, onSelect, onAdd, onDelete, disabled }) {
	const [expanded, setExpanded] = useState(true);
	const [adding, setAdding] = useState(false);
	const [newName, setNewName] = useState('');

	const confirmAdd = () => {
		const name = newName.trim();
		if (!name) { setAdding(false); return; }
		onAdd(name.includes('.') ? name : `${name}.js`);
		setNewName('');
		setAdding(false);
	};

	return (
		<div
			className="flex flex-col h-full shrink-0 select-none overflow-hidden"
			style={{ width: 200, background: '#252526', borderRight: '1px solid #1e1e1e' }}
		>
			{/* ── Header ── */}
			<div className="flex items-center justify-between px-3 h-8 shrink-0">
				<span
					className="font-mono font-bold tracking-widest uppercase"
					style={{ fontSize: 10, color: '#bbb' }}
				>
					Explorer
				</span>
				<button
					onClick={() => !disabled && setAdding(true)}
					disabled={disabled}
					title="New file"
					className="flex items-center justify-center w-5 h-5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700/50 transition-colors disabled:opacity-30"
				>
					<FilePlus size={13} />
				</button>
			</div>

			{/* ── Project folder row ── */}
			<div
				onClick={() => setExpanded((v) => !v)}
				className="flex items-center gap-1 px-2 h-6 cursor-pointer hover:bg-zinc-700/20 shrink-0 group"
			>
				{expanded
					? <ChevronDown size={11} className="text-zinc-400 shrink-0" />
					: <ChevronRight size={11} className="text-zinc-400 shrink-0" />
				}
				<span
					className="font-mono font-semibold uppercase tracking-wider truncate"
					style={{ fontSize: 11, color: '#ccc' }}
				>
					Scrim
				</span>
			</div>

			{/* ── File list ── */}
			{expanded && (
				<div
					className="flex-1 overflow-y-auto"
					style={{ scrollbarWidth: 'thin', scrollbarColor: '#3f3f3f transparent' }}
				>
					{files.map((f) => {
						const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
						const { label, color } = FILE_ICON(ext);
						const isActive = f.id === activeFile?.id;

						return (
							<div
								key={f.id}
								onClick={() => !disabled && onSelect(f)}
								className={cn(
									'flex items-center gap-2 pl-6 pr-2 h-6.5 cursor-pointer group',
									'font-mono transition-colors',
									isActive
										? 'text-white'
										: 'text-[#ccc] hover:bg-[#2a2d2e]',
								)}
								style={{
									fontSize: 13,
									background: isActive ? '#37373d' : undefined,
								}}
							>
								<span
									className="shrink-0 font-bold"
									style={{ fontSize: 9, color, minWidth: 14, textAlign: 'center' }}
								>
									{label}
								</span>
								<span className="flex-1 truncate">{f.name}</span>
								{files.length > 1 && (
									<button
										onClick={(e) => { e.stopPropagation(); onDelete(f); }}
										className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all shrink-0 leading-none text-base"
										title="Delete"
									>
										×
									</button>
								)}
							</div>
						);
					})}

					{/* Inline new-file input */}
					{adding && (
						<div className="flex items-center gap-2 pl-6 pr-2 py-0.5">
							<span style={{ fontSize: 9, color: '#808080', minWidth: 14 }}>·</span>
							<input
								autoFocus
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') confirmAdd();
									if (e.key === 'Escape') { setAdding(false); setNewName(''); }
								}}
								onBlur={confirmAdd}
								placeholder="filename.js"
								className="flex-1 min-w-0 rounded-sm px-1.5 py-0.5 font-mono outline-none text-zinc-200"
								style={{
									fontSize: 12,
									background: '#1e1e1e',
									border: '1px solid #007acc',
								}}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
