export const Errors = {
  NotFoundError: class NotFoundError extends Error {},
  InternalError: class ServerError extends Error {},
} as const;


type ErrorConstructor<E extends Error = Error> = new (...args: any[]) => E;
type ErrorCallback<T, E, R> = (result: T | null, error: E) => R;
type OtherwiseCallback<T, R> = (result: T | null, error: Error) => R;

export class ErrorFlow<T> {
  protected registeredErrorsCallbacks: Map<ErrorConstructor, Function> = new Map();
  protected result: T | null = null;
  protected error!: Error;

  protected constructor() {}

  protected static getErrorClass(error: Error): ErrorConstructor {
    return error.constructor as ErrorConstructor;
  }

  onError<E extends Error, R>(
    errorClass: ErrorConstructor<E>,
    callback: ErrorCallback<T, E, R>
  ): this {
    this.registeredErrorsCallbacks.set(errorClass, callback);
    return this;
  }

  otherwise<R>(
    callback: OtherwiseCallback<T, R>
  ): R {
    if (this.error) {
      const errorCallback = this.registeredErrorsCallbacks.get(ErrorFlow.getErrorClass(this.error));
      if (errorCallback) {
        return errorCallback(this.result, this.error);
      }
    }
    return callback(this.result, this.error);
  }

  static async runAsync<T>(riskyFunction: () => Promise<T>): Promise<ErrorFlow<T>> {
    const flow = new ErrorFlow<T>();
    try {
      flow.result = await riskyFunction();
    } catch (error) {
      flow.error = error instanceof Error ? error : new Error(String(error));
    }
    return flow;
  }

  static run<T>(throwingFunction: () => T): ErrorFlow<T> {
    const flow = new ErrorFlow<T>();
    try {
      flow.result = throwingFunction();
    } catch (error) {
      flow.error = error instanceof Error ? error : new Error(String(error));
    }
    return flow;
  }
}