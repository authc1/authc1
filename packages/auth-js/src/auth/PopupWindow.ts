import { toParams, toQuery } from "../utils/query";

export interface PopupWindowOptions {
  height?: number;
  width?: number;
}

class PopupWindow<T> {
  private id: string;
  private url: string;
  private options: PopupWindowOptions;
  private window: Window | null;
  private promise: Promise<T> | undefined;
  private _iid: number | null;

  constructor(id: string, url: string, options: PopupWindowOptions = {}) {
    this.id = id;
    this.url = url;
    this.options = options;
    this.window = null;
    this.promise = undefined;
    this._iid = null;
  }

  open(): void {
    const { url, id, options } = this;
    const { height = 600, width = 500 } = options;
    const left = window.innerWidth / 2 - height / 2;
    const top = window.innerHeight / 2 - width / 2;
    const optionsString = toQuery({ height, width, left, top });
    this.window = window.open(url, id, optionsString);
  }

  close(): void {
    this.cancel();
    if (this.window) {
      this.window.close();
    }
  }

  poll(): void {
    this.promise = new Promise<T>((resolve, reject) => {
      this._iid = window.setInterval(() => {
        try {
          const popup = this.window;

          if (!popup || popup.closed !== false) {
            this.close();

            reject(new Error("The popup was closed"));

            return;
          }

          if (
            popup.location.href === this.url ||
            popup.location.pathname === "blank"
          ) {
            return;
          }

          const params = toParams(popup.location.search.replace(/^\?/, ""));

          resolve(params as T);

          this.close();
        } catch (error) {
          /*
           * Ignore DOMException: Blocked a frame with origin from accessing a
           * cross-origin frame.
           */
        }
      }, 500);
    });
  }

  cancel(): void {
    if (this._iid) {
      window.clearInterval(this._iid);
      this._iid = null;
    }
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined
  ): Promise<TResult1 | TResult2> {
    if (!this.promise) {
      throw new Error("No promise available");
    }
    return this.promise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | null
      | undefined
  ): Promise<T | TResult> {
    if (!this.promise) {
      throw new Error("No promise available");
    }
    return this.promise.catch(onrejected);
  }

  static open<T>(
    ...args: ConstructorParameters<typeof PopupWindow>
  ): PopupWindow<T> {
    const popup = new this<T>(...args);

    popup.open();
    popup.poll();

    return popup;
  }
}

export default PopupWindow;
