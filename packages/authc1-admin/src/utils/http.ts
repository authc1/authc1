export async function get<T>(url: string, key?: string): Promise<T> {
  const headers: { [key: string]: string } = {
    "Content-Type": "application/json",
  };
  if (key) {
    headers["X-Authc1-Api-Key"] = key;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });
  const data = await response.json();
  return data as T;
}

export async function post<T>(
  url: string,
  key: string,
  data: unknown
): Promise<T> {
  const headers: { [key: string]: string } = {
    "Content-Type": "application/json",
  };
  if (key) {
    headers["X-Authc1-Api-Key"] = key;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: data ? JSON.stringify(data) : undefined,
  });
  const responseData = await response.json();
  return responseData as T;
}

export async function patch<T>(
  url: string,
  key: string,
  data: unknown
): Promise<T> {
  const headers: { [key: string]: string } = {
    "Content-Type": "application/json",
  };
  if (key) {
    headers["X-Authc1-Api-Key"] = key;
  }

  const response = await fetch(url, {
    method: "PATCH",
    headers: headers,
    body: data ? JSON.stringify(data) : undefined,
  });
  const responseData = await response.json();
  return responseData as T;
}
