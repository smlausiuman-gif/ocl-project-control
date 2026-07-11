"use client";

import { useEffect, useMemo, useState } from "react";

type Status = "Completed" | "In Progress" | "Delayed" | "Not Started";
type Task = { id:string; phase:string; taskNo:string; nameZh:string; nameEn:string; owner:string; status:Status; plannedStart:string|null; plannedEnd:string|null; actualStart:string|null; actualEnd:string|null };
type Lang = "zh" | "en";

const copy = {
  zh: { title:"OCL 定型助剂自动输送系统", sub:"项目进度控制中心", overview:"总览", gantt:"甘特图", board:"看板", list:"任务清单", total:"任务总数", completion:"完成率", active:"进行中", delayed:"已延期", noStart:"未开始", search:"搜索任务或部门", all:"全部阶段", planned:"计划", actual:"实际", owner:"负责部门", dates:"计划日期", noTasks:"暂无任务", updated:"状态已更新", saveError:"保存失败，请重试", completed:"已完成", inProgress:"进行中", delayedLabel:"延期", projectWindow:"项目周期", today:"今日", phaseProgress:"阶段进度", statusSummary:"状态统计", dataSource:"数据源：OCL总体计划（0709）", filter:"筛选" },
  en: { title:"OCL Finishing Auxiliary Auto-Conveying System", sub:"Project Progress Control Center", overview:"Overview", gantt:"Gantt", board:"Board", list:"Task List", total:"Total Tasks", completion:"Completion", active:"In Progress", delayed:"Delayed", noStart:"Not Started", search:"Search tasks or owners", all:"All phases", planned:"Planned", actual:"Actual", owner:"Owner", dates:"Planned dates", noTasks:"No tasks", updated:"Status updated", saveError:"Could not save. Please retry", completed:"Completed", inProgress:"In Progress", delayedLabel:"Delayed", projectWindow:"Project window", today:"Today", phaseProgress:"Phase progress", statusSummary:"Status summary", dataSource:"Source: OCL Master Plan (0709)", filter:"Filter" },
};

const statusMeta: Record<Status,{zh:string;en:string;color:string}> = {
  Completed:{zh:"已完成",en:"Completed",color:"#1f9d72"},
  "In Progress":{zh:"进行中",en:"In Progress",color:"#d88a24"},
  Delayed:{zh:"延期",en:"Delayed",color:"#df5a61"},
  "Not Started":{zh:"未开始",en:"Not Started",color:"#8b92a1"},
};

const day = 86400000;
const projectStart = new Date("2026-06-02T00:00:00");
const projectEnd = new Date("2026-08-30T00:00:00");
const projectDays = Math.round((projectEnd.getTime()-projectStart.getTime())/day)+1;

function shortPhase(phase:string, lang:Lang){
  const [main,detail] = phase.split(" · ");
  const zh = (detail || main).replace(/[A-Za-z][\s\S]*$/,"").trim();
  const enMatch = (detail || main).match(/[A-Za-z][\s\S]*$/);
  return lang === "zh" ? (zh || main) : (enMatch?.[0]?.trim() || main);
}

function dateLabel(value:string|null, lang:Lang){
  if(!value) return "—";
  const d=new Date(value+"T00:00:00");
  return lang==="zh" ? `${d.getMonth()+1}月${d.getDate()}日` : d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
}

export default function Home(){
  const [tasks,setTasks]=useState<Task[]>([]);
  const [lang,setLang]=useState<Lang>("zh");
  const [view,setView]=useState<"overview"|"gantt"|"board"|"list">("overview");
  const [query,setQuery]=useState("");
  const [phase,setPhase]=useState("all");
  const [toast,setToast]=useState("");
  const [loading,setLoading]=useState(true);
  const [savePassword,setSavePassword]=useState("");
  const [passwordInput,setPasswordInput]=useState("");
  const [pendingSave,setPendingSave]=useState<{id:string;status:Status}|null>(null);
  const t=copy[lang];

  useEffect(()=>{ fetch("/api/tasks").then(r=>r.json()).then(d=>setTasks(d.tasks||[])).finally(()=>setLoading(false)); },[]);
  const phases=useMemo(()=>Array.from(new Set(tasks.map(x=>x.phase))),[tasks]);
  const filtered=useMemo(()=>tasks.filter(x=> (phase==="all"||x.phase===phase) && (!query||`${x.nameZh} ${x.nameEn} ${x.owner}`.toLowerCase().includes(query.toLowerCase()))),[tasks,phase,query]);
  const counts=useMemo(()=>({ completed:tasks.filter(x=>x.status==="Completed").length, active:tasks.filter(x=>x.status==="In Progress").length, delayed:tasks.filter(x=>x.status==="Delayed").length, noStart:tasks.filter(x=>x.status==="Not Started").length }),[tasks]);
  const percent=tasks.length?Math.round(counts.completed/tasks.length*100):0;

  function updateStatus(id:string,status:Status){
    if(!savePassword){ setPendingSave({id,status}); setPasswordInput(""); return; }
    void performUpdate(id,status,savePassword);
  }

  async function performUpdate(id:string,status:Status,password:string){
    const previous=tasks;
    setTasks(v=>v.map(x=>x.id===id?{...x,status}:x));
    const res=await fetch("/api/tasks",{method:"PATCH",headers:{"content-type":"application/json","x-save-password":password},body:JSON.stringify({id,status})});
    if(res.ok){ setSavePassword(password); setToast(t.updated); }
    else { setTasks(previous); setSavePassword(""); setToast(res.status===401?(lang==="zh"?"密码错误，未保存":"Wrong password. Not saved"):t.saveError); }
    window.setTimeout(()=>setToast(""),2200);
  }

  function confirmSave(e:React.FormEvent){
    e.preventDefault();
    if(!pendingSave||!passwordInput)return;
    const update=pendingSave; setPendingSave(null); void performUpdate(update.id,update.status,passwordInput);
  }

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">OCL</span><div><strong>OCL</strong><small>PROJECT CONTROL</small></div></div>
      <nav>
        {(["overview","gantt","board","list"] as const).map((v,i)=><button key={v} className={view===v?"active":""} onClick={()=>setView(v)}><span>{["⌂","▥","▦","☷"][i]}</span>{t[v]}</button>)}
      </nav>
      <div className="sidebar-foot"><span className="pulse"/>{lang==="zh"?"项目数据已连接":"Project data connected"}<small>{t.dataSource}</small></div>
    </aside>

    <section className="workspace">
      <header className="topbar">
        <div><p className="eyebrow">{t.sub}</p><h1>{t.title}</h1></div>
        <div className="header-actions"><div className="lang-switch"><button className={lang==="zh"?"on":""} onClick={()=>setLang("zh")}>中文</button><button className={lang==="en"?"on":""} onClick={()=>setLang("en")}>EN</button></div><div className="date-chip"><span>◷</span><b>{t.projectWindow}</b><small>2026.06.02 — 08.30</small></div></div>
      </header>

      <div className="content">
        <section className="hero-strip">
          <div><span className="project-code">OCL · 2026</span><h2>{lang==="zh"?"从安装到正式运行，每一项进度清晰可见":"From installation to go-live, every task stays visible"}</h2><p>{lang==="zh"?"基于 0709 总体计划 · 计划与实际日期同步跟踪":"Based on the 0709 master plan · planned and actual dates tracked together"}</p></div>
          <div className="hero-progress"><div className="ring" style={{"--p":`${percent*3.6}deg`} as React.CSSProperties}><span><b>{percent}%</b><small>{t.completion}</small></span></div><div><b>{counts.completed}/{tasks.length}</b><small>{lang==="zh"?"任务已完成":"tasks completed"}</small></div></div>
        </section>

        <section className="metrics">
          <Metric label={t.total} value={tasks.length} icon="Σ" tone="purple" note={lang==="zh"?`${phases.length} 个项目阶段`:`${phases.length} project phases`}/>
          <Metric label={t.completion} value={`${percent}%`} icon="✓" tone="green" note={lang==="zh"?"按任务数量统计":"Based on task count"}/>
          <Metric label={t.active} value={counts.active} icon="↗" tone="amber" note={lang==="zh"?"需持续跟进":"Requires follow-up"}/>
          <Metric label={t.delayed} value={counts.delayed} icon="!" tone="red" note={lang==="zh"?"需要优先处理":"Needs priority action"}/>
          <Metric label={t.noStart} value={counts.noStart} icon="○" tone="gray" note={lang==="zh"?"尚未开始":"Not yet started"}/>
        </section>

        <div className="filters"><label className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search}/></label><label className="select-wrap"><span>{t.filter}</span><select value={phase} onChange={e=>setPhase(e.target.value)}><option value="all">{t.all}</option>{phases.map(p=><option value={p} key={p}>{shortPhase(p,lang)}</option>)}</select></label></div>

        {view==="overview"&&<Overview tasks={filtered} lang={lang} onStatus={updateStatus}/>} 
        {view==="gantt"&&<Gantt tasks={filtered} lang={lang} onStatus={updateStatus}/>} 
        {view==="board"&&<Board tasks={filtered} lang={lang} onStatus={updateStatus}/>} 
        {view==="list"&&<TaskList tasks={filtered} lang={lang} onStatus={updateStatus}/>} 
        {loading&&<div className="loading">{lang==="zh"?"正在载入计划…":"Loading plan…"}</div>}
      </div>
    </section>
    {toast&&<div className="toast">{toast}</div>}
    {pendingSave&&<div className="modal-backdrop" role="presentation" onMouseDown={()=>setPendingSave(null)}><form className="password-modal" onSubmit={confirmSave} onMouseDown={e=>e.stopPropagation()}><span className="lock-icon">⌾</span><h3>{lang==="zh"?"输入保存密码":"Enter save password"}</h3><p>{lang==="zh"?"验证后，本次打开期间的修改将自动保存到云端。":"After verification, changes during this session will save to the shared web data."}</p><label><span>{lang==="zh"?"密码":"Password"}</span><input autoFocus type="password" value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} placeholder="••••••"/></label><div><button type="button" className="cancel-btn" onClick={()=>setPendingSave(null)}>{lang==="zh"?"取消":"Cancel"}</button><button type="submit" className="save-btn">{lang==="zh"?"验证并保存":"Verify & save"}</button></div></form></div>}
  </main>;
}

function Metric({label,value,icon,tone,note}:{label:string;value:string|number;icon:string;tone:string;note:string}){return <article className="metric-card"><span className={`metric-icon ${tone}`}>{icon}</span><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div></article>}

function Overview({tasks,lang,onStatus}:{tasks:Task[];lang:Lang;onStatus:(id:string,s:Status)=>void}){
  const phases=Array.from(new Set(tasks.map(x=>x.phase)));
  return <div className="overview-grid"><section className="panel phase-panel"><div className="panel-head"><div><small>01</small><h3>{copy[lang].phaseProgress}</h3></div><span>{phases.length}</span></div><div className="phase-list">{phases.map(p=>{const pt=tasks.filter(x=>x.phase===p),done=pt.filter(x=>x.status==="Completed").length,pct=Math.round(done/pt.length*100);return <div className="phase-row" key={p}><div><b>{shortPhase(p,lang)}</b><span>{done}/{pt.length}</span></div><div className="bar"><i style={{width:`${pct}%`}}/></div><small>{pct}%</small></div>})}</div></section><section className="panel status-panel"><div className="panel-head"><div><small>02</small><h3>{copy[lang].statusSummary}</h3></div></div><Donut tasks={tasks} lang={lang}/><div className="attention"><h4>{lang==="zh"?"近期重点":"Current focus"}</h4>{tasks.filter(x=>x.status!=="Completed").slice(0,4).map(x=><TaskMini key={x.id} task={x} lang={lang} onStatus={onStatus}/>)}</div></section></div>
}

function Donut({tasks,lang}:{tasks:Task[];lang:Lang}){const statuses=["Completed","In Progress","Delayed","Not Started"] as Status[],vals=statuses.map(s=>tasks.filter(x=>x.status===s).length);const total=Math.max(tasks.length,1),a=vals[0]/total*360,b=(vals[0]+vals[1])/total*360,c=(vals[0]+vals[1]+vals[2])/total*360;return <div className="donut-wrap"><div className="donut" style={{background:`conic-gradient(#1f9d72 0 ${a}deg,#d88a24 ${a}deg ${b}deg,#df5a61 ${b}deg ${c}deg,#8b92a1 ${c}deg 360deg)`}}><span><b>{tasks.length}</b><small>{copy[lang].total}</small></span></div><div className="legend">{statuses.map((s,i)=><div key={s}><i style={{background:statusMeta[s].color}}/><span>{lang==="zh"?statusMeta[s].zh:statusMeta[s].en}</span><b>{vals[i]}</b></div>)}</div></div>}

function StatusSelect({task,onStatus,lang}:{task:Task;onStatus:(id:string,s:Status)=>void;lang:Lang}){return <select className={`status-select ${task.status.replace(/ /g,"-").toLowerCase()}`} value={task.status} onChange={e=>onStatus(task.id,e.target.value as Status)}>{(["Completed","In Progress","Delayed","Not Started"] as Status[]).map(s=><option key={s} value={s}>{lang==="zh"?statusMeta[s].zh:statusMeta[s].en}</option>)}</select>}

function TaskMini({task,lang,onStatus}:{task:Task;lang:Lang;onStatus:(id:string,s:Status)=>void}){return <div className="task-mini"><span className="task-id">{task.id}</span><div><b>{lang==="zh"?task.nameZh:task.nameEn}</b><small>{task.owner}</small></div><StatusSelect task={task} onStatus={onStatus} lang={lang}/></div>}

function Board({tasks,lang,onStatus}:{tasks:Task[];lang:Lang;onStatus:(id:string,s:Status)=>void}){return <div className="board">{(["Not Started","In Progress","Completed","Delayed"] as Status[]).map(s=>{const group=tasks.filter(x=>x.status===s);return <section className="board-col" key={s}><header><span style={{background:statusMeta[s].color}}/><h3>{lang==="zh"?statusMeta[s].zh:statusMeta[s].en}</h3><b>{group.length}</b></header><div>{group.length?group.map(x=><article className="kanban-card" key={x.id}><div><span>{x.id}</span><StatusSelect task={x} onStatus={onStatus} lang={lang}/></div><h4>{lang==="zh"?x.nameZh:x.nameEn}</h4><p>{shortPhase(x.phase,lang)}</p><footer><span>♙ {x.owner}</span><span>◷ {dateLabel(x.plannedEnd,lang)}</span></footer></article>):<p className="empty">{copy[lang].noTasks}</p>}</div></section>})}</div>}

function Gantt({tasks,lang,onStatus}:{tasks:Task[];lang:Lang;onStatus:(id:string,s:Status)=>void}){const months=lang==="zh"?["6月","7月","8月"]:["JUN","JUL","AUG"];return <section className="panel gantt-panel"><div className="gantt-head"><div>{copy[lang].list}</div><div className="months"><span style={{width:"32%"}}>{months[0]}</span><span style={{width:"34%"}}>{months[1]}</span><span style={{width:"34%"}}>{months[2]}</span></div></div><div className="gantt-body">{tasks.map(x=>{const start=x.plannedStart?Math.max(0,(new Date(x.plannedStart).getTime()-projectStart.getTime())/day):0;const end=x.plannedEnd?Math.min(projectDays-1,(new Date(x.plannedEnd).getTime()-projectStart.getTime())/day):start;return <div className="gantt-row" key={x.id}><div className="gantt-label"><span>{x.id}</span><b>{lang==="zh"?x.nameZh:x.nameEn}</b><StatusSelect task={x} onStatus={onStatus} lang={lang}/></div><div className="timeline"><i className={x.status.replace(" ","-").toLowerCase()} style={{left:`${start/projectDays*100}%`,width:`${Math.max(1.3,(end-start+1)/projectDays*100)}%`}}><em>{dateLabel(x.plannedStart,lang)}</em></i></div></div>})}</div></section>}

function TaskList({tasks,lang,onStatus}:{tasks:Task[];lang:Lang;onStatus:(id:string,s:Status)=>void}){return <section className="panel table-panel"><table><thead><tr><th>ID</th><th>{copy[lang].list}</th><th>{copy[lang].owner}</th><th>{copy[lang].dates}</th><th>{lang==="zh"?"状态":"Status"}</th></tr></thead><tbody>{tasks.map(x=><tr key={x.id}><td><span className="task-id">{x.id}</span></td><td><b>{lang==="zh"?x.nameZh:x.nameEn}</b><small>{shortPhase(x.phase,lang)}</small></td><td>{x.owner}</td><td>{dateLabel(x.plannedStart,lang)} — {dateLabel(x.plannedEnd,lang)}</td><td><StatusSelect task={x} onStatus={onStatus} lang={lang}/></td></tr>)}</tbody></table></section>}
