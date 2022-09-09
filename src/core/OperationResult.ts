export class OperationResult<T> {
    errorMessage?: string;
    result: T;
    isSucceed: boolean;
}