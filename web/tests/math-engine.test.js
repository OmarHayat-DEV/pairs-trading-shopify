import assert from "node:assert/strict";
import test from "node:test";

import { pairPnl } from "../src/scripts/math-engine.js";

test("computes CAD PnL for short CAD leg and long USD leg with FX conversion", () => {
  const pnl = pairPnl({
    cadQuantity: -1,
    cadEntry: 100,
    cadExit: 100,
    usdQuantity: 1,
    usdEntry: 65,
    usdExit: 100,
    entryCadUsd: 0.7,
    exitCadUsd: 1,
  });

  const expected = 7.1428;
  const toll = 1e-3

  assert.ok(Math.abs(pnl - expected) < toll, `expected ${expected}, received ${pnl}`);
});
