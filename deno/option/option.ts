// import { Err, Ok, type Result } from "../result/result.ts";

import { FutureOption, Match, Option, OptionOrFuture } from "./api.ts";
import { UnwrapableOption } from "./chainable.ts";
import { NoneValue, SomeValue } from "./implementation.ts";

export function Some<T>(value: T): Option<T> {
  return OptionValue.from(new SomeValue<T>(value));
}

export function None<T>(): Option<T> {
  return OptionValue.from(new NoneValue<T>());
}

export class OptionValue<T> implements Option<T>, UnwrapableOption<T> {
  constructor(
    private option: UnwrapableOption<T>,
  ) {}

  get type(): symbol {
    return this.option.type;
  }

  static from<T>(option: UnwrapableOption<T>): Option<T> {
    return new OptionValue(option);
  }

  and<U>(optb: Option<U>): Option<U> {
    return this.option.and(optb);
  }

  andThen<U>(fn: (some: T) => FutureOption<U>): FutureOption<U>;
  andThen<U>(fn: (some: T) => Option<U>): Option<U>;
  andThen<U>(
    fn: (some: T) => OptionOrFuture<U>,
  ): OptionOrFuture<U> {
    return this.option.andThen(fn as any);
  }

  filter(predicate: (some: T) => boolean): Option<T> {
    return this.option.filter(predicate);
  }

  getOrInsert(value: T): T {
    const optional = this.option.orElse(() => {
      this.option = new SomeValue<T>(value);
      return this;
    });
    return (optional as unknown as UnwrapableOption<T>).unwrap();
  }

  insert(value: T) {
    this.option = new SomeValue<T>(value);
    return value;
  }

  isSome(): boolean {
    return this.option.isSome();
  }
  isNone(): boolean {
    return this.option.isNone();
  }
  map<U>(fn: (some: T) => Promise<U>): FutureOption<U>;
  map<U>(fn: (some: T) => U): Option<U>;
  map<U>(fn: unknown): FutureOption<U> | Option<U> {
    return this.option.map(fn as any);
  }

  or(optb: Option<T>): Option<T> {
    return this.option.or(optb);
  }

  orElse(fn: () => FutureOption<T>): FutureOption<T>;
  orElse(fn: () => Option<T>): Option<T>;
  orElse(fn: () => OptionOrFuture<T>): OptionOrFuture<T> {
    return this.option.orElse(fn as any);
  }

  match<U>(fn: Match<T, U>): U {
    throw new Error("Method not implemented.");
  }

  /**
   *  Replaces the actual value in the option by the value given in parameter,
   * returning the old value if present, leaving a Some in its place without deinitializing either one.
   *
   * @example
   * ```typescript
   * let mut x = Some(2);
   * let old = x.replace(5);
   * assert_eq!(x, Some(5));
   * assert_eq!(old, Some(2));
   *
   * let mut x = None;
   * let old = x.replace(3);
   * assert_eq!(x, Some(3));
   * assert_eq!(old, None);
   * ```
   */
  replace(value: T): Option<T> {
    const old = OptionValue.from(this.option);
    this.insert(value);
    return old;
  }

  unwrapOr(def: T): T {
    throw new Error("Method not implemented.");
  }
  unwrap(): T {
    return this.option.unwrap();
  }
  [Symbol.iterator]() {
    return this.option[Symbol.iterator]();
  }
}
