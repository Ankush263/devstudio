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
} from 'lucide-react';

export function ScrimSidebar({
	user,
	scrims,
	activeScrimId,
	onSelect,
	onCreate,
	onClose,
}) {
	return (
		<div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-full font-mono shrink-0">
			{/* Header */}
			<div className="flex items-center justify-between px-3 py-3 border-b border-zinc-800">
				<div>
					<div className="text-blue-400 text-[13px] font-bold">
						{user?.username || 'Profile'}
					</div>
					<div className="text-zinc-500 text-[10px] mt-0.5">{user?.email}</div>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={onClose}
					className="h-7 w-7 text-zinc-500 hover:text-zinc-200"
				>
					<X className="w-4 h-4" />
				</Button>
			</div>

			{/* New scrim */}
			<div className="p-2 border-b border-zinc-800">
				<button
					onClick={onCreate}
					className="w-full py-2 border border-dashed border-zinc-700 hover:border-blue-500/60 rounded-md bg-transparent text-blue-400 hover:text-blue-300 cursor-pointer text-[11px] tracking-widest uppercase transition-colors flex items-center justify-center gap-1.5"
				>
					<Plus className="w-3 h-3" />
					New Scrim
				</button>
			</div>

			{/* Scrim list */}
			<ScrollArea className="flex-1">
				<div className="p-2 flex flex-col gap-0.5">
					{scrims.length === 0 && (
						<p className="text-zinc-600 text-[11px] px-2 py-3">
							No scrims yet.
						</p>
					)}
					{scrims.map((s) => (
						<div
							key={s.id}
							onClick={() => onSelect(s)}
							className={cn(
								'px-2.5 py-2 rounded-md cursor-pointer transition-colors flex flex-col gap-0.5',
								s.id === activeScrimId
									? 'bg-zinc-800 text-zinc-100'
									: 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200',
							)}
						>
							<span className="text-[11px] font-semibold text-zinc-200">
								{s.title}
							</span>
							<div className="flex items-center gap-2">
								{s.forked_from && (
									<span className="text-emerald-400 text-[10px] flex items-center gap-0.5">
										<GitFork className="w-2.5 h-2.5" /> fork
									</span>
								)}
								{s.duration && (
									<span className="text-zinc-600 text-[10px]">
										{s.duration}s
									</span>
								)}
							</div>
						</div>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}
