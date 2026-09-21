interface AgentProfileCapabilities {
  agentProfiles?: boolean;
  agentConfigApply?: boolean;
}

export function supportsLaunchArgs(features: { agentExtraArgs?: boolean } | undefined): boolean {
  return features?.agentExtraArgs === true;
}

export function supportsAgentProfiles(features: AgentProfileCapabilities | undefined): boolean {
  return features?.agentProfiles === true && features.agentConfigApply === true;
}
