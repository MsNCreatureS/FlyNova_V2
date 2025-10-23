# VA Dynamic Branding System

## Overview
This system allows each Virtual Airline (VA) to have its own logo and color scheme that dynamically applies throughout the application when users navigate to that VA's dashboard.

## Database Schema

The `virtual_airlines` table has been extended with the following columns:

```sql
ALTER TABLE virtual_airlines 
ADD COLUMN primary_color VARCHAR(7) DEFAULT '#00c853',
ADD COLUMN secondary_color VARCHAR(7) DEFAULT '#00a843',
ADD COLUMN accent_color VARCHAR(7) DEFAULT '#00ff7f',
ADD COLUMN text_on_primary VARCHAR(7) DEFAULT '#ffffff';
```

### Example Color Schemes

**easyJet**
- Primary: `#FF6600` (Orange)
- Secondary: `#CC5500`
- Accent: `#FFB366`
- Text: `#FFFFFF`

**Air France**
- Primary: `#003087` (Navy Blue)
- Secondary: `#002266`
- Accent: `#ED1C24` (Red)
- Text: `#FFFFFF`

**Air Canada**
- Primary: `#DC0714` (Red)
- Secondary: `#B00510`
- Accent: `#000000`
- Text: `#FFFFFF`

## Setup

### 1. Apply Database Migration

Run the SQL migration file:

```bash
mysql -u root -p flynova < add-va-branding.sql
```

Or execute manually in phpMyAdmin.

### 2. Components

#### BrandingContext (`src/contexts/BrandingContext.tsx`)
- React Context that manages VA branding state
- Sets CSS variables for dynamic theming
- Provides `useBranding()` hook

#### useVABranding Hook (`src/hooks/useVABranding.ts`)
- Custom hook that fetches VA branding data
- Automatically applies branding when VA ID changes
- Resets to default when leaving VA dashboard

### 3. Integration

The branding system is integrated in:

**Layout** (`src/app/layout.tsx`)
```tsx
<BrandingProvider>
  {children}
</BrandingProvider>
```

**NavBar** (`src/components/NavBar.tsx`)
- Detects VA dashboard context
- Shows VA logo instead of FlyNova logo
- Displays VA name in brand color

## Usage in Components

### Using CSS Variables

```tsx
<button style={{ 
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-text-on-primary)' 
}}>
  Book Flight
</button>
```

### Using CSS Classes

```tsx
<button className="btn-va-primary">
  Book Flight
</button>

<div className="bg-va-primary-light border-va-primary">
  <h2 className="text-va-primary">Welcome to {va.name}</h2>
</div>
```

### Using the Hook

```tsx
import { useBranding } from '@/contexts/BrandingContext';

function MyComponent() {
  const { colors, logoUrl, vaName } = useBranding();
  
  return (
    <div style={{ color: colors.primary }}>
      <img src={logoUrl || '/logo.png'} alt={vaName || 'FlyNova'} />
      <h1>{vaName}</h1>
    </div>
  );
}
```

## Available CSS Classes

### Buttons
- `.btn-va-primary` - Primary button with VA colors
- `.btn-va-secondary` - Secondary button with VA colors

### Text Colors
- `.text-va-primary` - Text in primary color
- `.text-va-secondary` - Text in secondary color
- `.text-va-accent` - Text in accent color

### Backgrounds
- `.bg-va-primary` - Solid primary background
- `.bg-va-secondary` - Solid secondary background
- `.bg-va-accent` - Solid accent background
- `.bg-va-primary-light` - Light primary background (10% opacity)
- `.bg-va-primary-medium` - Medium primary background (30% opacity)

### Borders
- `.border-va-primary` - Border in primary color
- `.border-va-secondary` - Border in secondary color

## CSS Variables

```css
:root {
  --color-primary: #00c853;
  --color-secondary: #00a843;
  --color-accent: #00ff7f;
  --color-text-on-primary: #ffffff;
  --color-primary-light: rgba(0, 200, 83, 0.1);
  --color-primary-medium: rgba(0, 200, 83, 0.3);
}
```

These variables are updated dynamically when entering a VA dashboard.

## API Endpoints

### Get VA with Branding
```
GET /api/virtual-airlines/:vaId
```

Returns:
```json
{
  "id": 1,
  "name": "Air Example",
  "logo_url": "/uploads/logos/air-example.png",
  "primary_color": "#FF6600",
  "secondary_color": "#CC5500",
  "accent_color": "#FFB366",
  "text_on_primary": "#FFFFFF"
}
```

## Best Practices

1. **Accessibility**: Always ensure sufficient contrast between text and background colors
2. **Fallbacks**: Components should handle missing branding gracefully
3. **Performance**: Branding is fetched once per VA dashboard visit and cached
4. **Testing**: Test with various color schemes to ensure visibility

## Automatic Features

- Logo switches automatically in NavBar when entering VA dashboard
- Colors apply to all pages within `/va/:id/pilot/*` and `/va/:id/manage/*`
- Returns to FlyNova branding when leaving VA context
- Works with server-side navigation and client-side routing

## Troubleshooting

**Colors not applying:**
- Check browser console for errors
- Verify CSS variables are set: Open DevTools → Inspect → Computed styles
- Check that BrandingProvider wraps your component tree

**Logo not showing:**
- Verify `logo_url` exists in database
- Check file exists in `/public/uploads/logos/`
- Ensure image path is relative to `/public` directory

**Branding persists after leaving VA:**
- `resetBranding()` is called automatically by the hook
- Check that `vaId` becomes `null` when leaving VA context
