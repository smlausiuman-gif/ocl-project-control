import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  phase: text("phase").notNull(),
  taskNo: text("task_no").notNull(),
  nameZh: text("name_zh").notNull(),
  nameEn: text("name_en").notNull(),
  owner: text("owner").notNull(),
  status: text("status").notNull(),
  plannedStart: text("planned_start"),
  plannedEnd: text("planned_end"),
  actualStart: text("actual_start"),
  actualEnd: text("actual_end"),
  updatedAt: integer("updated_at",{mode:"timestamp"}).notNull(),
});
