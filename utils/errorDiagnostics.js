import { inspect } from 'node:util';

// A single string keeps stacks and nested causes even with single-argument loggers.
export function describeError(error) {
  return inspect(error, { depth: 5, colors: false, customInspect: false, getters: false });
}
