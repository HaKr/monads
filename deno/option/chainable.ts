import { Option } from "./api.ts";
import { PromisedOption } from "./option.ts";

export interface ChainableOption<T> {
  [Symbol.iterator]: () => IterableIterator<T>;

  /**
   * Returns None if the option is None, otherwise returns optb.
   *
   * Arguments passed to and are eagerly evaluated; if you are passing the result of a function call,
   * it is recommended to use and_then, which is lazily evaluated.
   */
  and<U>(optb: Option<U>): Option<U>;

  /**
   * Returns None if the option is None, otherwise calls f with the wrapped value and returns the result.
   *
   * Some languages call this operation flatmap.
   */
  andThen<U>(fn: (some: T) => Promise<Option<U>>): PromisedOption<U>;
  andThen<U>(fn: (some: T) => Option<U>): Option<U>;

  /**
   * Returns None if the option is None, otherwise calls predicate with the wrapped value and returns:
   *
   *   - Some(t) if predicate returns true (where t is the wrapped value), and
   *   - None if predicate returns false.
   */
  filter(predicate: (some: T) => boolean): Option<T>;

  isSome(): boolean;
  isNone(): boolean;

  /**
   * Maps an Option<T> to Option<U> by applying a function to a contained value.
   */
  map<U>(fn: (some: T) => Promise<U>): Promise<Option<U>>;
  map<U>(fn: (some: T) => U): Option<U>;

  /**
   * Returns the option if it contains a value, otherwise returns optb.
   *
   * Arguments passed to or are eagerly evaluated; if you are passing the result of a function call,
   * it is recommended to use or_else, which is lazily evaluated.
   */
  or(optb: Option<T>): Option<T>;

  /**
   * Returns the option if it contains a value, otherwise calls f and returns the result.
   */
  orElse(fn: () => Promise<Option<T>>): PromisedOption<T>;
  orElse(fn: () => Option<T>): Option<T>;
}

export interface UnwrapableOption<T> extends ChainableOption<T> {
  type: symbol;

  unwrap(): T;
}
