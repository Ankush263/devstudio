import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';

export function FileTabBar({
	files,
	activeFile,
	onSelect,
	onAdd,
	onDelete,
	disabled,
}) {
	const [newName, setNewName] = useState('');
	const [adding, setAdding] = useState(false);

	const ext = (name) => name?.split('.').pop()?.toLowerCase() || 'js';

	const confirmAdd = () => {
		if (!newName.trim()) {
			setAdding(false);
			return;
		}
		const n = newName.trim().includes('.')
			? newName.trim()
			: `${newName.trim()}.js`;
		onAdd(n);
		setNewName('');
		setAdding(false);
	};

	const FILE_ICONS = {
		html: { icon: '<>', color: 'text-red-400' },
		css: { icon: '#', color: 'text-blue-400' },
		js: { icon: 'JS', color: 'text-yellow-400' },
		jsx: { icon: '⚛', color: 'text-cyan-400' },
	};

	return (
		<div className="flex items-stretch bg-[#252526] border-b border-[#1e1e1e] h-9 overflow-hidden">
			{files.map((f) => {
				const e = ext(f.name);
				const ic = FILE_ICONS[e] || { icon: '?', color: 'text-zinc-500' };
				const active = f.id === activeFile?.id;
				return (
					<div
						key={f.id}
						onClick={() => !disabled && onSelect(f)}
						className={cn(
							'flex items-center gap-1.5 px-3 h-full border-r border-[#1e1e1e] cursor-pointer select-none min-w-20',
							'font-mono text-[12px] transition-colors duration-100 group relative',
							active
								? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500 border-b-0'
								: 'text-zinc-500 hover:text-zinc-300 border-t-2 border-t-transparent',
						)}
					>
						<span className={cn('text-[10px] font-bold', ic.color)}>
							{ic.icon}
						</span>
						{f.name}
						{files.length > 1 && (
							<span
								onClick={(e) => {
									e.stopPropagation();
									onDelete(f);
								}}
								className="ml-1 text-zinc-600 hover:text-zinc-300 text-sm leading-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
							>
								×
							</span>
						)}
					</div>
				);
			})}

			{adding ? (
				<div className="flex items-center px-2 gap-1">
					<input
						autoFocus
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') confirmAdd();
							if (e.key === 'Escape') {
								setAdding(false);
								setNewName('');
							}
						}}
						onBlur={confirmAdd}
						placeholder="index.html"
						className="w-24 bg-zinc-800 border border-zinc-600 rounded px-1.5 py-0.5 text-zinc-200 text-[11px] font-mono outline-none focus:border-blue-500"
					/>
				</div>
			) : (
				<TooltipProvider delayDuration={300}>
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								onClick={() => !disabled && setAdding(true)}
								disabled={disabled}
								className="bg-transparent border-none text-zinc-600 hover:text-zinc-300 cursor-pointer px-3 text-lg leading-none transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
							>
								+
							</button>
						</TooltipTrigger>
						<TooltipContent side="bottom" className="font-mono text-[10px]">
							New file
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}
		</div>
	);
}
