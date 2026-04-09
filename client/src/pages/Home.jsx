import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
	LayoutDashboard,
	Video,
	GitFork,
	Settings,
	User,
	LogOut,
	Plus,
	Play,
	Clock,
	Hexagon,
	Search,
	Bell,
	Globe,
	Eye,
	TrendingUp,
	Zap,
	ChevronRight,
	MoreHorizontal,
	Menu,
	X,
	Code2,
	Pencil,
	Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_SCRIMS = [
	{
		id: '1',
		title: 'Building a REST API with Go',
		description:
			'Learn to build production-ready REST APIs using Go and the Gin framework with JWT auth.',
		duration: 2732,
		views: 1243,
		stars: 89,
		forks: 12,
		tags: ['Go', 'REST', 'Backend'],
		createdAt: '2 days ago',
		published: true,
		lang: 'go',
	},
	{
		id: '2',
		title: 'React Hooks Deep Dive',
		description:
			'Understanding useState, useEffect, useCallback, and building powerful custom hooks.',
		duration: 2295,
		views: 876,
		stars: 64,
		forks: 8,
		tags: ['React', 'JavaScript'],
		createdAt: '1 week ago',
		published: true,
		lang: 'jsx',
	},
	{
		id: '3',
		title: 'CSS Grid Mastery',
		description:
			'Complete guide to CSS Grid layout system with real-world practical examples.',
		duration: 3128,
		views: 532,
		stars: 41,
		forks: 5,
		tags: ['CSS', 'Frontend'],
		createdAt: '2 weeks ago',
		published: false,
		lang: 'css',
	},
	{
		id: '4',
		title: 'TypeScript for Beginners',
		description:
			'Getting started with TypeScript: types, interfaces, generics and advanced patterns.',
		duration: 3764,
		views: 2104,
		stars: 178,
		forks: 24,
		tags: ['TypeScript', 'JavaScript'],
		createdAt: '1 month ago',
		published: true,
		lang: 'ts',
	},
	{
		id: '5',
		title: 'Intro to PostgreSQL',
		description:
			'Learn SQL fundamentals and PostgreSQL-specific features from scratch.',
		duration: 1790,
		views: 789,
		stars: 55,
		forks: 9,
		tags: ['SQL', 'PostgreSQL'],
		createdAt: '3 weeks ago',
		published: true,
		lang: 'sql',
	},
	{
		id: '6',
		title: 'Next.js App Router',
		description:
			'Deep dive into Next.js 14 App Router, server components, and streaming data fetching.',
		duration: 4522,
		views: 3421,
		stars: 256,
		forks: 45,
		tags: ['Next.js', 'React'],
		createdAt: '3 days ago',
		published: false,
		lang: 'jsx',
	},
];

const TAG_COLORS = {
	Go: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
	REST: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
	Backend: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
	React: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
	JavaScript: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
	CSS: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
	Frontend: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
	TypeScript: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
	SQL: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
	PostgreSQL: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
	'Next.js': 'bg-blue-500/15 text-blue-300 border-blue-500/20',
};

const LANG_GRADIENT = {
	go: 'from-cyan-700 to-teal-800',
	jsx: 'from-sky-700 to-blue-800',
	css: 'from-pink-700 to-rose-800',
	ts: 'from-blue-700 to-indigo-800',
	sql: 'from-orange-700 to-amber-800',
	js: 'from-yellow-700 to-amber-800',
};

function fmtDuration(secs) {
	const h = Math.floor(secs / 3600);
	const m = Math.floor((secs % 3600) / 60);
	const s = secs % 60;
	if (h > 0)
		return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
	{ id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
	{ id: 'scrims', icon: Video, label: 'My Scrims' },
	{ id: 'browse', icon: Globe, label: 'Browse' },
	{ id: 'forks', icon: GitFork, label: 'Forks' },
];

function Sidebar({ view, setView, isLoggedIn, onLogout, open, setOpen }) {
	return (
		<>
			{open && (
				<div
					className="fixed inset-0 z-20 bg-black/60 lg:hidden"
					onClick={() => setOpen(false)}
				/>
			)}
			<aside
				className={cn(
					'fixed inset-y-0 left-0 z-30 flex w-58 shrink-0 flex-col bg-[#0f1015] border-r border-white/6 transition-transform duration-200 lg:relative lg:translate-x-0',
					open ? 'translate-x-0' : '-translate-x-full',
				)}
			>
				{/* Logo */}
				<div className="flex items-center gap-2.5 px-5 h-14 border-b border-white/6 shrink-0">
					<div className="w-7 h-7 rounded-lg bg-blue-600/25 border border-blue-500/30 flex items-center justify-center shrink-0">
						<Hexagon
							size={14}
							className="text-blue-400"
							fill="currentColor"
							fillOpacity={0.3}
						/>
					</div>
					<span className="text-white font-semibold text-[15px] tracking-tight">
						DevStudio
					</span>
					<button
						onClick={() => setOpen(false)}
						className="ml-auto lg:hidden text-slate-500 hover:text-slate-300 transition-colors"
					>
						<X size={15} />
					</button>
				</div>

				{/* Nav */}
				<nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
					{/*  eslint-disable-next-line no-unused-vars */}
					{NAV_ITEMS.map(({ id, icon: Icon, label }) => (
						<button
							key={id}
							onClick={() => {
								setView(id);
								setOpen(false);
							}}
							className={cn(
								'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
								view === id
									? 'bg-blue-600/15 text-blue-300 font-medium'
									: 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
							)}
						>
							<Icon size={15} className={view === id ? 'text-blue-400' : ''} />
							{label}
						</button>
					))}
					<div className="h-px bg-white/6 my-2" />
					<button
						onClick={() => {
							setView('create');
							setOpen(false);
						}}
						className={cn(
							'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
							view === 'create'
								? 'bg-blue-600/20 text-blue-200 font-medium'
								: 'text-blue-400 hover:text-blue-300 hover:bg-blue-600/10',
						)}
					>
						<Plus size={15} />
						New Scrim
					</button>
				</nav>

				{/* Bottom nav */}
				<div className="px-3 py-3 border-t border-white/6 space-y-0.5 shrink-0">
					<button
						onClick={() => {
							setView('profile');
							setOpen(false);
						}}
						className={cn(
							'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
							view === 'profile'
								? 'bg-white/8 text-white'
								: 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
						)}
					>
						<User size={15} />
						Profile
					</button>
					<button
						onClick={() => {
							setView('settings');
							setOpen(false);
						}}
						className={cn(
							'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
							view === 'settings'
								? 'bg-white/8 text-white'
								: 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
						)}
					>
						<Settings size={15} />
						Settings
					</button>
					{isLoggedIn && (
						<button
							onClick={onLogout}
							className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
						>
							<LogOut size={15} />
							Sign Out
						</button>
					)}
				</div>

				{/* User strip */}
				{isLoggedIn && (
					<div className="px-4 py-3 border-t border-white/6 flex items-center gap-3 shrink-0">
						<div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
							A
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-xs font-medium text-slate-200 truncate">
								Ankush
							</p>
							<p className="text-[11px] text-slate-500 truncate">
								ankush@devstudio.io
							</p>
						</div>
					</div>
				)}
			</aside>
		</>
	);
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

const VIEW_LABELS = {
	dashboard: 'Dashboard',
	scrims: 'My Scrims',
	browse: 'Browse',
	forks: 'Forks',
	create: 'New Scrim',
	profile: 'Profile',
	settings: 'Settings',
};

function TopBar({ view, isLoggedIn, setOpen, navigate }) {
	return (
		<header className="flex items-center gap-4 px-5 h-14 border-b border-white/6 bg-[#0c0d11] shrink-0">
			<button
				onClick={() => setOpen(true)}
				className="lg:hidden text-slate-400 hover:text-slate-200 transition-colors"
			>
				<Menu size={18} />
			</button>
			<span className="hidden sm:block text-sm font-medium text-slate-400">
				{VIEW_LABELS[view]}
			</span>

			<div className="flex-1 flex justify-center">
				<div className="relative w-full max-w-sm">
					<Search
						size={13}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
					/>
					<input
						placeholder="Search scrims..."
						className="w-full bg-white/4 border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 focus:bg-white/6 transition-colors"
					/>
				</div>
			</div>

			<div className="flex items-center gap-2 shrink-0">
				<button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors">
					<Bell size={15} />
					<span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
				</button>
				{isLoggedIn ? (
					<div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
						A
					</div>
				) : (
					<button
						onClick={() => navigate('/scrim')}
						className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
					>
						Sign in
					</button>
				)}
			</div>
		</header>
	);
}

// ─── ScrimCard ────────────────────────────────────────────────────────────────

function ScrimCard({ scrim, navigate }) {
	const [hovered, setHovered] = useState(false);

	return (
		<div
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onClick={() => navigate('/scrim')}
			className="group bg-[#13141a] hover:bg-[#15161d] border border-white/6 hover:border-white/10 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer"
		>
			{/* Thumbnail */}
			<div
				className={cn(
					'h-36 bg-linear-to-br flex items-center justify-center relative',
					LANG_GRADIENT[scrim.lang] ?? 'from-slate-700 to-slate-800',
				)}
			>
				<Code2 size={28} className="text-white/15" />

				{/* Play overlay */}
				<div
					className={cn(
						'absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-150',
						hovered ? 'opacity-100' : 'opacity-0',
					)}
				>
					<div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
						<Play size={18} className="text-white ml-0.5" fill="white" />
					</div>
				</div>

				{/* Duration badge */}
				<div className="absolute bottom-2 right-2 bg-black/55 backdrop-blur text-white text-[11px] px-1.5 py-0.5 rounded font-mono">
					{fmtDuration(scrim.duration)}
				</div>

				{/* Status badge */}
				<div
					className={cn(
						'absolute top-2 left-2 flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full border font-medium',
						scrim.published
							? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
							: 'bg-slate-500/15 border-slate-500/25 text-slate-400',
					)}
				>
					<span
						className={cn(
							'w-1.5 h-1.5 rounded-full',
							scrim.published ? 'bg-emerald-400' : 'bg-slate-500',
						)}
					/>
					{scrim.published ? 'Published' : 'Draft'}
				</div>

				{/* Menu button */}
				<button
					onClick={(e) => e.stopPropagation()}
					className={cn(
						'absolute top-2 right-2 w-6 h-6 rounded-md bg-black/50 backdrop-blur flex items-center justify-center text-white/60 hover:text-white transition-all duration-150',
						hovered ? 'opacity-100' : 'opacity-0',
					)}
				>
					<MoreHorizontal size={13} />
				</button>
			</div>

			{/* Content */}
			<div className="p-4">
				<h3 className="text-sm font-semibold text-slate-100 mb-1 line-clamp-1">
					{scrim.title}
				</h3>
				<p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
					{scrim.description}
				</p>

				{/* Tags */}
				<div className="flex gap-1.5 flex-wrap mb-3">
					{scrim.tags.slice(0, 2).map((tag) => (
						<span
							key={tag}
							className={cn(
								'text-[10px] px-1.5 py-0.5 rounded border font-medium',
								TAG_COLORS[tag] ??
									'bg-slate-700/50 text-slate-400 border-slate-600/30',
							)}
						>
							{tag}
						</span>
					))}
				</div>

				{/* Stats */}
				<div className="flex items-center justify-between text-slate-600 text-xs">
					<div className="flex items-center gap-3">
						<span className="flex items-center gap-1">
							<Eye size={11} />
							{scrim.views.toLocaleString()}
						</span>
						<span className="flex items-center gap-1">
							<Star size={11} />
							{scrim.stars}
						</span>
						<span className="flex items-center gap-1">
							<GitFork size={11} />
							{scrim.forks}
						</span>
					</div>
					<span className="text-slate-600">{scrim.createdAt}</span>
				</div>
			</div>
		</div>
	);
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
function StatCard({ label, value, icon: Icon, subtext, gradient }) {
	return (
		<div className="bg-[#13141a] border border-white/6 rounded-xl p-5 flex items-center gap-4">
			<div
				className={cn(
					'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
					gradient,
				)}
			>
				<Icon size={17} className="text-white" />
			</div>
			<div className="min-w-0">
				<p className="text-xl font-bold text-white">{value}</p>
				<p className="text-xs text-slate-400">{label}</p>
				{subtext && (
					<p className="text-[11px] text-slate-600 mt-0.5">{subtext}</p>
				)}
			</div>
		</div>
	);
}

// ─── Dashboard View ───────────────────────────────────────────────────────────

function DashboardView({ navigate, setView }) {
	const stats = [
		{
			label: 'Total Scrims',
			value: '6',
			subtext: '+2 this month',
			icon: Video,
			gradient: 'bg-gradient-to-br from-blue-600 to-blue-700',
		},
		{
			label: 'Total Views',
			value: '9,964',
			subtext: '+324 this week',
			icon: Eye,
			gradient: 'bg-gradient-to-br from-blue-600 to-cyan-700',
		},
		{
			label: 'Total Forks',
			value: '103',
			subtext: 'across all scrims',
			icon: GitFork,
			gradient: 'bg-gradient-to-br from-emerald-600 to-teal-700',
		},
		{
			label: 'Watch Time',
			value: '4.8h',
			subtext: 'total recording',
			icon: Clock,
			gradient: 'bg-gradient-to-br from-orange-600 to-amber-700',
		},
	];

	return (
		<div className="p-6 space-y-8 max-w-7xl mx-auto w-full">
			{/* Welcome banner */}
			<div className="relative bg-linear-to-r from-blue-950/70 via-blue-900/40 to-transparent border border-blue-500/20 rounded-2xl p-6 overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.15),transparent_60%)]" />
				<div className="relative">
					<p className="text-xs font-medium text-blue-400 mb-1 tracking-wide uppercase">
						Welcome back
					</p>
					<h2 className="text-xl font-bold text-white mb-2">
						Good to see you, Ankush!
					</h2>
					<p className="text-sm text-slate-400 mb-5 max-w-md">
						Record your coding sessions, share with the community, and let
						others learn by interacting with your scrims in real-time.
					</p>
					<div className="flex gap-3 flex-wrap">
						<button
							onClick={() => setView('create')}
							className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
						>
							<Plus size={14} />
							New Scrim
						</button>
						<button
							onClick={() => setView('browse')}
							className="flex items-center gap-2 px-4 py-2 bg-white/8 hover:bg-white/12 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-white/[0.07]"
						>
							<Globe size={14} />
							Browse Scrims
						</button>
					</div>
				</div>
			</div>

			{/* Stats */}
			<div>
				<p className="text-[11px] font-medium text-slate-600 uppercase tracking-widest mb-3">
					Overview
				</p>
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
					{stats.map((s) => (
						<StatCard key={s.label} {...s} />
					))}
				</div>
			</div>

			{/* Recent scrims */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<p className="text-[11px] font-medium text-slate-600 uppercase tracking-widest">
						Recent Scrims
					</p>
					<button
						onClick={() => setView('scrims')}
						className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
					>
						View all <ChevronRight size={12} />
					</button>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{MOCK_SCRIMS.slice(0, 6).map((s) => (
						<ScrimCard key={s.id} scrim={s} navigate={navigate} />
					))}
				</div>
			</div>
		</div>
	);
}

// ─── My Scrims View ───────────────────────────────────────────────────────────

function MyScrimsView({ navigate }) {
	const [filter, setFilter] = useState('all');
	const filters = ['all', 'published', 'draft'];
	const filtered =
		filter === 'all'
			? MOCK_SCRIMS
			: MOCK_SCRIMS.filter((s) =>
					filter === 'published' ? s.published : !s.published,
				);

	return (
		<div className="p-6 space-y-5 max-w-7xl mx-auto w-full">
			<div className="flex items-center justify-between flex-wrap gap-3">
				<div className="flex gap-1 bg-white/4 border border-white/6 rounded-lg p-0.5">
					{filters.map((f) => (
						<button
							key={f}
							onClick={() => setFilter(f)}
							className={cn(
								'px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors',
								filter === f
									? 'bg-white/10 text-white'
									: 'text-slate-500 hover:text-slate-300',
							)}
						>
							{f}
						</button>
					))}
				</div>
				<button
					onClick={() => navigate('/scrim')}
					className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
				>
					<Plus size={13} />
					New Scrim
				</button>
			</div>

			{filtered.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{filtered.map((s) => (
						<ScrimCard key={s.id} scrim={s} navigate={navigate} />
					))}
				</div>
			) : (
				<div className="text-center py-20">
					<Video size={32} className="text-slate-700 mx-auto mb-3" />
					<p className="text-slate-500 text-sm">No scrims here yet.</p>
				</div>
			)}
		</div>
	);
}

// ─── Browse View ──────────────────────────────────────────────────────────────

function BrowseView({ navigate }) {
	const trending = [...MOCK_SCRIMS].sort((a, b) => b.views - a.views);

	return (
		<div className="p-6 space-y-5 max-w-7xl mx-auto w-full">
			<div className="flex items-center gap-2">
				<TrendingUp size={14} className="text-blue-400" />
				<p className="text-[11px] font-medium text-slate-600 uppercase tracking-widest">
					Trending
				</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				{trending.map((s) => (
					<ScrimCard key={s.id} scrim={s} navigate={navigate} />
				))}
			</div>
		</div>
	);
}

// ─── Forks View ───────────────────────────────────────────────────────────────

function ForksView({ navigate }) {
	const forked = MOCK_SCRIMS.filter((s) => s.forks > 15);

	return (
		<div className="p-6 space-y-5 max-w-7xl mx-auto w-full">
			<p className="text-sm text-slate-500">
				Scrims you have forked from the community.
			</p>
			{forked.length === 0 ? (
				<div className="text-center py-20">
					<GitFork size={32} className="text-slate-700 mx-auto mb-3" />
					<p className="text-slate-500 text-sm mb-1">No forks yet.</p>
					<p className="text-slate-600 text-xs">
						Browse scrims and fork one to start your own version.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{forked.map((s) => (
						<ScrimCard key={s.id} scrim={s} navigate={navigate} />
					))}
				</div>
			)}
		</div>
	);
}

// ─── Create Scrim View ────────────────────────────────────────────────────────

const LANGS = ['JavaScript', 'TypeScript', 'React', 'HTML/CSS', 'Go', 'Python'];

function CreateScrimView({ navigate }) {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [selectedLang, setSelectedLang] = useState('');

	return (
		<div className="p-6 flex justify-center">
			<div className="w-full max-w-xl">
				<div className="bg-[#13141a] border border-white/6 rounded-2xl p-8">
					<div className="flex items-center gap-3 mb-7">
						<div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
							<Video size={17} className="text-blue-400" />
						</div>
						<div>
							<h2 className="text-base font-semibold text-white">
								Create New Scrim
							</h2>
							<p className="text-xs text-slate-500">
								Set up your scrim, then start recording
							</p>
						</div>
					</div>

					<div className="space-y-4">
						<div>
							<label className="block text-xs font-medium text-slate-400 mb-1.5">
								Title
							</label>
							<input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="e.g. Building a REST API with Go"
								className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/6 transition-colors"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-slate-400 mb-1.5">
								Description{' '}
								<span className="text-slate-600 font-normal">(optional)</span>
							</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="What will viewers learn from this scrim?"
								rows={3}
								className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/6 transition-colors resize-none"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-slate-400 mb-1.5">
								Language
							</label>
							<div className="grid grid-cols-3 gap-2">
								{LANGS.map((lang) => (
									<button
										key={lang}
										onClick={() =>
											setSelectedLang(lang === selectedLang ? '' : lang)
										}
										className={cn(
											'py-2 text-xs font-medium rounded-lg border transition-colors',
											selectedLang === lang
												? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
												: 'bg-white/3 border-white/[0.07] text-slate-400 hover:text-slate-200 hover:border-blue-500/30 hover:bg-blue-500/8',
										)}
									>
										{lang}
									</button>
								))}
							</div>
						</div>
					</div>

					<div className="flex gap-3 mt-7">
						<button
							onClick={() => navigate('/scrim')}
							className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
						>
							<Play size={13} fill="white" />
							Open Editor
						</button>
						<button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/8 text-slate-300 text-sm font-medium rounded-lg border border-white/[0.07] transition-colors">
							Save as Draft
						</button>
					</div>
				</div>

				<div className="mt-4 bg-blue-950/50 border border-blue-500/15 rounded-xl p-4 flex gap-3">
					<Zap size={15} className="text-blue-400 shrink-0 mt-0.5" />
					<div>
						<p className="text-xs font-medium text-blue-300 mb-1">
							How scrims work
						</p>
						<p className="text-xs text-slate-500 leading-relaxed">
							Record your screen while coding. Viewers can pause, rewind, and
							edit code alongside you. They can also fork your scrim to create
							their own version.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── Profile View ─────────────────────────────────────────────────────────────

function ProfileView({ isLoggedIn }) {
	if (!isLoggedIn) {
		return (
			<div className="p-6 flex justify-center">
				<div className="text-center py-20">
					<div className="w-16 h-16 rounded-full bg-slate-800/60 mx-auto mb-4 flex items-center justify-center">
						<User size={26} className="text-slate-600" />
					</div>
					<p className="text-slate-400 font-medium mb-1.5">Not signed in</p>
					<p className="text-sm text-slate-600">
						Sign in to view your profile.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-2xl mx-auto w-full space-y-5">
			{/* Profile card */}
			<div className="bg-[#13141a] border border-white/6 rounded-2xl overflow-hidden">
				<div className="h-24 bg-linear-to-r from-blue-900/70 to-blue-900/40" />
				<div className="px-6 pb-6">
					<div className="flex items-end gap-4 -mt-8 mb-4">
						<div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-blue-700 border-4 border-[#13141a] flex items-center justify-center text-white text-xl font-bold shrink-0">
							A
						</div>
						<div className="mb-1">
							<h2 className="text-base font-semibold text-white">
								Ankush Banik
							</h2>
							<p className="text-xs text-slate-500">@ankush263</p>
						</div>
						<button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/6 hover:bg-white/10 text-slate-300 text-xs font-medium rounded-lg border border-white/[0.07] transition-colors mb-1">
							<Pencil size={11} />
							Edit Profile
						</button>
					</div>
					<p className="text-sm text-slate-400 mb-5 leading-relaxed">
						Full-stack developer passionate about building great developer
						tooling and sharing knowledge through interactive code recordings.
					</p>
					<div className="flex gap-6 text-xs text-slate-500">
						{[
							['6', 'Scrims'],
							['9.9k', 'Views'],
							['103', 'Forks'],
							['683', 'Stars'],
						].map(([val, lbl]) => (
							<div key={lbl} className="flex flex-col gap-0.5 items-center">
								<strong className="text-white text-sm font-bold">{val}</strong>
								<span>{lbl}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Recent activity */}
			<div className="bg-[#13141a] border border-white/6 rounded-2xl p-5">
				<p className="text-[11px] font-medium text-slate-600 uppercase tracking-widest mb-4">
					Recent Activity
				</p>
				<div className="space-y-1">
					{MOCK_SCRIMS.slice(0, 4).map((s) => (
						<div
							key={s.id}
							className="flex items-center gap-3 py-2.5 border-b border-white/4 last:border-0"
						>
							<div className="w-8 h-8 rounded-lg bg-blue-600/15 flex items-center justify-center shrink-0">
								<Video size={13} className="text-blue-400" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm text-slate-200 truncate">{s.title}</p>
								<p className="text-xs text-slate-600">{s.createdAt}</p>
							</div>
							<span
								className={cn(
									'text-[10px] px-1.5 py-0.5 rounded-full border font-medium shrink-0',
									s.published
										? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
										: 'bg-slate-500/10 border-slate-500/20 text-slate-500',
								)}
							>
								{s.published ? 'Published' : 'Draft'}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

// ─── Settings View ────────────────────────────────────────────────────────────

function SettingsView() {
	const sections = [
		{ title: 'Account', items: ['Email address', 'Password', 'Username'] },
		{
			title: 'Preferences',
			items: ['Default editor theme', 'Playback speed', 'Auto-publish'],
		},
		{
			title: 'Notifications',
			items: ['Email notifications', 'Fork alerts', 'New followers'],
		},
	];

	return (
		<div className="p-6 max-w-xl mx-auto w-full space-y-4">
			{sections.map(({ title, items }) => (
				<div
					key={title}
					className="bg-[#13141a] border border-white/6 rounded-2xl overflow-hidden"
				>
					<div className="px-5 py-3 border-b border-white/5">
						<p className="text-[11px] font-medium text-slate-600 uppercase tracking-widest">
							{title}
						</p>
					</div>
					{items.map((item, i) => (
						<div
							key={item}
							className={cn(
								'flex items-center justify-between px-5 py-3.5',
								i < items.length - 1 && 'border-b border-white/4',
							)}
						>
							<span className="text-sm text-slate-300">{item}</span>
							<button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
								Edit
							</button>
						</div>
					))}
				</div>
			))}

			<div className="bg-red-950/30 border border-red-500/15 rounded-2xl overflow-hidden">
				<div className="px-5 py-3 border-b border-red-500/10">
					<p className="text-[11px] font-medium text-red-500 uppercase tracking-widest">
						Danger Zone
					</p>
				</div>
				<div className="flex items-center justify-between px-5 py-4">
					<div>
						<p className="text-sm text-slate-300">Delete Account</p>
						<p className="text-xs text-slate-600 mt-0.5">
							Permanently remove your account and all scrims.
						</p>
					</div>
					<button className="text-xs px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-colors">
						Delete
					</button>
				</div>
			</div>
		</div>
	);
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Home() {
	const navigate = useNavigate();
	const [view, setView] = useState('dashboard');
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsLoggedIn(!!localStorage.getItem('jwt'));
		document.documentElement.classList.add('dark');
		return () => document.documentElement.classList.remove('dark');
	}, []);

	const handleLogout = () => {
		localStorage.removeItem('jwt');
		setIsLoggedIn(false);
	};

	const renderView = () => {
		switch (view) {
			case 'dashboard':
				return <DashboardView navigate={navigate} setView={setView} />;
			case 'scrims':
				return <MyScrimsView navigate={navigate} />;
			case 'browse':
				return <BrowseView navigate={navigate} />;
			case 'forks':
				return <ForksView navigate={navigate} />;
			case 'create':
				return <CreateScrimView navigate={navigate} />;
			case 'profile':
				return <ProfileView isLoggedIn={isLoggedIn} />;
			case 'settings':
				return <SettingsView />;
			default:
				return <DashboardView navigate={navigate} setView={setView} />;
		}
	};

	return (
		<div className="fixed inset-0 flex bg-[#0c0d11] text-slate-200">
			<Sidebar
				view={view}
				setView={setView}
				isLoggedIn={isLoggedIn}
				onLogout={handleLogout}
				open={sidebarOpen}
				setOpen={setSidebarOpen}
			/>
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				<TopBar
					view={view}
					isLoggedIn={isLoggedIn}
					setOpen={setSidebarOpen}
					navigate={navigate}
				/>
				<main className="flex-1 overflow-y-auto">{renderView()}</main>
			</div>
		</div>
	);
}
