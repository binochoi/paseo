import { describe, expect, it } from "vitest";
import { supportsAgentProfiles, supportsLaunchArgs } from "./capabilities";

describe("agent profile capabilities", () => {
  it("requires storage and live config application support", () => {
    expect(supportsAgentProfiles(undefined)).toBe(false);
    expect(supportsAgentProfiles({ agentProfiles: true })).toBe(false);
    expect(supportsAgentProfiles({ agentConfigApply: true })).toBe(false);
    expect(supportsAgentProfiles({ agentProfiles: true, agentConfigApply: true })).toBe(true);
  });

  it("shows launch arguments only on daemons that apply them", () => {
    expect(supportsLaunchArgs(undefined)).toBe(false);
    expect(supportsLaunchArgs({ agentExtraArgs: true })).toBe(true);
  });
});
