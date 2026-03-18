# Building with Pyreon Zero

## Creating a new app
bun create @pyreon/zero my-app

## File-based routing
- src/routes/index.tsx → /
- src/routes/about.tsx → /about
- src/routes/posts/index.tsx → /posts
- src/routes/posts/[id].tsx → /posts/:id
- src/routes/_layout.tsx → shared layout wrapper
- src/routes/_error.tsx → error boundary
- src/routes/_loading.tsx → loading state
- (group)/ → route groups (no URL segment)

## When user asks for a new data entity
1. Create src/features/[name].ts with defineFeature()
2. Define Zod schema from the description
3. Set API path: /api/[plural-name]
4. Create route pages that use the feature hooks:
   - src/routes/[name]/index.tsx → list with useList()
   - src/routes/[name]/new.tsx → create form with useForm()
   - src/routes/[name]/[id].tsx → detail with useById()
   - src/routes/[name]/[id]/edit.tsx → edit form with useForm({ mode: 'edit', id })

## When user asks for global state
Use defineStore() from @pyreon/store:
```ts
const useAuth = defineStore('auth', () => {
  const user = signal(null)
  const isLoggedIn = computed(() => user() !== null)
  return { user, isLoggedIn }
})
```

## When user asks for data fetching
Always use useQuery() with function-form options:
```tsx
const { data, isPending } = useQuery(() => ({
  queryKey: ['key'],
  queryFn: () => fetch('/api/data').then(r => r.json()),
}))
```

## When user asks for a form
Use useForm() with zodSchema():
```tsx
const form = useForm({
  initialValues: { email: '' },
  schema: zodSchema(z.object({ email: z.string().email() })),
  onSubmit: async (values) => { ... },
})
```

## When user asks for a table
Use feature.useTable(data) for auto-inferred columns,
or useTable() directly for custom configurations.

## When user asks for i18n
1. Create i18n instance with createI18n()
2. Wrap app with `<I18nProvider instance={i18n}>`
3. Use `const { t, locale } = useI18n()` in components

## Devtools
Devtools are auto-enabled in dev mode via `__ZERO_DEVTOOLS__` define.
The starter template already calls `initDevtools()` in entry-client.ts.

To inspect state at runtime, import from the devtools registries:
```ts
import { getDevtoolsRegistry } from '@pyreon/zero/devtools'
const { store, form, i18n } = getDevtoolsRegistry()
// store.getRegisteredStores(), store.getStoreById('auth')
// form.getActiveForms(), form.getFormSnapshot('login')
// i18n.getActiveI18nInstances(), i18n.getI18nSnapshot('main')
```

To force devtools on/off in config:
```ts
zero({ devtools: true })  // force on, even in production
zero({ devtools: false }) // force off, even in dev
```

## When user asks to debug state
1. Check devtools are enabled (`__ZERO_DEVTOOLS__` is true)
2. Use `getDevtoolsRegistry()` to access store/form/i18n registries
3. Point them to install `@pyreon/devtools` Chrome extension for component tree inspection

## JSX patterns
- Reactive text: `<span>{() => count()}</span>`
- Conditional: `{() => show() ? <Modal /> : null}`
- Lists: `{() => items().map(item => <Item key={item.id} />)}`
- Events: `<button onClick={() => count.update(n => n + 1)}>`
- Spread: `<input {...field.register()} />`
