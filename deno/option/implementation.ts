import { Option, OptionType, PossibleFuture } from "./api.ts";
import { ChainableOption, UnwrapableOption } from "./chainable.ts";
import { OptionValue, PromisedOption, Some } from "./option.ts";

export type OptionOrFuture<T> = PossibleFuture<Option<T>>;

export class SomeValue<T> implements ChainableOption<T>, UnwrapableOption<T> {
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

  andThen<U>(fn: (some: T) => Promise<Option<U>>): PromisedOption<U>;
  andThen<U>(fn: (some: T) => Option<U>): Option<U>;
  andThen<U>(
    fn: (some: T) => OptionOrFuture<U>,
  ): PromisedOption<U> | Option<U> {
    const alt = fn(this.value);
    return alt instanceof Promise ? PromisedOption.create(alt) : alt;
  }

  filter(predicate: (some: T) => boolean): Option<T> {
    return OptionValue.from(
      predicate(this.value) ? this : new NoneValue<T>(),
    );
  }

  isSome(): boolean {
    return true;
  }

  isNone(): boolean {
    return false;
  }

  /**
   * Maps an Option<T> to Option<U> by applying a function to a contained value.
   */
  map<U>(fn: (some: T) => Promise<U>): Promise<Option<U>>;
  map<U>(fn: (some: T) => U): Option<U>;
  map<U>(fn: (some: T) => PossibleFuture<U>): OptionOrFuture<U> {
    const newVal = fn(this.value);

    return newVal instanceof Promise ? newVal.then(Some) : Some(newVal);
  }

  or(_: Option<T>): Option<T> {
    return OptionValue.from(this);
  }

  orElse(fn: () => Promise<Option<T>>): PromisedOption<T>;
  orElse(fn: () => Option<T>): Option<T>;
  orElse(_: () => OptionOrFuture<T>): PromisedOption<T> | Option<T> {
    return OptionValue.from(this);
  }

  unwrap(): T {
    return this.value;
  }
}

export class NoneValue<T> implements ChainableOption<T>, UnwrapableOption<T> {
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

  map<U>(fn: (some: T) => Promise<U>): Promise<Option<U>>;
  map<U>(fn: (some: T) => U): Option<U>;
  map<U>(_: (val: T) => PossibleFuture<U>): OptionOrFuture<U> {
    return OptionValue.from(this as unknown as NoneValue<U>);
  }

  andThen<U>(fn: (some: T) => Promise<Option<U>>): PromisedOption<U>;
  andThen<U>(fn: (some: T) => Option<U>): Option<U>;
  andThen<U>(
    _: (some: T) => OptionOrFuture<U>,
  ): PromisedOption<U> | Option<U> {
    return OptionValue.from(this as unknown as NoneValue<U>);
  }

  or(optb: Option<T>): Option<T> {
    return optb;
  }

  orElse(fn: () => Promise<Option<T>>): PromisedOption<T>;
  orElse(fn: () => Option<T>): Option<T>;
  orElse(fn: () => OptionOrFuture<T>): PromisedOption<T> | Option<T> {
    const alt = fn();
    return alt instanceof Promise ? PromisedOption.create(alt) : alt;
  }

  and<U>(_: Option<U>): Option<U> {
    return OptionValue.from(this as unknown as NoneValue<U>);
  }

  filter(_: (some: T) => boolean): Option<T> {
    return OptionValue.from(this);
  }

  unwrap(): T {
    throw new Error("Cannot unwrap None");
  }

  get type(): symbol {
    return OptionType.None;
  }
}
