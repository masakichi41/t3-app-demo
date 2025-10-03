"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useMemo, type ReactNode } from "react";

export type Status = "Todo" | "InProgress" | "Done";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: Status;
  labelId?: string;
  attachmentUrl?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  taskId: string;
  body: string;
  createdAt: string;
};

export type Label = {
  id: string;
  name: string;
  color: string;
};

export interface Api {
  listTasks(params?: { q?: string; status?: Status; labelId?: string }): Promise<Task[]>;
  getTask(id: string): Promise<Task>;
  createTask(input: { title: string; description?: string; labelId?: string }): Promise<Task>;
  updateTask(
    id: string,
    input: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">> & { version: number },
  ): Promise<Task>;
  deleteTask(id: string): Promise<{ id: string }>;
  listLabels(): Promise<Label[]>;
  listComments(taskId: string): Promise<Comment[]>;
  addComment(taskId: string, input: { body: string }): Promise<Comment>;
}

const ApiCtx = createContext<Api | null>(null);

const mockId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

function createMockApi(): Api {
  let tasks: Task[] = [
    {
      id: "t1",
      title: "最初のタスク",
      description: "セットアップを確認する",
      status: "Todo",
      labelId: "l1",
      version: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "t2",
      title: "UI ラフの作成",
      status: "InProgress",
      labelId: "l2",
      version: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "t3",
      title: "QA チェック",
      status: "Done",
      labelId: "l3",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  let comments: Comment[] = [
    {
      id: "c1",
      taskId: "t2",
      body: "フォーム周りのバリデーションも確認予定です",
      createdAt: new Date().toISOString(),
    },
  ];
  const labels: Label[] = [
    { id: "l1", name: "General", color: "#64748b" },
    { id: "l2", name: "Design", color: "#fbbf24" },
    { id: "l3", name: "QA", color: "#10b981" },
  ];

  const filterTasks = (params?: { q?: string; status?: Status; labelId?: string }) => {
    const normalizedQuery = params?.q?.trim().toLowerCase() ?? "";
    return tasks.filter((task) => {
      if (normalizedQuery && !task.title.toLowerCase().includes(normalizedQuery)) {
        return false;
      }
      if (params?.status && task.status !== params.status) {
        return false;
      }
      if (params?.labelId && task.labelId !== params.labelId) {
        return false;
      }
      return true;
    });
  };

  return {
    async listTasks(params) {
      return filterTasks(params);
    },
    async getTask(id) {
      const task = tasks.find((item) => item.id === id);
      if (!task) {
        throw new Error("NotFound");
      }
      return structuredClone(task);
    },
    async createTask(input) {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: mockId(),
        title: input.title,
        description: input.description,
        labelId: input.labelId,
        status: "Todo",
        version: 0,
        createdAt: now,
        updatedAt: now,
      };
      tasks = [newTask, ...tasks];
      return structuredClone(newTask);
    },
    async updateTask(id, input) {
      const index = tasks.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new Error("NotFound");
      }
      const original = tasks[index];
      if (!original) {
        throw new Error("NotFound");
      }
      if (input.version !== original.version) {
        const error = new Error("Conflict");
        // @ts-expect-error add status for UI handling
        error.status = 409;
        throw error;
      }
      const now = new Date().toISOString();
      const updated: Task = {
        ...original,
        ...input,
        version: original.version + 1,
        updatedAt: now,
      };
      tasks[index] = updated;
      return structuredClone(updated);
    },
    async deleteTask(id) {
      tasks = tasks.filter((item) => item.id !== id);
      comments = comments.filter((comment) => comment.taskId !== id);
      return { id };
    },
    async listLabels() {
      return labels.map((label) => ({ ...label }));
    },
    async listComments(taskId) {
      return comments
        .filter((comment) => comment.taskId === taskId)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 10)
        .map((comment) => ({ ...comment }));
    },
    async addComment(taskId, { body }) {
      const newComment: Comment = {
        id: mockId(),
        taskId,
        body,
        createdAt: new Date().toISOString(),
      };
      comments = [newComment, ...comments];
      return { ...newComment };
    },
  };
}

function createTrpcApi(): Api {
  throw new Error("tRPC API is not wired yet");
}

function shouldUseMock() {
  const flag = process.env.NEXT_PUBLIC_USE_MOCK;
  if (flag === undefined) {
    return true;
  }
  const normalized = flag.toLowerCase();
  return normalized === "1" || normalized === "true";
}

export function ApiProvider({ children }: { children: ReactNode }) {
  const api = useMemo<Api>(() => (shouldUseMock() ? createMockApi() : createTrpcApi()), []);

  return <ApiCtx.Provider value={api}>{children}</ApiCtx.Provider>;
}

export const useApi = () => {
  const ctx = useContext(ApiCtx);
  if (!ctx) {
    throw new Error("ApiProvider missing");
  }
  return ctx;
};

export function useTasks(params?: { q?: string; status?: Status; labelId?: string }) {
  const api = useApi();
  return useQuery({ queryKey: ["tasks", params], queryFn: () => api.listTasks(params) });
}

export function useTask(id: string | null | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => api.getTask(id as string),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; description?: string; labelId?: string }) => api.createTask(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; input: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">> & { version: number } }) =>
      api.updateTask(payload.id, payload.input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["task", variables.id] });
    },
  });
}

export function useDeleteTask() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useLabels() {
  const api = useApi();
  return useQuery({ queryKey: ["labels"], queryFn: () => api.listLabels() });
}

export function useComments(taskId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => api.listComments(taskId as string),
    enabled: !!taskId,
  });
}

export function useAddComment() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { taskId: string; body: string }) => api.addComment(payload.taskId, { body: payload.body }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["comments", variables.taskId] });
    },
  });
}
