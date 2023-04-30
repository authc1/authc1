interface HttpResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export async function get<T>(url: string): Promise<HttpResponse<T>> {
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  return { data, status: response.status, statusText: response.statusText };
}

export async function post<T>(
  url: string,
  data: any
): Promise<HttpResponse<T>> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const responseData = await response.json();
  return {
    data: responseData,
    status: response.status,
    statusText: response.statusText,
  };
}
