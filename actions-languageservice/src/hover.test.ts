import {hover} from "./hover";
import {getPositionFromCursor} from "./test-utils/cursor-position";

describe("hover", () => {
  it("on a key", async () => {
    const input = `o|n: push
jobs:
  build:
    runs-on: [self-hosted]`;
    const result = await hover(...getPositionFromCursor(input));
    expect(result).not.toBeUndefined();
    expect(result?.contents).toContain("The GitHub event that triggers the workflow.");
  });

  it("on a value", async () => {
    const input = `on: pu|sh
jobs:
  build:
    runs-on: [self-hosted]`;
    const result = await hover(...getPositionFromCursor(input));
    expect(result).not.toBeUndefined();
    expect(result?.contents).toEqual("Runs your workflow when you push a commit or tag.");
  });

  it("on a parameter with a description", async () => {
    const input = `on: push
jobs:
  build:
    co|ntinue-on-error: false`;
    const result = await hover(...getPositionFromCursor(input));
    expect(result).not.toBeUndefined();
    expect(result?.contents).toEqual(
      "Prevents a workflow run from failing when a job fails. Set to true to allow a workflow run to pass when this job fails.\n\n" +
        "**Context:** github, inputs, vars, needs, strategy, matrix"
    );
  });

  it("on a parameter with its own type", async () => {
    const input = `on: push
jobs:
  build:
    pe|rmissions: read-all`;
    const result = await hover(...getPositionFromCursor(input));
    expect(result).not.toBeUndefined();
    expect(result?.contents).toContain(
      "You can use `permissions` to modify the default permissions granted to the `GITHUB_TOKEN`"
    );
  });

  it("property values are not overwritten", async () => {
    const input1 = `on: push
jobs:
  build:
    ti|meout-minutes: 10
    cancel-timeout-minutes: 10`;
    const result1 = await hover(...getPositionFromCursor(input1));
    expect(result1).not.toBeUndefined();

    const input2 = `on: push
jobs:
  build:
    timeout-minutes: 10
    ca|ncel-timeout-minutes: 10`;
    const result2 = await hover(...getPositionFromCursor(input2));
    expect(result2).not.toBeUndefined();
    expect(result1?.contents).not.toEqual(result2?.contents);
  });

  it("on a value in a sequence", async () => {
    const input = `on: [pull_request,
      pu|sh]
jobs:
  build:
    runs-on: [self-hosted]`;
    const result = await hover(...getPositionFromCursor(input));
    expect(result).not.toBeUndefined();
    expect(result?.contents).toEqual("Runs your workflow when you push a commit or tag.");
  });

  it("on a cron schedule", async () => {
    const input = `on:
  schedule:
    - cron: '0,30 0|,12 * * *'
`;
    const result = await hover(...getPositionFromCursor(input));
    expect(result).not.toBeUndefined();
    expect(result?.contents).toEqual(
      "Runs at 0 and 30 minutes past the hour, at 00:00 and 12:00\n\n" +
      "Actions schedules run at most every 5 minutes. " +
      "[Learn more](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#onschedule)"
    );
  });

  it("on an invalid cron schedule", async () => {
    const input = `on:
  schedule:
    - cron: '0 0 |* * * * *'
`;
    const result = await hover(...getPositionFromCursor(input));
    expect(result).not.toBeUndefined();
    expect(result?.contents).toEqual("Invalid cron expression");
  });
});
