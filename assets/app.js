const API = "/api/reports";
const state = { reports: [], lang: localStorage.getItem("drh-lang") || "en", filter: "all", query: "", activeReport: null, selectedFile: null };

const messages = {
  en: { app:"Daily Report Reply Hub",tagline:"Supplier → E&M reply → traceable record",dashboard:"Dashboard",records:"Records",submit:"Upload report",desk:"E&M Reply Desk",boardTitle:"Daily report control board",boardSub:"Every report receives a written response, clear ownership and a permanent project record.",pending:"Awaiting E&M",overdue:"Overdue",replied:"Replied",within24:"Reply within 24 hours",priority:"Priority escalation required",written:"Written project records",rate:"Response rate",allReports:"Across all daily reports",flow:"Closed-loop workflow",documented:"Documented",traceable:"Traceable",bilingual:"Bilingual",supplierSubmitted:"Supplier submitted",reviewed:"E&M reviewed",actionRecorded:"Action recorded",closed:"Closed & traceable",kanban:"Daily report Kanban",kanbanSub:"Supplier submissions and E&M response status",allRecords:"All records",search:"Search report, supplier or activity…",all:"All",reportNo:"Report",date:"Date",supplier:"Supplier",activity:"Activity",progress:"Progress",status:"Status",supplierReport:"Supplier daily report",supplierHelp:"Submit once. E&M replies in the same record.",project:"Project",location:"Location",submittedBy:"Submitted by",workforce:"Workforce",weather:"Weather",planned:"Planned",actual:"Actual",summary:"Daily work summary",issues:"Problems, risks and impact",support:"Support requested from E&M",attachment:"Click to select report / photo (optional, max 4 MB)",selectedFile:"Selected",cancel:"Cancel",submitReport:"Submit daily report",replyTitle:"E&M written reply",sixRequired:"Complete all six written response points.",point1:"1. Receipt & review confirmation",ackText:"Report received and reviewed.",point2:"2. Actual vs planned progress",point3:"3. Issues, risks & impact",point4:"4. Action / corrective action",point5:"5. Delay & recovery plan / ETA",point6:"6. Support required",smart:"Create easy draft",replyBy:"Reply by",role:"Position / role",saveReply:"Save written reply",core:"Documented · Traceable · Verifiable",open:"Open",replyNow:"Reply now",undoComplete:"Undo completion",undoTitle:"Undo completed reply",undoHelp:"Enter the E&M administrator password to return this report to the reply queue.",password:"Administrator password",confirmUndo:"Confirm undo",undoSaved:"Completion cancelled. Report returned to the E&M reply queue.",deleteReport:"Delete",deleteTitle:"Permanently delete report",deleteHelp:"Enter the E&M administrator password to permanently delete this report, its reply history and attachment. This cannot be undone.",confirmDelete:"Permanently delete",deleteSaved:"Report permanently deleted.",invalidPassword:"Incorrect administrator password.",passwordNotConfigured:"Administrator password is not configured in Netlify.",reportSaved:"Supplier report submitted. E&M queue updated.",replySaved:"Written reply saved to the project record.",loadError:"Shared records could not be loaded. Please deploy through Netlify Git or CLI so Functions are included.",fileLarge:"Attachment must be 4 MB or smaller.",workSummary:"Work summary",recordedReply:"Recorded E&M reply",noIssue:"No issue reported",loading:"Loading shared records…" },
  cn: { app:"施工日报回复看板",tagline:"供应商提交 → 工程部回复 → 留痕可追溯",dashboard:"看板",records:"全部记录",submit:"上传施工日报",desk:"工程部回复台",boardTitle:"施工日报闭环管理看板",boardSub:"每份日报必须书面回复、责任明确并形成永久项目记录。",pending:"待工程部回复",overdue:"逾期未回复",replied:"已回复",within24:"须在24小时内回复",priority:"需优先升级处理",written:"书面项目记录",rate:"回复完成率",allReports:"全部施工日报",flow:"项目闭环流程",documented:"有记录",traceable:"可追踪",bilingual:"中英双语",supplierSubmitted:"供应商已提交",reviewed:"工程部已审阅",actionRecorded:"措施已记录",closed:"已闭环可追溯",kanban:"施工日报看板",kanbanSub:"供应商提交及工程部回复状态",allRecords:"全部记录",search:"搜索报告、供应商或施工内容…",all:"全部",reportNo:"报告编号",date:"日期",supplier:"供应商",activity:"施工内容",progress:"进度",status:"状态",supplierReport:"供应商每日施工报告",supplierHelp:"提交一次，工程部在同一记录中书面回复。",project:"项目名称",location:"施工位置",submittedBy:"提交人",workforce:"施工人数",weather:"天气",planned:"计划",actual:"实际",summary:"当日施工总结",issues:"问题、风险及影响",support:"需工程部支持事项",attachment:"點擊選擇日報 / 照片（可選，最大4MB）",selectedFile:"已選擇",cancel:"取消",submitReport:"提交施工日报",replyTitle:"工程部书面回复",sixRequired:"必须完成六点书面回复。",point1:"1. 收到并完成审阅确认",ackText:"确认已收到并完成审阅施工日报。",point2:"2. 实际进度与计划对比",point3:"3. 问题、风险及影响",point4:"4. 已采取或计划采取的行动",point5:"5. 延期及恢复计划 / ETA",point6:"6. 需支持事项",smart:"一键生成回复草稿",replyBy:"回复人",role:"职务 / 岗位",saveReply:"保存书面回复",core:"有记录 · 可追踪 · 可验证",open:"打开",replyNow:"立即回复",undoComplete:"取消完成",undoTitle:"取消已完成回复",undoHelp:"请输入工程部管理员密码，将本报告退回待回复队列。",password:"管理员密码",confirmUndo:"确认取消完成",undoSaved:"已取消完成，报告已退回工程部回复队列。",deleteReport:"删除",deleteTitle:"永久删除报告",deleteHelp:"请输入工程部管理员密码，永久删除此报告、回复历史及附件。删除后无法恢复。",confirmDelete:"永久删除",deleteSaved:"报告已永久删除。",invalidPassword:"管理员密码不正确。",passwordNotConfigured:"Netlify尚未设置管理员密码。",reportSaved:"供应商日报已提交，工程部回复队列已更新。",replySaved:"书面回复已保存至项目记录。",loadError:"无法加载共享记录。请通过Netlify Git或CLI部署，以确保Functions正常发布。",fileLarge:"附件不得超过4MB。",workSummary:"施工内容",recordedReply:"工程部已留痕回复",noIssue:"未报告问题",loading:"正在加载共享记录…" }
};
const t = key => messages[state.lang][key] || key;
const esc = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const fmt = value => new Intl.DateTimeFormat(state.lang === "cn" ? "zh-CN" : "en-GB", {year:"numeric",month:"short",day:"numeric"}).format(new Date(value));
const statusLabel = status => t(status);

function toast(message, error = false){ const el=document.querySelector("#toast"); el.textContent=message; el.className=`toast show${error?" error":""}`; clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.className="toast",3500); }
function setBusy(form,busy){ form.querySelectorAll("button,input,textarea,select").forEach(el=>el.disabled=busy); }

async function request(options={}){
  const response=await fetch(API,{headers:{"content-type":"application/json"},...options});
  const data=await response.json().catch(()=>({}));
  if(!response.ok){const error=new Error(data.error||`Request failed (${response.status})`);error.status=response.status;throw error;}
  return data;
}

async function load(){
  document.querySelector("#kanban").innerHTML=`<div class="loading">${t("loading")}</div>`;
  try{ const data=await request(); state.reports=data.reports||[]; render(); }
  catch(error){ state.reports=[]; render(); toast(t("loadError"),true); }
}

function render(){
  document.documentElement.lang=state.lang==="cn"?"zh-CN":"en";
  document.querySelectorAll("[data-i18n]").forEach(el=>el.textContent=t(el.dataset.i18n));
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));
  document.querySelectorAll("[data-lang]").forEach(el=>el.classList.toggle("active",el.dataset.lang===state.lang));
  renderSelectedFile();
  const replied=state.reports.filter(r=>r.status==="replied").length;
  const pending=state.reports.filter(r=>r.status==="pending").length;
  const overdue=state.reports.filter(r=>r.status==="overdue").length;
  document.querySelector("#metric-pending").textContent=pending;
  document.querySelector("#metric-overdue").textContent=overdue;
  document.querySelector("#metric-replied").textContent=replied;
  document.querySelector("#metric-rate").textContent=state.reports.length?`${Math.round(replied/state.reports.length*100)}%`:"0%";
  ["total","reviewed","actions","closed"].forEach((key,index)=>document.querySelector(`#flow-${key}`).textContent=`${index?replied:state.reports.length} ${state.lang==="cn"?"条记录":"reports"}`);
  renderKanban(); renderRecords();
}

function reportCard(r){ return `<button class="kanban-card ${r.status}" data-open="${esc(r.id)}"><span><small>${esc(r.reportNumber)}</small><em>${statusLabel(r.status)}</em></span><strong>${esc(r.activity)}</strong><small>${esc(r.supplier)} · ${esc(r.location)}</small><progress max="100" value="${Number(r.actualProgress)||0}"></progress></button>`; }
function renderKanban(){
  const columns=["pending","overdue","replied"];
  document.querySelector("#kanban").innerHTML=columns.map(status=>{const list=state.reports.filter(r=>r.status===status);return `<section class="kanban-col"><header><b>${statusLabel(status)}</b><span>${list.length}</span></header>${list.length?list.slice(0,5).map(reportCard).join(""):`<div class="loading">—</div>`}</section>`}).join("");
}
function renderRecords(){
  const q=state.query.toLowerCase();
  const list=state.reports.filter(r=>(state.filter==="all"||r.status===state.filter)&&`${r.reportNumber} ${r.supplier} ${r.activity} ${r.projectName}`.toLowerCase().includes(q));
  document.querySelector("#records-body").innerHTML=list.length?list.map(r=>`<tr><td><strong>${esc(r.reportNumber)}</strong><small>${esc(r.projectName)}</small></td><td>${fmt(r.reportDate)}</td><td>${esc(r.supplier)}</td><td><strong>${esc(r.activity)}</strong><small>${esc(r.location)}</small></td><td>${r.actualProgress}% / ${r.plannedProgress}%</td><td><span class="status ${r.status}">${statusLabel(r.status)}</span></td><td><div class="row-actions"><button class="row-open" data-open="${esc(r.id)}">${t("open")} →</button>${r.status==="replied"?`<button class="row-undo" data-undo="${esc(r.id)}" aria-label="${t("undoComplete")} ${esc(r.reportNumber)}">${t("undoComplete")}</button>`:""}<button class="row-delete" data-delete="${esc(r.id)}" aria-label="${t("deleteReport")} ${esc(r.reportNumber)}">${t("deleteReport")}</button></div></td></tr>`).join(""):`<tr><td colspan="7" class="loading">—</td></tr>`;
}

function switchView(id){ document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id)); document.querySelectorAll(".nav-btn[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===id)); window.scrollTo({top:0,behavior:"smooth"}); }
function openSubmit(){ const form=document.querySelector("#submit-form"); form.reset(); state.selectedFile=null; renderSelectedFile(); form.reportDate.value=new Date().toISOString().slice(0,10); form.projectName.value="OCL Automated Conveyor Installation"; form.weather.value="Clear"; document.querySelector("#submit-dialog").showModal(); }

function renderSelectedFile(){
  const box=document.querySelector("#upload-box"),label=document.querySelector("#attachment-label"),help=document.querySelector("#attachment-help"),icon=document.querySelector("#upload-icon");
  if(!box||!label||!help||!icon)return;
  if(state.selectedFile){
    box.classList.add("selected"); icon.textContent="✓"; label.textContent=`${t("selectedFile")}: ${state.selectedFile.name}`;
    help.textContent=`${(state.selectedFile.size/1024/1024).toFixed(2)} MB · ${state.selectedFile.type||"HEIC / HEIF"}`;
  }else{
    box.classList.remove("selected"); icon.textContent="⇧"; label.textContent=t("attachment"); help.textContent="PDF · DOCX · XLSX · JPG · PNG · HEIC · HEIF";
  }
}

function detailHtml(r){
  const variance=Number(r.actualProgress)-Number(r.plannedProgress);
  const reply=r.reply?`<section class="reply-record"><header><h3>✓ ${t("recordedReply")}</h3><p>${esc(r.reply.repliedBy)} · ${esc(r.reply.repliedRole)} · ${fmt(r.reply.repliedAt)}</p></header>${[
    [1,t("point1"),t("ackText")],[2,t("point2"),r.reply.progress],[3,t("point3"),r.reply.risks],[4,t("point4"),r.reply.action],[5,t("point5"),r.reply.recovery],[6,t("point6"),r.reply.support]
  ].map(x=>`<div class="reply-line"><span>${x[0]}</span><b>${esc(x[1].replace(/^\d\.\s*/,""))}</b><p>${esc(x[2])}</p></div>`).join("")}</section>`:"";
  return `<article class="detail"><div class="detail-top"><div><small>${esc(r.reportNumber)}</small><span class="status ${r.status}">${statusLabel(r.status)}</span></div><h2>${esc(r.activity)}</h2><p>${esc(r.projectName)}</p></div><div class="detail-body"><div class="detail-meta"><div><small>${t("supplier")}</small><b>${esc(r.supplier)}</b></div><div><small>${t("location")}</small><b>${esc(r.location)}</b></div><div><small>${t("workforce")}</small><b>${esc(r.workforce)}</b></div><div><small>${t("date")}</small><b>${fmt(r.reportDate)}</b></div></div><div class="compare"><div><b>${t("planned")}: ${r.plannedProgress}%</b><progress max="100" value="${r.plannedProgress}"></progress></div><div><b>${t("actual")}: ${r.actualProgress}%</b><progress max="100" value="${r.actualProgress}"></progress></div><div class="variance">${variance>=0?"+":""}${variance}%</div></div><div class="narrative"><article><b>${t("workSummary")}</b><p>${esc(r.summary)}</p></article><article><b>${t("issues")}</b><p>${esc(r.issues||t("noIssue"))}</p></article><article><b>${t("support")}</b><p>${esc(r.supportNeeded||t("noIssue"))}</p></article></div><div class="detail-actions">${r.attachmentKey?`<a class="attachment-link" href="${API}?file=${encodeURIComponent(r.attachmentKey)}" target="_blank">⌕ ${esc(r.attachmentName)}</a>`:"<span></span>"}${r.status!=="replied"?`<button class="primary" data-reply="${esc(r.id)}">✎ ${t("replyNow")}</button>`:""}</div>${reply}</div><footer><div class="detail-admin-actions">${r.reply?`<button class="danger-btn undo-btn" data-undo="${esc(r.id)}">↶ ${t("undoComplete")}</button>`:""}<button class="danger-btn permanent-delete-btn" data-delete="${esc(r.id)}">✕ ${t("deleteTitle")}</button></div><button class="secondary" data-close>${t("cancel")}</button></footer></article>`;
}
function openDetail(id){ const r=state.reports.find(x=>x.id===id); if(!r)return; state.activeReport=r; const dialog=document.querySelector("#detail-dialog"); document.querySelector("#detail-content").innerHTML=detailHtml(r); dialog.showModal(); }
function openReply(id){ const r=state.reports.find(x=>x.id===id); if(!r)return; state.activeReport=r; document.querySelector("#detail-dialog").close(); const form=document.querySelector("#reply-form"); form.reset(); form.id.value=id; form.repliedRole.value="E&M Manager"; document.querySelector("#reply-dialog").showModal(); }
function openUndo(id){ const report=state.reports.find(item=>item.id===id); if(!report)return; const form=document.querySelector("#undo-form"); form.reset(); form.id.value=id; document.querySelector("#undo-report-number").textContent=report.reportNumber; const detail=document.querySelector("#detail-dialog"); if(detail.open)detail.close(); document.querySelector("#undo-dialog").showModal(); setTimeout(()=>form.password.focus(),50); }
function openDelete(id){ const report=state.reports.find(item=>item.id===id); if(!report)return; const form=document.querySelector("#delete-form"); form.reset(); form.id.value=id; document.querySelector("#delete-report-number").textContent=report.reportNumber; const detail=document.querySelector("#detail-dialog"); if(detail.open)detail.close(); document.querySelector("#delete-dialog").showModal(); setTimeout(()=>form.password.focus(),50); }

async function filePayload(file){ if(!file||!file.size)return null; if(file.size>4*1024*1024)throw new Error(t("fileLarge")); const buffer=await file.arrayBuffer(); let binary=""; const bytes=new Uint8Array(buffer); for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768)); return {name:file.name,type:file.type||"application/octet-stream",data:btoa(binary)}; }

document.addEventListener("click",event=>{
  const view=event.target.closest("[data-view]"); if(view){switchView(view.dataset.view);return}
  if(event.target.closest("[data-open-submit]")){openSubmit();return}
  const close=event.target.closest("[data-close]"); if(close){close.closest("dialog")?.close();return}
  const open=event.target.closest("[data-open]"); if(open){openDetail(open.dataset.open);return}
  const reply=event.target.closest("[data-reply]"); if(reply){openReply(reply.dataset.reply);return}
  const undo=event.target.closest("[data-undo]"); if(undo){openUndo(undo.dataset.undo);return}
  const remove=event.target.closest("[data-delete]"); if(remove){openDelete(remove.dataset.delete);return}
  const lang=event.target.closest("[data-lang]"); if(lang){state.lang=lang.dataset.lang;localStorage.setItem("drh-lang",state.lang);render();return}
});
document.querySelector("#filters").addEventListener("click",event=>{const btn=event.target.closest("[data-filter]");if(!btn)return;state.filter=btn.dataset.filter;document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("active",x===btn));renderRecords()});
document.querySelector("#search").addEventListener("input",event=>{state.query=event.target.value;renderRecords()});
document.querySelector("#attachment-input").addEventListener("change",event=>{
  const file=event.target.files?.[0]||null;
  if(file&&file.size>4*1024*1024){ event.target.value=""; state.selectedFile=null; renderSelectedFile(); toast(t("fileLarge"),true); return; }
  state.selectedFile=file; renderSelectedFile();
});
document.querySelector("#upload-box").addEventListener("keydown",event=>{
  if(event.key==="Enter"||event.key===" "){ event.preventDefault(); document.querySelector("#attachment-input").click(); }
});

document.querySelector("#submit-form").addEventListener("submit",async event=>{
  event.preventDefault(); const form=event.currentTarget; const data=Object.fromEntries(new FormData(form).entries()); const attachment=form.attachment.files[0]; delete data.attachment; setBusy(form,true);
  try{ data.attachment=await filePayload(attachment); const result=await request({method:"POST",body:JSON.stringify(data)}); state.reports.unshift(result.report); form.closest("dialog").close(); render(); toast(t("reportSaved")); switchView("records"); }
  catch(error){toast(error.message,true)}finally{setBusy(form,false)}
});

document.querySelector("#smart-draft").addEventListener("click",()=>{
  const r=state.activeReport,form=document.querySelector("#reply-form"),behind=Number(r.actualProgress)<Number(r.plannedProgress),gap=Number(r.plannedProgress)-Number(r.actualProgress);
  form.progress.value=state.lang==="cn"?`实际进度${r.actualProgress}%，计划进度${r.plannedProgress}%。${behind?`偏差${gap}%，需执行恢复计划。`:"符合计划要求。"}`:`Actual progress is ${r.actualProgress}% versus ${r.plannedProgress}% planned. ${behind?`The ${gap}% variance requires recovery action.`:"Progress is aligned with the approved plan."}`;
  form.risks.value=r.issues||t("noIssue");
  form.action.value=state.lang==="cn"?"工程部已与供应商确认现场条件，安排责任人跟进纠正措施并每日更新状态。":"E&M confirmed site conditions, assigned an action owner and will track corrective action daily.";
  form.recovery.value=behind?(state.lang==="cn"?"供应商须增加资源并在下一次协调会确认预计完成时间，直至恢复计划进度。":"Supplier to add resources and confirm the recovery ETA at the next coordination meeting."):(state.lang==="cn"?"无需恢复计划，按批准计划继续执行。":"No recovery plan required; continue to the approved programme.");
  form.replySupport.value=r.supportNeeded||(state.lang==="cn"?"目前无需额外支持。":"No additional support required at present.");
});
document.querySelector("#reply-form").addEventListener("submit",async event=>{
  event.preventDefault();const form=event.currentTarget;const data=Object.fromEntries(new FormData(form).entries());data.support=data.replySupport;delete data.replySupport;setBusy(form,true);
  try{const result=await request({method:"PUT",body:JSON.stringify(data)});state.reports=state.reports.map(r=>r.id===result.report.id?result.report:r);form.closest("dialog").close();render();toast(t("replySaved"))}catch(error){toast(error.message,true)}finally{setBusy(form,false)}
});
document.querySelector("#undo-form").addEventListener("submit",async event=>{
  event.preventDefault();const form=event.currentTarget;const data=Object.fromEntries(new FormData(form).entries());setBusy(form,true);
  try{const result=await request({method:"DELETE",body:JSON.stringify(data)});state.reports=state.reports.map(r=>r.id===result.report.id?result.report:r);form.closest("dialog").close();render();toast(t("undoSaved"))}catch(error){toast(error.status===401?t("invalidPassword"):error.status===503?t("passwordNotConfigured"):error.message,true)}finally{setBusy(form,false)}
});
document.querySelector("#delete-form").addEventListener("submit",async event=>{
  event.preventDefault();const form=event.currentTarget;const data=Object.fromEntries(new FormData(form).entries());data.action="deleteReport";setBusy(form,true);
  try{const result=await request({method:"DELETE",body:JSON.stringify(data)});state.reports=state.reports.filter(r=>r.id!==result.deletedId);form.closest("dialog").close();render();switchView("records");toast(t("deleteSaved"))}catch(error){toast(error.status===401?t("invalidPassword"):error.status===503?t("passwordNotConfigured"):error.message,true)}finally{setBusy(form,false)}
});

render(); load();
