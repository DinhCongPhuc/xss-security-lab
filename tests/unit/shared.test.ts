import { expect, test } from "vitest";
import {
  loopbacks,
  readPort,
} from "../../packages/shared-config/src/network.ts";
import {
  isResultState,
  resultStates,
} from "../../packages/shared-types/src/index.ts";
import { plainTextFixture } from "../../packages/test-cases/src/index.ts";

test("result-state validation recognizes explicit states only", () => {
  expect(resultStates.every(isResultState)).toBe(true);
  expect(isResultState(undefined)).toBe(false);
  expect(isResultState("prevented")).toBe(false);
  expect(plainTextFixture.expected).toBe("NORMAL");
});

test("network defaults are loopback and invalid port overrides fail", () => {
  expect(loopbacks).toEqual(["127.0.0.1", "::1"]);
  expect(readPort(undefined, 3000)).toBe(3000);
  expect(readPort("3030", 3000)).toBe(3030);
  for (const value of ["", "0", "65536", "3000.5", "1e4"])
    expect(() => readPort(value, 3000)).toThrow();
});
