import { a as require_react, o as __toESM, t as require_jsx_runtime } from "../index.js";
//#region app/page.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var copy = {
	zh: {
		title: "OCL 定型助剂自动输送系统",
		sub: "项目进度控制中心",
		overview: "总览",
		gantt: "甘特图",
		board: "看板",
		list: "任务清单",
		total: "任务总数",
		completion: "完成率",
		active: "进行中",
		delayed: "已延期",
		noStart: "未开始",
		search: "搜索任务或部门",
		all: "全部阶段",
		planned: "计划",
		actual: "实际",
		owner: "负责部门",
		dates: "计划日期",
		noTasks: "暂无任务",
		updated: "状态已更新",
		saveError: "保存失败，请重试",
		completed: "已完成",
		inProgress: "进行中",
		delayedLabel: "延期",
		projectWindow: "项目周期",
		today: "今日",
		phaseProgress: "阶段进度",
		statusSummary: "状态统计",
		dataSource: "数据源：OCL总体计划（0709）",
		filter: "筛选"
	},
	en: {
		title: "OCL Finishing Auxiliary Auto-Conveying System",
		sub: "Project Progress Control Center",
		overview: "Overview",
		gantt: "Gantt",
		board: "Board",
		list: "Task List",
		total: "Total Tasks",
		completion: "Completion",
		active: "In Progress",
		delayed: "Delayed",
		noStart: "Not Started",
		search: "Search tasks or owners",
		all: "All phases",
		planned: "Planned",
		actual: "Actual",
		owner: "Owner",
		dates: "Planned dates",
		noTasks: "No tasks",
		updated: "Status updated",
		saveError: "Could not save. Please retry",
		completed: "Completed",
		inProgress: "In Progress",
		delayedLabel: "Delayed",
		projectWindow: "Project window",
		today: "Today",
		phaseProgress: "Phase progress",
		statusSummary: "Status summary",
		dataSource: "Source: OCL Master Plan (0709)",
		filter: "Filter"
	}
};
var statusMeta = {
	Completed: {
		zh: "已完成",
		en: "Completed",
		color: "#1f9d72"
	},
	"In Progress": {
		zh: "进行中",
		en: "In Progress",
		color: "#d88a24"
	},
	Delayed: {
		zh: "延期",
		en: "Delayed",
		color: "#df5a61"
	},
	"Not Started": {
		zh: "未开始",
		en: "Not Started",
		color: "#8b92a1"
	}
};
var day = 864e5;
var projectStart = /* @__PURE__ */ new Date("2026-06-02T00:00:00");
var projectDays = Math.round(((/* @__PURE__ */ new Date("2026-08-30T00:00:00")).getTime() - projectStart.getTime()) / day) + 1;
function shortPhase(phase, lang) {
	const [main, detail] = phase.split(" · ");
	const zh = (detail || main).replace(/[A-Za-z][\s\S]*$/, "").trim();
	const enMatch = (detail || main).match(/[A-Za-z][\s\S]*$/);
	return lang === "zh" ? zh || main : enMatch?.[0]?.trim() || main;
}
function dateLabel(value, lang) {
	if (!value) return "—";
	const d = /* @__PURE__ */ new Date(value + "T00:00:00");
	return lang === "zh" ? `${d.getMonth() + 1}月${d.getDate()}日` : d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric"
	});
}
function Home() {
	const [tasks, setTasks] = (0, import_react.useState)([]);
	const [lang, setLang] = (0, import_react.useState)("zh");
	const [view, setView] = (0, import_react.useState)("overview");
	const [query, setQuery] = (0, import_react.useState)("");
	const [phase, setPhase] = (0, import_react.useState)("all");
	const [toast, setToast] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [savePassword, setSavePassword] = (0, import_react.useState)("");
	const [passwordInput, setPasswordInput] = (0, import_react.useState)("");
	const [pendingSave, setPendingSave] = (0, import_react.useState)(null);
	const t = copy[lang];
	(0, import_react.useEffect)(() => {
		fetch("/api/tasks").then((r) => r.json()).then((d) => setTasks(d.tasks || [])).finally(() => setLoading(false));
	}, []);
	const phases = (0, import_react.useMemo)(() => Array.from(new Set(tasks.map((x) => x.phase))), [tasks]);
	const filtered = (0, import_react.useMemo)(() => tasks.filter((x) => (phase === "all" || x.phase === phase) && (!query || `${x.nameZh} ${x.nameEn} ${x.owner}`.toLowerCase().includes(query.toLowerCase()))), [
		tasks,
		phase,
		query
	]);
	const counts = (0, import_react.useMemo)(() => ({
		completed: tasks.filter((x) => x.status === "Completed").length,
		active: tasks.filter((x) => x.status === "In Progress").length,
		delayed: tasks.filter((x) => x.status === "Delayed").length,
		noStart: tasks.filter((x) => x.status === "Not Started").length
	}), [tasks]);
	const percent = tasks.length ? Math.round(counts.completed / tasks.length * 100) : 0;
	function updateStatus(id, status) {
		if (!savePassword) {
			setPendingSave({
				id,
				status
			});
			setPasswordInput("");
			return;
		}
		performUpdate(id, status, savePassword);
	}
	async function performUpdate(id, status, password) {
		const previous = tasks;
		setTasks((v) => v.map((x) => x.id === id ? {
			...x,
			status
		} : x));
		const res = await fetch("/api/tasks", {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
				"x-save-password": password
			},
			body: JSON.stringify({
				id,
				status
			})
		});
		if (res.ok) {
			setSavePassword(password);
			setToast(t.updated);
		} else {
			setTasks(previous);
			setSavePassword("");
			setToast(res.status === 401 ? lang === "zh" ? "密码错误，未保存" : "Wrong password. Not saved" : t.saveError);
		}
		window.setTimeout(() => setToast(""), 2200);
	}
	function confirmSave(e) {
		e.preventDefault();
		if (!pendingSave || !passwordInput) return;
		const update = pendingSave;
		setPendingSave(null);
		performUpdate(update.id, update.status, passwordInput);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "app-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "sidebar",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "brand",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "brand-mark",
							children: "OCL"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "OCL" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "PROJECT CONTROL" })] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { children: [
						"overview",
						"gantt",
						"board",
						"list"
					].map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: view === v ? "active" : "",
						onClick: () => setView(v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: [
							"⌂",
							"▥",
							"▦",
							"☷"
						][i] }), t[v]]
					}, v)) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sidebar-foot",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pulse" }),
							lang === "zh" ? "项目数据已连接" : "Project data connected",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: t.dataSource })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "workspace",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "topbar",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: t.sub
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: t.title })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "header-actions",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "lang-switch",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: lang === "zh" ? "on" : "",
								onClick: () => setLang("zh"),
								children: "中文"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: lang === "en" ? "on" : "",
								onClick: () => setLang("en"),
								children: "EN"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "date-chip",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "◷" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: t.projectWindow }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "2026.06.02 — 08.30" })
							]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "content",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "hero-strip",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "project-code",
									children: "OCL · 2026"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: lang === "zh" ? "从安装到正式运行，每一项进度清晰可见" : "From installation to go-live, every task stays visible" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: lang === "zh" ? "基于 0709 总体计划 · 计划与实际日期同步跟踪" : "Based on the 0709 master plan · planned and actual dates tracked together" })
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hero-progress",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "ring",
									style: { "--p": `${percent * 3.6}deg` },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [percent, "%"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: t.completion })] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
									counts.completed,
									"/",
									tasks.length
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: lang === "zh" ? "任务已完成" : "tasks completed" })] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "metrics",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
									label: t.total,
									value: tasks.length,
									icon: "Σ",
									tone: "purple",
									note: lang === "zh" ? `${phases.length} 个项目阶段` : `${phases.length} project phases`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
									label: t.completion,
									value: `${percent}%`,
									icon: "✓",
									tone: "green",
									note: lang === "zh" ? "按任务数量统计" : "Based on task count"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
									label: t.active,
									value: counts.active,
									icon: "↗",
									tone: "amber",
									note: lang === "zh" ? "需持续跟进" : "Requires follow-up"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
									label: t.delayed,
									value: counts.delayed,
									icon: "!",
									tone: "red",
									note: lang === "zh" ? "需要优先处理" : "Needs priority action"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
									label: t.noStart,
									value: counts.noStart,
									icon: "○",
									tone: "gray",
									note: lang === "zh" ? "尚未开始" : "Not yet started"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "filters",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "search",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⌕" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: query,
									onChange: (e) => setQuery(e.target.value),
									placeholder: t.search
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "select-wrap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.filter }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: phase,
									onChange: (e) => setPhase(e.target.value),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "all",
										children: t.all
									}), phases.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: p,
										children: shortPhase(p, lang)
									}, p))]
								})]
							})]
						}),
						view === "overview" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overview, {
							tasks: filtered,
							lang,
							onStatus: updateStatus
						}),
						view === "gantt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gantt, {
							tasks: filtered,
							lang,
							onStatus: updateStatus
						}),
						view === "board" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Board, {
							tasks: filtered,
							lang,
							onStatus: updateStatus
						}),
						view === "list" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskList, {
							tasks: filtered,
							lang,
							onStatus: updateStatus
						}),
						loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "loading",
							children: lang === "zh" ? "正在载入计划…" : "Loading plan…"
						})
					]
				})]
			}),
			toast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "toast",
				children: toast
			}),
			pendingSave && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "modal-backdrop",
				role: "presentation",
				onMouseDown: () => setPendingSave(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "password-modal",
					onSubmit: confirmSave,
					onMouseDown: (e) => e.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "lock-icon",
							children: "⌾"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: lang === "zh" ? "输入保存密码" : "Enter save password" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: lang === "zh" ? "验证后，本次打开期间的修改将自动保存到云端。" : "After verification, changes during this session will save to the shared web data." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: lang === "zh" ? "密码" : "Password" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							autoFocus: true,
							type: "password",
							value: passwordInput,
							onChange: (e) => setPasswordInput(e.target.value),
							placeholder: "••••••"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "cancel-btn",
							onClick: () => setPendingSave(null),
							children: lang === "zh" ? "取消" : "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "save-btn",
							children: lang === "zh" ? "验证并保存" : "Verify & save"
						})] })
					]
				})
			})
		]
	});
}
function Metric({ label, value, icon, tone, note }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "metric-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `metric-icon ${tone}`,
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: label }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: value }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: note })
		] })]
	});
}
function Overview({ tasks, lang, onStatus }) {
	const phases = Array.from(new Set(tasks.map((x) => x.phase)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overview-grid",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel phase-panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "01" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: copy[lang].phaseProgress })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: phases.length })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "phase-list",
				children: phases.map((p) => {
					const pt = tasks.filter((x) => x.phase === p), done = pt.filter((x) => x.status === "Completed").length, pct = Math.round(done / pt.length * 100);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "phase-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: shortPhase(p, lang) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								done,
								"/",
								pt.length
							] })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bar",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { width: `${pct}%` } })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [pct, "%"] })
						]
					}, p);
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel status-panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "panel-head",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "02" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: copy[lang].statusSummary })] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Donut, {
					tasks,
					lang
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "attention",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: lang === "zh" ? "近期重点" : "Current focus" }), tasks.filter((x) => x.status !== "Completed").slice(0, 4).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskMini, {
						task: x,
						lang,
						onStatus
					}, x.id))]
				})
			]
		})]
	});
}
function Donut({ tasks, lang }) {
	const statuses = [
		"Completed",
		"In Progress",
		"Delayed",
		"Not Started"
	], vals = statuses.map((s) => tasks.filter((x) => x.status === s).length);
	const total = Math.max(tasks.length, 1), a = vals[0] / total * 360, b = (vals[0] + vals[1]) / total * 360, c = (vals[0] + vals[1] + vals[2]) / total * 360;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "donut-wrap",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "donut",
			style: { background: `conic-gradient(#1f9d72 0 ${a}deg,#d88a24 ${a}deg ${b}deg,#df5a61 ${b}deg ${c}deg,#8b92a1 ${c}deg 360deg)` },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: tasks.length }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: copy[lang].total })] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "legend",
			children: statuses.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { background: statusMeta[s].color } }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: lang === "zh" ? statusMeta[s].zh : statusMeta[s].en }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: vals[i] })
			] }, s))
		})]
	});
}
function StatusSelect({ task, onStatus, lang }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		className: `status-select ${task.status.replace(/ /g, "-").toLowerCase()}`,
		value: task.status,
		onChange: (e) => onStatus(task.id, e.target.value),
		children: [
			"Completed",
			"In Progress",
			"Delayed",
			"Not Started"
		].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
			value: s,
			children: lang === "zh" ? statusMeta[s].zh : statusMeta[s].en
		}, s))
	});
}
function TaskMini({ task, lang, onStatus }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "task-mini",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "task-id",
				children: task.id
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: lang === "zh" ? task.nameZh : task.nameEn }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: task.owner })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusSelect, {
				task,
				onStatus,
				lang
			})
		]
	});
}
function Board({ tasks, lang, onStatus }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "board",
		children: [
			"Not Started",
			"In Progress",
			"Completed",
			"Delayed"
		].map((s) => {
			const group = tasks.filter((x) => x.status === s);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "board-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { background: statusMeta[s].color } }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: lang === "zh" ? statusMeta[s].zh : statusMeta[s].en }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: group.length })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: group.length ? group.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "kanban-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: x.id }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusSelect, {
							task: x,
							onStatus,
							lang
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: lang === "zh" ? x.nameZh : x.nameEn }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: shortPhase(x.phase, lang) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["♙ ", x.owner] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["◷ ", dateLabel(x.plannedEnd, lang)] })] })
					]
				}, x.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "empty",
					children: copy[lang].noTasks
				}) })]
			}, s);
		})
	});
}
function Gantt({ tasks, lang, onStatus }) {
	const months = lang === "zh" ? [
		"6月",
		"7月",
		"8月"
	] : [
		"JUN",
		"JUL",
		"AUG"
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "panel gantt-panel",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "gantt-head",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: copy[lang].list }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "months",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { width: "32%" },
						children: months[0]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { width: "34%" },
						children: months[1]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { width: "34%" },
						children: months[2]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "gantt-body",
			children: tasks.map((x) => {
				const start = x.plannedStart ? Math.max(0, (new Date(x.plannedStart).getTime() - projectStart.getTime()) / day) : 0;
				const end = x.plannedEnd ? Math.min(projectDays - 1, (new Date(x.plannedEnd).getTime() - projectStart.getTime()) / day) : start;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "gantt-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "gantt-label",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: x.id }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: lang === "zh" ? x.nameZh : x.nameEn }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusSelect, {
								task: x,
								onStatus,
								lang
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "timeline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
							className: x.status.replace(" ", "-").toLowerCase(),
							style: {
								left: `${start / projectDays * 100}%`,
								width: `${Math.max(1.3, (end - start + 1) / projectDays * 100)}%`
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: dateLabel(x.plannedStart, lang) })
						})
					})]
				}, x.id);
			})
		})]
	});
}
function TaskList({ tasks, lang, onStatus }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "panel table-panel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "ID" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: copy[lang].list }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: copy[lang].owner }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: copy[lang].dates }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: lang === "zh" ? "状态" : "Status" })
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: tasks.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "task-id",
				children: x.id
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: lang === "zh" ? x.nameZh : x.nameEn }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: shortPhase(x.phase, lang) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: x.owner }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
				dateLabel(x.plannedStart, lang),
				" — ",
				dateLabel(x.plannedEnd, lang)
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusSelect, {
				task: x,
				onStatus,
				lang
			}) })
		] }, x.id)) })] })
	});
}
//#endregion
export { Home as default };
