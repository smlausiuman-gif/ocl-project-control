import { getStore } from "@netlify/blobs";
import { Buffer } from "node:buffer";
import { timingSafeEqual } from "node:crypto";

const jsonHeaders = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: jsonHeaders });
const store = () => getStore({ name: "daily-report-reply-hub", consistency: "strong" });
const clean = value => String(value ?? "").trim();
const bounded = value => Math.max(0, Math.min(100, Number(value) || 0));
const passwordMatches = (provided, expected) => {
  const left = Buffer.from(clean(provided));
  const right = Buffer.from(clean(expected));
  return left.length === right.length && left.length > 0 && timingSafeEqual(left, right);
};

function seedReports() {
  const now = new Date();
  const day = offset => { const d = new Date(now); d.setDate(d.getDate() - offset); return d.toISOString().slice(0, 10); };
  const time = hours => new Date(now.getTime() - hours * 3600000).toISOString();
  return [
    { id:"rpt-001",reportNumber:"DR-DEMO-001",reportDate:day(0),projectName:"OCL Automated Conveyor Installation",supplier:"Lanka MEP Solutions",activity:"Cable tray installation — Zone B",location:"Production Building / L2",plannedProgress:68,actualProgress:62,summary:"Installed 42 m of cable tray and completed six support brackets. Toolbox talk and permit checks completed.",issues:"Access at grid B7 was restricted by civil scaffolding.",supportNeeded:"Coordinate a two-hour access window tomorrow morning.",workforce:18,weather:"Cloudy",submittedBy:"N. Perera",submittedAt:time(5),attachmentKey:null,attachmentName:null,reply:null },
    { id:"rpt-002",reportNumber:"DR-DEMO-002",reportDate:day(1),projectName:"OCL Automated Conveyor Installation",supplier:"SinoTech Engineering",activity:"Conveyor alignment and levelling",location:"Packing Hall / Line 3",plannedProgress:81,actualProgress:78,summary:"Aligned conveyor sections C12–C18. Final levelling remains pending survey benchmark confirmation.",issues:"Benchmark confirmation is pending and may affect final acceptance.",supportNeeded:"Survey team support required before 10:00.",workforce:12,weather:"Clear",submittedBy:"Zhang Wei",submittedAt:time(27),attachmentKey:null,attachmentName:null,reply:{ acknowledged:true,progress:"Actual progress is 78% versus 81% planned. The 3% variance is recoverable within two shifts.",risks:"Benchmark delay is a quality risk; no safety impact identified.",action:"Survey team booked for 09:00. Supplier to issue readings by 14:00.",recovery:"Recover the planned position within two shifts and track at the morning meeting.",support:"E&M survey support is confirmed.",repliedBy:"Meng J.",repliedRole:"E&M Manager",repliedAt:time(20) } },
    { id:"rpt-003",reportNumber:"DR-DEMO-003",reportDate:day(2),projectName:"OCL Automated Conveyor Installation",supplier:"PowerLink Systems",activity:"MCC termination and testing",location:"Electrical Room ER-02",plannedProgress:54,actualProgress:54,summary:"Completed termination for MCC-02 feeders and insulation-resistance testing.",issues:"No material issue. Permit renewal required for tomorrow.",supportNeeded:"E&M approval of tomorrow's isolation window.",workforce:9,weather:"Indoor",submittedBy:"K. Silva",submittedAt:time(50),attachmentKey:null,attachmentName:null,reply:{ acknowledged:true,progress:"Actual progress is 54%, fully aligned with the approved plan.",risks:"No current programme impact. Maintain LOTO controls during testing.",action:"Isolation request reviewed and included in tomorrow's permit schedule.",recovery:"No recovery plan required.",support:"E&M will confirm the isolation permit before 08:00.",repliedBy:"A. Fernando",repliedRole:"Senior E&M Engineer",repliedAt:time(44) } },
    { id:"rpt-004",reportNumber:"DR-DEMO-004",reportDate:day(3),projectName:"OCL Automated Conveyor Installation",supplier:"Lanka MEP Solutions",activity:"Compressed-air header installation",location:"Utility Corridor / South",plannedProgress:44,actualProgress:36,summary:"Installed header up to grid S14. Work stopped after a missing reducer was identified.",issues:"DN80 to DN50 reducer not delivered; eight percentage-point delay.",supportNeeded:"Procurement escalation and delivery confirmation required.",workforce:14,weather:"Rain",submittedBy:"N. Perera",submittedAt:time(76),attachmentKey:null,attachmentName:null,reply:null }
  ];
}

async function readReports(blobStore) {
  const value = await blobStore.get("reports");
  if (value) return JSON.parse(value);
  const seeded = seedReports();
  await blobStore.set("reports", JSON.stringify(seeded), { metadata: { schema: "1" } });
  return seeded;
}

async function writeReports(blobStore, reports) {
  await blobStore.set("reports", JSON.stringify(reports), { metadata: { schema: "1", updatedAt: new Date().toISOString() } });
}

function withStatus(report) {
  const ageHours = (Date.now() - new Date(report.submittedAt).getTime()) / 3600000;
  return { ...report, status: report.reply ? "replied" : ageHours > 36 ? "overdue" : "pending" };
}

async function serveFile(blobStore, key) {
  const entry = await blobStore.getWithMetadata(key);
  if (!entry) return new Response("File not found", { status: 404 });
  const metadata = entry.metadata || {};
  const bytes = Buffer.from(String(entry.data), "base64");
  return new Response(bytes, { headers: {
    "content-type": metadata.contentType || "application/octet-stream",
    "content-disposition": `inline; filename="${String(metadata.filename || "attachment").replaceAll('"', "")}"`,
    "cache-control": "private, max-age=3600"
  }});
}

export default async request => {
  try {
    const blobStore = store();
    const url = new URL(request.url);
    const fileKey = url.searchParams.get("file");
    if (request.method === "GET" && fileKey) return serveFile(blobStore, fileKey);

    if (request.method === "GET") {
      const reports = await readReports(blobStore);
      return reply({ reports: reports.map(withStatus).sort((a,b) => b.reportDate.localeCompare(a.reportDate) || b.submittedAt.localeCompare(a.submittedAt)) });
    }

    if (request.method === "POST") {
      const body = await request.json();
      const required = ["reportDate","projectName","supplier","activity","location","summary","submittedBy"];
      if (required.some(key => !clean(body[key]))) return reply({ error: "Missing required report fields." }, 400);
      const reports = await readReports(blobStore);
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      let attachmentKey = null, attachmentName = null;
      if (body.attachment?.data) {
        if (String(body.attachment.data).length > 5_700_000) return reply({ error: "Attachment is too large." }, 413);
        attachmentKey = `file-${id}`;
        attachmentName = clean(body.attachment.name) || "attachment";
        await blobStore.set(attachmentKey, String(body.attachment.data), { metadata: { filename: attachmentName, contentType: clean(body.attachment.type) || "application/octet-stream" } });
      }
      const report = {
        id, reportNumber:`DR-${clean(body.reportDate).replaceAll("-","")}-${String(reports.length + 1).padStart(2,"0")}`,
        reportDate:clean(body.reportDate),projectName:clean(body.projectName),supplier:clean(body.supplier),activity:clean(body.activity),location:clean(body.location),
        plannedProgress:bounded(body.plannedProgress),actualProgress:bounded(body.actualProgress),summary:clean(body.summary),issues:clean(body.issues),supportNeeded:clean(body.supportNeeded),
        workforce:Math.max(0,Number(body.workforce)||0),weather:clean(body.weather)||"Clear",submittedBy:clean(body.submittedBy),submittedAt:now,attachmentKey,attachmentName,reply:null
      };
      reports.unshift(report); await writeReports(blobStore,reports); return reply({ report:withStatus(report) },201);
    }

    if (request.method === "PUT") {
      const body = await request.json();
      const required = ["id","progress","risks","action","recovery","support","repliedBy","repliedRole"];
      if (required.some(key => !clean(body[key]))) return reply({ error: "Complete all six written reply fields." },400);
      const reports = await readReports(blobStore); const index = reports.findIndex(item => item.id === clean(body.id));
      if (index < 0) return reply({ error:"Report not found." },404);
      reports[index].reply = { acknowledged:true,progress:clean(body.progress),risks:clean(body.risks),action:clean(body.action),recovery:clean(body.recovery),support:clean(body.support),repliedBy:clean(body.repliedBy),repliedRole:clean(body.repliedRole),repliedAt:new Date().toISOString() };
      await writeReports(blobStore,reports); return reply({ report:withStatus(reports[index]) });
    }

    if (request.method === "DELETE") {
      const body = await request.json();
      const adminPassword = clean(process.env.EM_ADMIN_PASSWORD);
      if (!adminPassword) return reply({ error:"Administrator password is not configured." },503);
      if (!passwordMatches(body.password, adminPassword)) return reply({ error:"Incorrect administrator password." },401);
      const reports = await readReports(blobStore); const index = reports.findIndex(item => item.id === clean(body.id));
      if (index < 0) return reply({ error:"Report not found." },404);
      if (clean(body.action) === "deleteReport") {
        const [deletedReport] = reports.splice(index,1);
        await writeReports(blobStore,reports);
        try {
          if (deletedReport.attachmentKey) await blobStore.delete(deletedReport.attachmentKey);
          const archiveValue = await blobStore.get("deleted-reports");
          if (archiveValue) {
            const remainingArchive = JSON.parse(archiveValue).filter(item => item.id !== deletedReport.id);
            if (remainingArchive.length) await blobStore.set("deleted-reports",JSON.stringify(remainingArchive),{ metadata:{ schema:"1",updatedAt:new Date().toISOString() } });
            else await blobStore.delete("deleted-reports");
          }
        } catch (cleanupError) {
          console.error("report cleanup error",cleanupError);
        }
        return reply({ deletedId:deletedReport.id,reportNumber:deletedReport.reportNumber });
      }
      if (!reports[index].reply) return reply({ error:"This report is not completed." },409);
      reports[index].replyHistory = [...(reports[index].replyHistory || []), { ...reports[index].reply, cancelledAt:new Date().toISOString() }];
      reports[index].reply = null; reports[index].reopenedAt = new Date().toISOString();
      await writeReports(blobStore,reports); return reply({ report:withStatus(reports[index]) });
    }

    return reply({ error:"Method not allowed." },405);
  } catch (error) {
    console.error("daily-report function error", error);
    return reply({ error:"The shared report service is temporarily unavailable." },500);
  }
};
