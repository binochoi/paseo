import {
  filterAndRankModelRows,
  getAllProviderModelRows,
  getProviderModelRows,
  type ProviderSelectionModelRow,
  type ProviderSelectorProvider,
} from "@/provider-selection/provider-selection";

export type ModelBrowserView =
  | { kind: "all" }
  | { kind: "provider"; providerId: string; providerLabel: string };

export function resolveModelBrowserScrolling({
  isNative,
  isCompact,
}: {
  isNative: boolean;
  isCompact: boolean;
}): "sheet" | "independent" {
  return isNative && isCompact ? "sheet" : "independent";
}

/** A profile's model reference; used to match profiles back to model rows. */
export interface ModelProfileRef {
  provider: string;
  modelId: string;
}

/**
 * Groups profiles by `provider:modelId`, skipping profiles that name no model.
 * Pure so the model browser can test it apart from the component tree.
 */
export function groupProfilesByProviderModel<T extends ModelProfileRef>(
  refs: readonly T[],
): Map<string, T[]> {
  const lookup = new Map<string, T[]>();
  for (const ref of refs) {
    const modelId = ref.modelId.trim();
    if (!modelId) {
      continue;
    }
    const key = `${ref.provider}:${modelId}`;
    const existing = lookup.get(key);
    if (existing) {
      existing.push(ref);
    } else {
      lookup.set(key, [ref]);
    }
  }
  return lookup;
}

/** What the root view shows: the provider drill-down, or ranked cross-provider results. */
export type ModelBrowserAllView =
  | { kind: "browse" }
  | { kind: "searchResults"; rows: ProviderSelectionModelRow[] }
  | { kind: "noSearchMatches" };

export function resolveModelBrowserAllView({
  providers,
  normalizedQuery,
  isSearchFocused,
}: {
  providers: ProviderSelectorProvider[];
  normalizedQuery: string;
  isSearchFocused: boolean;
}): ModelBrowserAllView {
  if (!normalizedQuery && !isSearchFocused) {
    return { kind: "browse" };
  }
  const allRows = getAllProviderModelRows(providers);
  const rows = normalizedQuery ? filterAndRankModelRows(allRows, normalizedQuery) : allRows;
  if (rows.length === 0) {
    return { kind: "noSearchMatches" };
  }
  return { kind: "searchResults", rows };
}

/**
 * 현재 브라우저 상태에서 보이는 모델 행의 flat 목록을 반환한다.
 * 프로바이더 드릴다운 목록만 보이는 경우(검색 없는 전체 보기)에는 null을 반환한다.
 */
export function resolveVisibleModelRows({
  view,
  providers,
  searchQuery,
  isSearchFocused,
  searchAllOnFocus = false,
}: {
  view: ModelBrowserView;
  providers: ProviderSelectorProvider[];
  searchQuery: string;
  isSearchFocused: boolean;
  searchAllOnFocus?: boolean;
}): ProviderSelectionModelRow[] | null {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  if (view.kind === "provider") {
    const provider = providers.find((p) => p.id === view.providerId) ?? null;
    if (!provider) return null;
    return filterAndRankModelRows(getProviderModelRows(provider), normalizedQuery);
  }
  const allView = resolveModelBrowserAllView({
    providers,
    normalizedQuery,
    isSearchFocused: searchAllOnFocus && isSearchFocused,
  });
  if (allView.kind === "searchResults") return allView.rows;
  return null;
}

/** Where the picker lands when it opens. A sole provider skips the redundant root view. */
export function resolveInitialModelBrowserView({
  providers,
  selectedProvider,
  selectedModel,
  hasProfiles,
}: {
  providers: ProviderSelectorProvider[];
  selectedProvider: string;
  selectedModel: string;
  hasProfiles: boolean;
}): ModelBrowserView {
  const singleProvider = providers.length === 1 ? providers[0] : undefined;
  if (singleProvider) {
    return {
      kind: "provider",
      providerId: singleProvider.id,
      providerLabel: singleProvider.label,
    };
  }

  if (hasProfiles) {
    return { kind: "all" };
  }

  if (selectedProvider.length > 0 && selectedModel.length > 0) {
    const provider = providers.find((entry) => entry.id === selectedProvider);
    if (provider) {
      return { kind: "provider", providerId: provider.id, providerLabel: provider.label };
    }
  }

  return { kind: "all" };
}
