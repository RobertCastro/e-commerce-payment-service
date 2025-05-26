type Success<T> = { ok: true; value: T };
type Failure<E> = { ok: false; error: E };

export type Result<T, E> = Success<T> | Failure<E>;

export const success = <T, E>(value: T): Result<T, E> => ({
  ok: true,
  value,
});

export const failure = <T, E>(error: E): Result<T, E> => ({
  ok: false,
  error,
});
