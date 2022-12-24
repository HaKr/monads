import { Match, Option, OptionType, PossibleFuture } from "./api.ts";
import { ChainableOption } from "./chainable.ts";
import { OptionValue, Some } from "./option.ts";
export type OptionOrFuture<T> = PossibleFuture<Option<T>>;
export type FutureOption<T> = Promise<Option<T>>;

export class SomeValue<T> implements ChainableOption<T> {
  constructor(private value: T) {}

  [Symbol.iterator](): IterableIterator<T> {
    return [this.value][Symbol.iterator]();
  }

  get type(): symbol {
    return OptionType.Some;
  }

  and<U>(optb: Option<U>): Option<U> {
    return optb;
  }

  andThen<U>(fn: (some: T) => FutureOption<U>): FutureOption<U>;
  andThen<U>(fn: (some: T) => Option<U>): Option<U>;
  andThen<U>(
    fn: (some: T) => OptionOrFuture<U>,
  ): OptionOrFuture<U> {
    return fn(this.value);
  }

  filter(predicate: (some: T) => boolean): Option<T> {
    return OptionValue.from(predicate(this.value) ? this : new NoneValue<T>());
  }
  /*
  flatten<U>(): Option<U> {
    return (typeof this.value == "object" && this.value !== null &&
        typeof (this.value as { type?: symbol }) == "symbol")
      ? this.value as unknown as Option<U>
      : this as unknown as Option<U>;
  }
  */

  isSome(): boolean {
    return true;
  }

  isNone(): boolean {
    return false;
  }

  /**
   * Maps an Option<T> to Option<U> by applying a function to a contained value.
   */
  map<U>(fn: (some: T) => Promise<U>): FutureOption<U>;
  map<U>(fn: (some: T) => U): Option<U>;
  map<U>(fn: (some: T) => PossibleFuture<U>): OptionOrFuture<U> {
    const newVal = fn(this.value);

    return newVal instanceof Promise ? newVal.then(Some) : Some(newVal);
  }

  or(_: Option<T>): Option<T> {
    return OptionValue.from(this);
  }

  orElse(fn: () => FutureOption<T>): FutureOption<T>;
  orElse(fn: () => Option<T>): Option<T>;
  orElse(_: () => OptionOrFuture<T>): OptionOrFuture<T> {
    return OptionValue.from(this);
  }

  match<U>(fn: Match<T, U>): U {
    throw new Error("Method not implemented.");
  }
  unwrapOr(def: T): T {
    throw new Error("Method not implemented.");
  }
  unwrap(): T {
    return this.value;
  }
}

export class NoneValue<T> implements ChainableOption<T> {
  constructor() {}

  [Symbol.iterator](): IterableIterator<T> {
    return [][Symbol.iterator]();
  }

  isSome(): boolean {
    return false;
  }
  isNone(): boolean {
    return true;
  }

  match<U>(fn: Match<T, U>): U {
    throw new Error("Method not implemented.");
  }

  map<U>(fn: (some: T) => Promise<U>): FutureOption<U>;
  map<U>(fn: (some: T) => U): Option<U>;
  map<U>(_: (val: T) => PossibleFuture<U>): OptionOrFuture<U> {
    return OptionValue.from(this as unknown as NoneValue<U>);
  }

  andThen<U>(fn: (some: T) => FutureOption<U>): FutureOption<U>;
  andThen<U>(fn: (some: T) => Option<U>): Option<U>;
  andThen<U>(
    _: (some: T) => OptionOrFuture<U>,
  ): OptionOrFuture<U> {
    return OptionValue.from(this as unknown as NoneValue<U>);
  }

  or(optb: Option<T>): Option<T> {
    return optb;
  }

  orElse(fn: () => FutureOption<T>): FutureOption<T>;
  orElse(fn: () => Option<T>): Option<T>;
  orElse(fn: () => OptionOrFuture<T>): OptionOrFuture<T> {
    return fn();
  }

  and<U>(_: Option<U>): Option<U> {
    return OptionValue.from(this as unknown as NoneValue<U>);
  }

  filter(_: (some: T) => boolean): Option<T> {
    return OptionValue.from(this);
  }

  unwrapOr(def: T): T {
    throw new Error("Method not implemented.");
  }
  unwrap(): T {
    throw new Error("Cannot unwrap None");
  }

  get type(): symbol {
    return OptionType.None;
  }
}
