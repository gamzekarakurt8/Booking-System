import { API_URL } from "./config";

type SchemaLike<TOutput> = {
  parse: (input: unknown) => TOutput;
};

type ApiRequestOptions<TInput, TOutput> = {
  method?: "GET" | "POST";
  token?: string;
  body?: TInput;
  schema?: SchemaLike<TOutput>;
};

export async function apiRequest<TInput = undefined, TOutput = unknown>(
  path: string,
  options?: ApiRequestOptions<TInput, TOutput>,
): Promise<TOutput> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : Array.isArray(payload?.message)
          ? payload.message.join(", ")
          : "Request failed";

    throw new Error(message);
  }

  if (options?.schema) {
    return options.schema.parse(payload);
  }

  return payload as TOutput;
}
