# Frontend Guide

Everything visible in the browser: pages, components, hooks, theming, and i18n.

---

## Pages (`app/`)

| Route                    | File                              | Description                        |
|--------------------------|-----------------------------------|------------------------------------|
| `/`                      | `app/page.tsx`                    | Landing page                       |
| `/auth/login`            | `app/auth/login/page.tsx`         | Sign-in form                       |
| `/auth/sign-up`          | `app/auth/sign-up/page.tsx`       | Registration form                  |
| `/auth/sign-up-success`  | `app/auth/sign-up-success/page.tsx` | Post-registration confirmation   |
| `/auth/error`            | `app/auth/error/page.tsx`         | Auth error display                 |
| `/dashboard`             | `app/dashboard/page.tsx`          | Main user dashboard (protected)    |
| `/dashboard/qr`          | `app/dashboard/qr/page.tsx`       | QR code scanner                    |
| `/dashboard/rewards`     | `app/dashboard/rewards/page.tsx`  | Rewards catalog                    |

Protected routes (`/dashboard/*`) are guarded by `middleware.ts` — unauthenticated users are redirected to `/auth/login`.

---

## Components (`components/`)

### Landing Page Sections

| File                      | Description                              |
|---------------------------|------------------------------------------|
| `hero-section.tsx`        | Hero banner with CTA                     |
| `how-it-works.tsx`        | Step-by-step explanation                 |
| `benefits-section.tsx`    | Key benefits cards                       |
| `partners-section.tsx`    | Partner logos grid                       |
| `faq-section.tsx`         | Accordion FAQ                            |
| `cta-section.tsx`         | Bottom call-to-action                    |
| `header.tsx`              | Top navigation bar                       |
| `footer.tsx`              | Site footer                              |

### Dashboard Components

| File                          | Description                          |
|-------------------------------|--------------------------------------|
| `dashboard-content.tsx`       | Points overview and activity feed    |
| `dashboard-header.tsx`        | Dashboard top bar with user info     |
| `dashboard-qr-content.tsx`    | QR code display / scanning UI        |
| `dashboard-rewards-content.tsx` | Rewards listing and redemption     |

### Auth Components

| File                          | Description                          |
|-------------------------------|--------------------------------------|
| `auth/sign-up-form.tsx`       | Registration form with validation    |

### Utility Components

| File                          | Description                          |
|-------------------------------|--------------------------------------|
| `providers.tsx`               | Wraps app with SessionProvider       |
| `theme-provider.tsx`          | next-themes wrapper                  |
| `language-provider.tsx`       | Language context provider            |
| `theme-language-switcher.tsx` | Combined theme + language toggle     |

### UI Primitives (`components/ui/`)

All components come from [shadcn/ui](https://ui.shadcn.com/) built on top of Radix UI. They are unstyled accessible primitives with Tailwind CSS styling applied. Key components used in the app:

`Button`, `Card`, `Input`, `Form`, `Dialog`, `Badge`, `Progress`, `Tabs`, `Avatar`, `Skeleton`, `Toast` / `Sonner`, `Select`, `Accordion`, `Sidebar`

---

## Hooks (`hooks/`)

| File               | Export             | Description                                    |
|--------------------|--------------------|------------------------------------------------|
| `use-language.ts`  | `useLanguage()`    | Returns current locale and `setLanguage` fn   |
| `use-mobile.ts`    | `useIsMobile()`    | Returns `true` when viewport < 768px          |
| `use-toast.ts`     | `useToast()`       | Programmatic toast notifications               |

---

## Theming

The app uses [`next-themes`](https://github.com/pacocoursey/next-themes) for dark/light mode.

- `ThemeProvider` wraps the root layout in `app/layout.tsx`
- Theme is stored in `localStorage` and respects `prefers-color-scheme`
- CSS variables for colors are defined in `app/globals.css` / `styles/globals.css`
- Tailwind CSS v4 config lives in `postcss.config.mjs`

---

## Internationalization (i18n)

Language support is custom (no external i18n library).

- Translations live in `lib/languages.ts` — a plain object keyed by locale
- `LanguageProvider` holds the current language in React context
- `useLanguage()` hook reads/sets the active language
- `ThemeLanguageSwitcher` component renders the toggle UI
- Language preference is persisted in `localStorage`

To add a new language:
1. Add a new locale key to `lib/languages.ts`
2. Fill in all translation strings
3. Add the locale to the switcher in `components/theme-language-switcher.tsx`

---

## Forms & Validation

Forms use [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) schemas via `@hookform/resolvers`.

Example pattern (sign-up form):
```tsx
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
})
```

---

## Key Dependencies

| Package              | Version  | Purpose                        |
|----------------------|----------|--------------------------------|
| `next`               | 16.2.6   | Framework                      |
| `react`              | 19       | UI library                     |
| `tailwindcss`        | 4.x      | Styling                        |
| `next-themes`        | 0.4.x    | Dark/light mode                |
| `lucide-react`       | 0.564    | Icons                          |
| `recharts`           | 2.15     | Charts in dashboard            |
| `react-qr-code`      | 2.0      | QR code generation             |
| `react-hook-form`    | 7.x      | Form state management          |
| `zod`                | 3.x      | Schema validation              |
| `sonner`             | 1.x      | Toast notifications            |
