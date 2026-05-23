import type { StepType, Task, TaskStep } from "../types";

let stepCounter = 0;

function nextStepId(): string {
  stepCounter += 1;
  return `step-${stepCounter}`;
}

function createStep(
  sequence: number,
  type: StepType,
  title: string,
  detail?: string,
): TaskStep {
  const now = new Date().toISOString();
  return {
    id: nextStepId(),
    sequence,
    type,
    title,
    detail,
    createdAt: now,
  };
}

function createTaskId(): string {
  return crypto.randomUUID();
}

function updateTask(tasks: Task[], id: string, patch: Partial<Task>): Task[] {
  return tasks.map((t) =>
    t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t,
  );
}

function appendStep(tasks: Task[], id: string, step: TaskStep): Task[] {
  return tasks.map((t) =>
    t.id === id ? { ...t, steps: [...t.steps, step], updatedAt: new Date().toISOString() } : t,
  );
}

export function createSeedTasks(): Task[] {
  const now = new Date().toISOString();
  return [
    {
      id: createTaskId(),
      prompt: "Summarize the benefits of unit testing",
      status: "completed",
      result:
        "Unit tests catch regressions early, document expected behavior, and make refactoring safer.",
      steps: [
        createStep(1, "status", "Task received"),
        createStep(2, "llm", "Planning", "Analyzing prompt and choosing approach"),
        createStep(3, "tool", "Running tool: search", 'Query: "unit testing benefits"'),
        createStep(4, "llm", "Generating response", "Drafting final answer"),
        createStep(5, "status", "Completed"),
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createTaskId(),
      prompt: "List three colors",
      status: "completed",
      result: "Red, green, and blue.",
      steps: [
        createStep(1, "status", "Task received"),
        createStep(2, "llm", "Generating response"),
        createStep(3, "status", "Completed"),
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function createTask(prompt: string): Task {
  const now = new Date().toISOString();
  return {
    id: createTaskId(),
    prompt,
    status: "pending",
    steps: [createStep(1, "status", "Task received")],
    createdAt: now,
    updatedAt: now,
  };
}

export type TaskUpdater = (updater: (tasks: Task[]) => Task[]) => void;

export function simulateTaskRun(
  taskId: string,
  prompt: string,
  setTasks: TaskUpdater,
): void {
  const shouldFail = prompt.toLowerCase().includes("fail");

  setTimeout(() => {
    setTasks((tasks) => updateTask(tasks, taskId, { status: "running" }));
    setTasks((tasks) =>
      appendStep(tasks, taskId, createStep(2, "status", "Processing started")),
    );
  }, 400);

  setTimeout(() => {
    setTasks((tasks) =>
      appendStep(
        tasks,
        taskId,
        createStep(3, "llm", "Planning", "Analyzing prompt and choosing approach"),
      ),
    );
  }, 900);

  setTimeout(() => {
    setTasks((tasks) =>
      appendStep(
        tasks,
        taskId,
        createStep(
          4,
          "agent_action",
          "Agent action",
          "Thought: I should use a helper tool to answer this.",
        ),
      ),
    );
  }, 1400);

  setTimeout(() => {
    setTasks((tasks) =>
      appendStep(
        tasks,
        taskId,
        createStep(5, "tool", "Running tool: word_count", `Input: "${prompt}"`),
      ),
    );
  }, 1900);

  if (shouldFail) {
    setTimeout(() => {
      setTasks((tasks) =>
        appendStep(
          tasks,
          taskId,
          createStep(6, "error", "Execution failed", "Simulated agent error"),
        ),
      );
      setTasks((tasks) =>
        updateTask(tasks, taskId, {
          status: "failed",
          error: 'Simulated failure (prompt contained "fail")',
        }),
      );
    }, 2400);
    return;
  }

  setTimeout(() => {
    setTasks((tasks) =>
      appendStep(
        tasks,
        taskId,
        createStep(6, "llm", "Generating response", "Drafting final answer"),
      ),
    );
  }, 2400);

  setTimeout(() => {
    setTasks((tasks) =>
      appendStep(tasks, taskId, createStep(7, "status", "Completed")),
    );
    setTasks((tasks) =>
      updateTask(tasks, taskId, {
        status: "completed",
        result: `Processed: ${prompt}`,
      }),
    );
  }, 2900);
}
