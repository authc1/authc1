export interface Storage {
  getItem(key: string): any | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  length: number;
  key(index: number): string | null;
  clear(): void;
}

export class StorageManager {
  private readonly storage: Storage;

  constructor(options: { storageType: Storage }) {
    this.storage = options.storageType;
  }

  getItem(key: string): string | null {
    const value = this.storage.getItem(key);
    return value;
  }

  setItem(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  get length(): number | undefined {
    return this.storage.length;
  }

  key(index: number): string | null {
    return this.storage.key ? this.storage.key(index) : null;
  }

  clear(): void {
    if (this.storage.clear) {
      this.storage.clear();
    } else {
      for (let i = 0; i < this.length!; i++) {
        const key = this.key(i);
        if (key) {
          this.removeItem(key);
        }
      }
    }
  }
}