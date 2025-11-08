export class InvalidTokenError extends Error {
  constructor(message: string) {
    super(`InvalidTokenError: ${message}`);
    this.name = "InvalidTokenError";
  }
}

export class PostgresError extends Error {
  constructor(message: string) {
    super(`PostgresError: ${message}`);
    this.name = "PostgresError";
  }
}
