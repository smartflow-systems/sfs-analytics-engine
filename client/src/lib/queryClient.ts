import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const parts = queryKey as (string | Record<string, string> | undefined)[];
    const baseUrl = parts[0] as string;
    
    const urlParams = new URLSearchParams();
    
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (typeof part === "string") {
        urlParams.set("range", part);
      } else if (typeof part === "object" && part !== null) {
        Object.entries(part).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            urlParams.set(key, String(value));
          }
        });
      }
    }
    
    const queryString = urlParams.toString();
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
