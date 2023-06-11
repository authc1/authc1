import { HttpResponse } from "../types";

export async function get<T>(url: string, token?: string): Promise<HttpResponse<T>> {
  const headers: { [key: string]: string } = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers.Authorization = "Bearer " + token;
  }
  
  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });
  const data = await response.json();
  return { data: data as T, status: response.status, statusText: response.statusText };
}

export async function post<T>(
  url: string,
  data: unknown,
  token?: string
): Promise<HttpResponse<T>> {
  const headers: { [key: string]: string } = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers.Authorization = "Bearer " + token;
  }
  
  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: data ? JSON.stringify(data) : undefined,
  });
  const responseData = await response.json();
  return {
    data: responseData as T,
    status: response.status,
    statusText: response.statusText,
  };
}