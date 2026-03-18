// ─── Store ───────────────────────────────────────────────────────────────────

export type { StoreApi, StorePlugin } from '@pyreon/store'
export {
  addStorePlugin,
  batch,
  computed,
  defineStore,
  effect,
  resetAllStores,
  resetStore,
  signal,
} from '@pyreon/store'

// ─── Form ────────────────────────────────────────────────────────────────────

export type {
  FieldRegisterProps,
  FieldState,
  FormState,
  UseFieldArrayResult,
  UseFieldResult,
  UseFormOptions,
} from '@pyreon/form'
export {
  FormProvider,
  useField,
  useFieldArray,
  useForm,
  useFormContext,
  useFormState,
  useWatch,
} from '@pyreon/form'

// ─── Validation ──────────────────────────────────────────────────────────────

export type { SchemaAdapter, ValidationIssue } from '@pyreon/validation'
export { zodField, zodSchema } from '@pyreon/validation'

// ─── Query ───────────────────────────────────────────────────────────────────

export type { UseMutationResult, UseQueryResult } from '@pyreon/query'
export {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useIsFetching,
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from '@pyreon/query'

// ─── Table ───────────────────────────────────────────────────────────────────

export type { UseTableOptions } from '@pyreon/table'
export { flexRender, useTable } from '@pyreon/table'

// ─── Virtual ─────────────────────────────────────────────────────────────────

export type {
  UseVirtualizerOptions,
  UseVirtualizerResult,
} from '@pyreon/virtual'
export { useVirtualizer, useWindowVirtualizer } from '@pyreon/virtual'

// ─── i18n ────────────────────────────────────────────────────────────────────

export type { I18nInstance, I18nOptions } from '@pyreon/i18n'
export { createI18n, I18nProvider, Trans, useI18n } from '@pyreon/i18n'

// ─── Feature ─────────────────────────────────────────────────────────────────

export type { Feature, FeatureConfig } from '@pyreon/feature'
export { defineFeature, reference } from '@pyreon/feature'
