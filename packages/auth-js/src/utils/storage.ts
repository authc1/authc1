export function setItem(key: string, value: any): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getItem(key: string): any | null {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}

export function removeItem(key: string): void {
  localStorage.removeItem(key);
}

export function clear(): void {
  localStorage.clear();
}
