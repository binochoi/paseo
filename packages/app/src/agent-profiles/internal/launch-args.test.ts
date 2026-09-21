import { describe, expect, it } from "vitest";
import { joinLaunchArgs, splitLaunchArgs } from "./launch-args";

describe("splitLaunchArgs", () => {
  it("splits on whitespace", () => {
    expect(splitLaunchArgs("  --no-project-config   --verbose ")).toEqual([
      "--no-project-config",
      "--verbose",
    ]);
  });

  it("keeps quoted spaces together", () => {
    expect(splitLaunchArgs(`--name "a b" --tag 'c d'`)).toEqual(["--name", "a b", "--tag", "c d"]);
  });

  it("keeps an empty quoted argument", () => {
    expect(splitLaunchArgs(`--flag ""`)).toEqual(["--flag", ""]);
  });

  it("reads a backslash as a literal next character", () => {
    expect(splitLaunchArgs(String.raw`a\ b "c\"d"`)).toEqual(["a b", 'c"d']);
  });

  it("returns nothing for blank text", () => {
    expect(splitLaunchArgs("   ")).toEqual([]);
  });
});

describe("joinLaunchArgs", () => {
  it("round-trips through splitLaunchArgs", () => {
    const args = ["--no-project-config", "a b", "it's", "", "--key=value"];
    expect(splitLaunchArgs(joinLaunchArgs(args))).toEqual(args);
  });

  it("leaves plain flags unquoted", () => {
    expect(joinLaunchArgs(["--model", "opus", "-c", "x=1"])).toBe("--model opus -c x=1");
  });
});
