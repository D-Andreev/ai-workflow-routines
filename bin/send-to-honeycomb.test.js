const test = require("node:test");
const assert = require("node:assert");
const { parseArgs, loadData, enrichEvents } = require("./send-to-honeycomb.js");

test("parseArgs", async (t) => {
  await t.test("parses required arguments", () => {
    const argv = [
      "node",
      "script.js",
      "--honeycomb-key",
      "abc123",
      "--dataset",
      "my-dataset",
      "/path/to/state",
    ];
    const opts = parseArgs(argv);

    assert.strictEqual(opts.apiKey, "abc123");
    assert.strictEqual(opts.dataset, "my-dataset");
    assert.strictEqual(opts.stateRoot, "/path/to/state");
  });

  await t.test("parses optional arguments", () => {
    const argv = [
      "node",
      "script.js",
      "--honeycomb-key",
      "key",
      "--dataset",
      "ds",
      "--env",
      "eu",
      "--repo",
      "my-repo",
      "--batch-size",
      "100",
      "/path",
    ];
    const opts = parseArgs(argv);

    assert.strictEqual(opts.env, "eu");
    assert.strictEqual(opts.repo, "my-repo");
    assert.strictEqual(opts.batchSize, 100);
  });

  await t.test("uses defaults", () => {
    const argv = [
      "node",
      "script.js",
      "--honeycomb-key",
      "key",
      "--dataset",
      "ds",
      "/path",
    ];
    const opts = parseArgs(argv);

    assert.strictEqual(opts.env, "us");
    assert.strictEqual(opts.batchSize, 50);
    assert.strictEqual(opts.repo, null);
  });

  await t.test("handles missing required args", () => {
    const argv = ["node", "script.js", "--honeycomb-key", "key"];
    const opts = parseArgs(argv);

    assert.strictEqual(opts.apiKey, "key");
    assert.strictEqual(opts.dataset, null);
    assert.strictEqual(opts.stateRoot, null);
  });
});

test("enrichEvents", async (t) => {
  await t.test("adds human_addressed_pct for close_completed", () => {
    const events = [
      {
        event: "close_completed",
        dispositions: [
          { disposition: "addressed" },
          { disposition: "ignored" },
        ],
      },
    ];
    const enriched = enrichEvents(events, null);

    assert.strictEqual(enriched[0].human_addressed_pct, 50);
  });

  await t.test("handles empty dispositions", () => {
    const events = [
      {
        event: "close_completed",
        dispositions: [],
      },
    ];
    const enriched = enrichEvents(events, null);

    assert.strictEqual(enriched[0].human_addressed_pct, 0);
  });

  await t.test("adds findings_total for review_completed", () => {
    const events = [
      {
        event: "review_completed",
        critical_count: 1,
        minor_count: 2,
        notes_count: 3,
      },
    ];
    const enriched = enrichEvents(events, null);

    assert.strictEqual(enriched[0].findings_total, 6);
  });

  await t.test("adds repository tag when provided", () => {
    const events = [{ event: "test" }];
    const enriched = enrichEvents(events, "my-app");

    assert.strictEqual(enriched[0].repository, "my-app");
  });

  await t.test("does not add repository when null", () => {
    const events = [{ event: "test" }];
    const enriched = enrichEvents(events, null);

    assert.strictEqual(enriched[0].repository, undefined);
  });
});

test("loadData", async (t) => {
  await t.test("returns empty array for missing directory", () => {
    const data = loadData("/nonexistent/path");
    assert.strictEqual(data.length, 0);
  });
});
