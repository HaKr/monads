// import { Err, Ok, type Result } from "../result/result.ts";

import { Option, OptionOrFuture } from "./api.ts";
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

  andThen<U>(fn: (some: T) => Promise<Option<U>>): PromisedOption<U>;
  andThen<U>(fn: (some: T) => Option<U>): Option<U>;
  andThen<U>(
    fn: (some: T) => OptionOrFuture<U>,
  ): PromisedOption<U> | Option<U> {
    return this.option.andThen(fn as (some: T) => Option<U>);
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
  map<U>(fn: (some: T) => Promise<U>): Promise<Option<U>>;
  map<U>(fn: (some: T) => U): Option<U>;
  map<U>(fn: unknown): Promise<Option<U>> | Option<U> {
    return this.option.map(fn as (some: T) => U);
  }

  or(optb: Option<T>): Option<T> {
    return this.option.or(optb);
  }

  orElse(fn: () => Promise<Option<T>>): PromisedOption<T>;
  orElse(fn: () => Option<T>): Option<T>;
  orElse(fn: () => OptionOrFuture<T>): PromisedOption<T> | Option<T> {
    return this.option.orElse(fn as () => Option<T>);
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

  unwrap(): T {
    return this.option.unwrap();
  }
  [Symbol.iterator]() {
    return this.option[Symbol.iterator]();
  }
}

export class PromisedOption<T> extends Promise<Option<T>> {
  constructor(
    private promise: Promise<Option<T>>,
  ) {
    super((resolve) => {
      resolve(undefined as unknown as Option<T>);
    });
  }

  static create<U>(promise: Promise<Option<U>>): PromisedOption<U> {
    return new PromisedOption(promise);
  }

  then<TResult1 = Option<T>, TResult2 = never>(
    onfulfilled?:
      | ((value: Option<T>) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      // deno-lint-ignore no-explicit-any
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }

  and<U>(optb: Option<U>): PromisedOption<U> {
    return PromisedOption.create(
      this.promise.then((option) => option.and(optb)),
    );
  }

  andThen<U>(fn: (some: T) => Promise<Option<U>>): PromisedOption<U>;
  andThen<U>(fn: (some: T) => Option<U>): Option<U>;
  andThen<U>(
    fn: (some: T) => OptionOrFuture<U>,
  ): PromisedOption<U> | Option<U> {
    return PromisedOption.create(
      this.promise.then((option) => {
        return option.andThen(fn as (some: T) => Promise<Option<U>>);
      }),
    );
  }

  filter(predicate: (some: T) => boolean): PromisedOption<T> {
    return PromisedOption.create(
      this.promise.then((option) => option.filter(predicate)),
    );
  }

  isSome(): Promise<boolean> {
    return this.promise.then((option) => option.isSome());
  }

  isNone(): Promise<boolean> {
    return this.promise.then((option) => option.isNone());
  }

  map<U>(fn: (some: T) => Promise<U>): PromisedOption<U>;
  map<U>(fn: (some: T) => U): PromisedOption<U>;
  map<U>(fn: unknown): PromisedOption<U> {
    return PromisedOption.create(
      this.promise.then((option) => option.map(fn as (some: T) => Promise<U>)),
    );
  }

  or(optb: Option<T>): PromisedOption<T> {
    return PromisedOption.create(
      this.promise.then((option) => option.or(optb)),
    );
  }

  orElse(fn: () => Promise<Option<T>>): PromisedOption<T>;
  orElse(fn: () => Option<T>): PromisedOption<T>;
  orElse(fn: () => OptionOrFuture<T>): PromisedOption<T> {
    return PromisedOption.create(
      this.promise.then((option) => {
        return option.orElse(fn as () => Promise<Option<T>>);
      }),
    );
  }
}
