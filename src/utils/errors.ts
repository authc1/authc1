export class ApplicationNotFoundError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "ApplicationNotFoundError";
  }
}
