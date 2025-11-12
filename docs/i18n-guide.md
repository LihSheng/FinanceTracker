# i18n Implementation Guide

## Overview

This project uses `react-i18next` for internationalization with translations organized by module.

## Structure

```
public/locales/
├── en/
│   ├── common.json       # Common translations (buttons, errors, etc.)
│   ├── goals.json        # Goals module translations
│   ├── portfolio.json    # Portfolio module translations
│   ├── transactions.json # Transactions module translations
│   ├── budgets.json      # Budgets module translations
│   ├── alerts.json       # Alerts module translations
│   ├── notifications.json# Notifications module translations
│   └── journal.json      # Journal module translations
├── ms/                   # Malay translations (to be added)
└── zh/                   # Chinese translations (to be added)
```

## Usage

### In Components

```tsx
'use client';

import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  // Load specific namespaces
  const { t } = useTranslation(['goals', 'common']);

  return (
    <div>
      <h1>{t('goals:title')}</h1>
      <p>{t('goals:subtitle')}</p>
      <button>{t('common:save')}</button>
    </div>
  );
}
```

### With Interpolation

```tsx
// In translation file
{
  "welcome_message": "Welcome, {{name}}!"
}

// In component
<p>{t('common:welcome_message', { name: userName })}</p>
```

### Language Switcher

Add the `LanguageSwitcher` component to your layout:

```tsx
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

<LanguageSwitcher />
```

## Adding New Translations

### 1. Add to English (en)

Create or update the appropriate JSON file in `public/locales/en/`:

```json
{
  "new_key": "New translation",
  "nested": {
    "key": "Nested translation"
  }
}
```

### 2. Add to Other Languages

Repeat for `ms/` and `zh/` directories.

### 3. Import in i18n-client.ts

```typescript
import newModuleEN from '@/public/locales/en/new-module.json';

const resources = {
  en: {
    // ... existing
    newModule: newModuleEN,
  },
};
```

## Best Practices

1. **Namespace by Module**: Keep translations organized by feature/module
2. **Common Translations**: Put reusable text in `common.json`
3. **Consistent Keys**: Use snake_case for translation keys
4. **Nested Objects**: Group related translations
5. **Interpolation**: Use `{{variable}}` for dynamic content
6. **Pluralization**: Use i18next pluralization features when needed

## Translation Key Naming Convention

- `title` - Page/section titles
- `subtitle` - Page/section subtitles
- `messages.*` - Success/error messages
- `confirm.*` - Confirmation dialog text
- `validation.*` - Form validation messages
- `actions.*` - Button/action labels

## Example: Complete Module Translation

```json
{
  "title": "Module Title",
  "subtitle": "Module description",
  "create": "Create New",
  "edit": "Edit",
  "delete": "Delete",
  "messages": {
    "created": "Created successfully",
    "updated": "Updated successfully",
    "deleted": "Deleted successfully",
    "load_failed": "Failed to load data"
  },
  "confirm": {
    "delete_title": "Delete Item",
    "delete_message": "Are you sure you want to delete this item?"
  },
  "fields": {
    "name": "Name",
    "description": "Description",
    "amount": "Amount"
  }
}
```

## Supported Languages

- English (en) - Default
- Bahasa Melayu (ms) - To be implemented
- 中文 (zh) - To be implemented

## Adding a New Language

1. Create directory: `public/locales/[locale]/`
2. Copy all JSON files from `en/` directory
3. Translate all values (keep keys the same)
4. Update `lib/i18n-client.ts` to import new translations
5. Add language option to `LanguageSwitcher` component
