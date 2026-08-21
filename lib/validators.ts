import { z } from "zod";

export const ParseDumpReq = z.object({ raw_text: z.string().min(1).max(20000) });
export const ParseDumpRes = z.object({
  tasks: z.array(z.object({ title: z.string().min(1).max(80) })).min(1),
});

export const TriageReq = z.object({ raw_text: z.string().min(10).max(50000) });
export const TriageRes = z.object({
  items: z.array(
    z.object({
      title: z.string().max(80),
      type: z.enum(["task", "habit", "goal", "project", "avoid"]),
      bucket: z.enum(["RIGHT NOW", "TODAY", "THIS WEEK", "LATER", "OPTIONAL"]),
      reason: z.string().max(120),
    })
  ),
});

export const BreakdownReq = z.object({
  task_id: z.string().uuid(),
  title: z.string().min(1).max(120),
});
export const BreakdownRes = z.object({
  steps: z
    .array(
      z.object({
        title: z.string().max(80),
        estimated_minutes: z.number().int().min(1).max(15),
      })
    )
    .min(2)
    .max(5),
});

export const AgentReq = z.object({
  message: z.string().min(1).max(10000),
  context: z.object({ todayTitles: z.array(z.string()).max(20) }).optional(),
});
export const AgentRes = z.object({
  reply: z.string().max(2000),
  tool_calls: z
    .array(
      z.object({
        name: z.enum([
          "create_task",
          "update_task",
          "delete_task",
          "create_habit",
          "log_habit",
          "breakdown_task",
          "create_flashcard_draft",
          "create_quiz_draft",
        ]),
        args: z.record(z.string(), z.any()),
      })
    )
    .max(20),
  needs_confirmation: z.boolean(),
});

export const CreateTaskReq = z.object({
  title: z.string().min(1).max(120),
  is_today: z.boolean().default(false),
  parent_task_id: z.string().uuid().nullable().optional(),
  domain: z.string().max(30).nullable().optional(),
});
export const PatchTaskReq = z.object({
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  is_today: z.boolean().optional(),
  completed_at: z.string().nullable().optional(),
});
