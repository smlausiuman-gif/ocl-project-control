import { env } from "cloudflare:workers";

type Row = [string,string,string,string,string,string,string,string|null,string|null,string|null,string|null];
const P = {
  kick:"项目启动与准备 Kick-off",
  platform:"设备安装 Equipment Install · 平台建设 Platform Construction",
  area:"设备安装 Equipment Install · 平台区域 Platform area system",
  w1:"设备安装 Equipment Install · 车间1#管线 Workshop No. 1 Pipeline System",
  w23:"设备安装 Equipment Install · 车间2、3#管线系统 Workshop No. 2&3 Pipeline System",
  test2:"调试阶段 Config · 2#设备单机测试 Stand-alone test of No. 2 equipment",
  w4:"设备安装 Equipment Install · 车间4#管线系统 Workshop No. 4 Pipeline System",
  w5:"设备安装 Equipment Install · 车间5#管线系统 Workshop No. 5 Pipeline System",
  test1:"调试阶段 Config · 1#设备单机测试 Stand-alone test of No. 1 equipment",
  network:"系统组网阶段 System Networking",
  config:"调试阶段 Config · 设备组网调试 Equipment networking test",
  uat:"培训与验收阶段 Training and UAT",
  online:"正式运行 Online",
};
const seed:Row[]=[
 ["T008",P.kick,"1","确认各模块负责人","Confirm the person in charge of each module","E&M + User + IT","Completed","2026-06-11","2026-06-11","2026-06-11","2026-06-11"],
 ["T010",P.kick,"2","沟通各模块总体施工方案","Communicate the project implementation plan and schedule","E&M + User + IT","Completed","2026-06-11","2026-06-12","2026-06-11","2026-06-12"],
 ["T012",P.kick,"3","制定详细施工计划","Formulate a detailed construction plan","E&M + User + IT","Completed","2026-06-12","2026-06-13","2026-06-12","2026-06-13"],
 ["T015",P.platform,"1","平台主体搭建","Platform main body construction","E&M + User","Completed","2026-06-02","2026-06-11","2026-06-02","2026-06-11"],
 ["T017",P.platform,"2","PE储罐锥底安装","PE tank conical bottom installation","E&M + User","Completed","2026-06-07","2026-06-14","2026-06-07","2026-06-17"],
 ["T019",P.platform,"3","PE储罐安置","PE tank placement","E&M + User","Completed","2026-06-11","2026-06-14","2026-06-17","2026-06-17"],
 ["T021",P.platform,"4","设备定位","Equipment positioning","E&M + User","Completed","2026-06-15","2026-06-15","2026-06-17","2026-06-18"],
 ["T024",P.area,"1","上料管道完成安装","Installation of feeding pipe to PE tank","Contractor + E&M + User","In Progress","2026-06-19","2026-07-15","2026-06-19",null],
 ["T026",P.area,"2","落料管道完成安装","Installation of pipe from PE tank and distributor","Contractor + E&M + User","In Progress","2026-06-19","2026-07-15","2026-06-19",null],
 ["T028",P.area,"3","开稀桶及清水桶管道完成安装","Installation of mixing tank and water tank pipe","Contractor + E&M + User","In Progress","2026-07-16","2026-07-18",null,null],
 ["T030",P.area,"4","入水、压缩气、排污管道完成安装","Water, compressed air and drain pipe installation","Contractor + E&M + User","In Progress","2026-07-16","2026-07-18",null,null],
 ["T032",P.area,"5","助剂桶液位检测电箱安装及电气线路铺设","Level detection box installation and electrical wiring","Contractor + E&M + User","In Progress","2026-07-12","2026-07-15",null,null],
 ["T034",P.area,"6","平台区域电源线铺设","Power cable routing in the platform area","Contractor + E&M + User","In Progress","2026-07-06","2026-07-11",null,null],
 ["T036",P.area,"7","开稀桶电柜安装及电气线路铺设","Thinning tank cabinet installation and wiring","Contractor + E&M + User","In Progress","2026-07-17","2026-07-18",null,null],
 ["T038",P.area,"8","开稀桶系统调试","Thinning tank system commissioning","Contractor + E&M + User","In Progress","2026-07-19","2026-07-19",null,null],
 ["T040",P.area,"9","主设备初步调试","Main equipment initial commissioning","Contractor + E&M + User","In Progress","2026-07-20","2026-07-20",null,null],
 ["T043",P.w1,"1","车间1#管线铺设","No. 1 workshop pipeline installation","Contractor + E&M + User","In Progress","2026-06-19","2026-06-25","2026-06-19","2026-06-25"],
 ["T045",P.w1,"2","14-17料桶改造","Modification for tanks 14 to 17","Contractor + E&M + User","In Progress","2026-07-16","2026-07-17",null,null],
 ["T047",P.w1,"3","1#管线电气线路铺设","Electrical wiring for No. 1 pipeline","Contractor + E&M + User","In Progress","2026-07-13","2026-07-14",null,null],
 ["T049",P.w1,"4","14-17料桶电箱及电气线路铺设","Electrical boxes and wiring for tanks 14 to 17","Contractor + E&M + User","In Progress","2026-07-17","2026-07-18",null,null],
 ["T051",P.w1,"5","1#管线初步调试","Initial commissioning of No. 1 pipeline","Contractor + E&M + User","In Progress","2026-07-19","2026-07-19",null,null],
 ["T054",P.w23,"1","车间2、3#管线铺设","No. 2 and 3 workshop pipeline installation","Contractor + E&M + User","In Progress","2026-06-19","2026-07-15","2026-06-19",null],
 ["T056",P.w23,"2","4-9料桶改造","Modification for tanks 4 to 9","Contractor + E&M + User","In Progress","2026-07-18","2026-07-19",null,null],
 ["T058",P.w23,"3","24-27料桶改造","Modification for tanks 24 to 27","Contractor + E&M + User","In Progress","2026-07-20","2026-07-21",null,null],
 ["T060",P.w23,"4","2、3#管线电气线路铺设","Electrical wiring for No. 2 and 3 pipelines","Contractor + E&M + User","In Progress","2026-07-22","2026-07-24",null,null],
 ["T062",P.w23,"5","4-9料桶电箱及电气线路铺设","Electrical boxes and wiring for tanks 4 to 9","Contractor + E&M + User","In Progress","2026-07-22","2026-07-24",null,null],
 ["T064",P.w23,"6","24-27料桶电箱及电气线路铺设","Electrical boxes and wiring for tanks 24 to 27","Contractor + E&M + User","In Progress","2026-07-22","2026-07-24",null,null],
 ["T066",P.w23,"7","2、3#管线初步调试","Initial commissioning of No. 2 and 3 pipelines","Contractor + E&M + User","In Progress","2026-07-25","2026-07-25",null,null],
 ["T069",P.test2,"1","2#设备与1、2、3#管线联测","Integrated test of No. 2 equipment and pipelines 1, 2 and 3","Contractor + E&M + User","In Progress","2026-07-26","2026-07-27",null,null],
 ["T072",P.w4,"1","车间4#管线铺设","No. 4 workshop pipeline installation","Contractor + E&M + User","In Progress","2026-07-16","2026-07-21",null,null],
 ["T074",P.w4,"2","18-21料桶改造","Modification for tanks 18 to 21","Contractor + E&M + User","In Progress","2026-07-22","2026-07-23",null,null],
 ["T076",P.w4,"3","4#管线电气线路铺设","Electrical wiring for No. 4 pipeline","Contractor + E&M + User","In Progress","2026-07-24","2026-07-25",null,null],
 ["T078",P.w4,"4","18-21料桶电箱及电气线路铺设","Electrical boxes and wiring for tanks 18 to 21","Contractor + E&M + User","In Progress","2026-07-24","2026-07-25",null,null],
 ["T080",P.w4,"5","4#管线初步调试","Initial commissioning of No. 4 pipeline","Contractor + E&M + User","In Progress","2026-07-26","2026-07-26",null,null],
 ["T083",P.w5,"1","车间5#管线铺设","No. 5 workshop pipeline installation","Contractor + E&M + User","In Progress","2026-07-21","2026-08-05",null,null],
 ["T085",P.w5,"2","10-13料桶改造","Modification for tanks 10 to 13","Contractor + E&M + User","In Progress","2026-08-06","2026-08-07",null,null],
 ["T087",P.w5,"3","1-3料桶改造","Modification for tanks 1 to 3","Contractor + E&M + User","In Progress","2026-08-08","2026-08-09",null,null],
 ["T089",P.w5,"4","10-13料桶电箱及电气线路铺设","Electrical boxes and wiring for tanks 10 to 13","Contractor + E&M + User","In Progress","2026-08-10","2026-08-12",null,null],
 ["T091",P.w5,"5","1-3料桶电箱及电气线路铺设","Electrical boxes and wiring for tanks 1 to 3","Contractor + E&M + User","In Progress","2026-08-10","2026-08-12",null,null],
 ["T093",P.w5,"6","5#管线电气线路铺设","Electrical wiring for No. 5 pipeline","Contractor + E&M + User","In Progress","2026-08-10","2026-08-12",null,null],
 ["T095",P.w5,"7","5#管线初步调试","Initial commissioning of No. 5 pipeline","Contractor + E&M + User","In Progress","2026-08-13","2026-08-13",null,null],
 ["T098",P.test1,"1","1#设备与4、5#管线联测","Integrated test of No. 1 equipment and pipelines 4 and 5","Contractor + E&M + User","In Progress","2026-08-14","2026-08-15",null,null],
 ["T101",P.network,"1","主机网线铺设","Network cabling for terminals and main system units","E&M + User + Production","In Progress","2026-08-13","2026-08-16",null,null],
 ["T103",P.network,"2","送料配送程序预装","Pre-installation of material distribution program","E&M + User + Production","In Progress","2026-08-16","2026-08-16",null,null],
 ["T105",P.network,"3","组网通讯测试","Communication network testing","E&M + User + Production","In Progress","2026-08-16","2026-08-16",null,null],
 ["T108",P.config,"1","主任务输送测试","Main task distribution test","User + E&M + Production","In Progress","2026-08-17","2026-08-19",null,null],
 ["T110",P.config,"2","模拟任务配送测试","Simulated task distribution test","User + E&M + Production","In Progress","2026-08-17","2026-08-19",null,null],
 ["T112",P.config,"3","正式任务运行测试","Formal task operation test","User + E&M + Production","In Progress","2026-08-17","2026-08-19",null,null],
 ["T115",P.uat,"1","操作培训","Operator training","All Departments","In Progress","2026-08-20","2026-08-20",null,null],
 ["T117",P.uat,"2","陪产","Production stand-by support","All Departments","In Progress","2026-08-21","2026-08-30",null,null],
 ["T119",P.uat,"3","项目资料交接","Project document handover","All Departments","In Progress","2026-08-30","2026-08-30",null,null],
 ["T122",P.online,"1","正式运行","Formal running","Project Team + User","In Progress","2026-08-30",null,null,null],
];

async function ready(){
  const db=env.DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, phase TEXT NOT NULL, task_no TEXT NOT NULL, name_zh TEXT NOT NULL, name_en TEXT NOT NULL, owner TEXT NOT NULL, status TEXT NOT NULL, planned_start TEXT, planned_end TEXT, actual_start TEXT, actual_end TEXT, updated_at INTEGER NOT NULL)`).run();
  const count=await db.prepare("SELECT COUNT(*) AS count FROM tasks").first<{count:number}>();
  if(Number(count?.count||0)===0){
    await db.batch(seed.map(r=>{ const values=[...r]; if(values[6]==="In Progress"&&!values[9]) values[6]="Not Started"; return db.prepare("INSERT INTO tasks (id,phase,task_no,name_zh,name_en,owner,status,planned_start,planned_end,actual_start,actual_end,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").bind(...values,Date.now()); }));
  }
}

export async function GET(){
  await ready();
  const result=await env.DB.prepare("SELECT id,phase,task_no AS taskNo,name_zh AS nameZh,name_en AS nameEn,owner,status,planned_start AS plannedStart,planned_end AS plannedEnd,actual_start AS actualStart,actual_end AS actualEnd FROM tasks ORDER BY CAST(SUBSTR(id,2) AS INTEGER)").all();
  return Response.json({tasks:result.results});
}

export async function PATCH(request:Request){
  await ready();
  const expected=(env as unknown as {OCL_SAVE_PASSWORD?:string}).OCL_SAVE_PASSWORD;
  const supplied=request.headers.get("x-save-password");
  if(!expected||supplied!==expected) return Response.json({error:"Unauthorized"},{status:401});
  const {id,status}=await request.json() as {id?:string;status?:string};
  if(!id||!["Completed","In Progress","Delayed","Not Started"].includes(status||"")) return Response.json({error:"Invalid update"},{status:400});
  await env.DB.prepare("UPDATE tasks SET status=?,updated_at=? WHERE id=?").bind(status,Date.now(),id).run();
  return Response.json({ok:true});
}
