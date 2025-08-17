# Frontend UI Components Rule

## Shadcn Component Usage for Svelte Development

**TRIGGER CONDITIONS**: Apply this rule when refactoring frontend code, creating new pages/components, or working with any Svelte files in this project.

### 1. PRIORITIZE SHADCN COMPONENTS

Always use reusable Shadcn components from `$lib/components/ui/` first before considering HTML elements.

**Available Components**:

- `Button` - Interactive buttons with variants
- `Input` - Form input fields
- `Label` - Form labels
- `Alert`, `AlertDescription`, `AlertTitle` - Alert notifications
- `Card` - Container components (namespace import)
- `Sidebar` - Navigation sidebar components (namespace import)
- `DropdownMenu` - Dropdown menu components (namespace import)
- `Collapsible` - Collapsible content components (namespace import)
- `Select` - Select dropdown components (namespace import)
- `Badge` - Status badges and tags
- `Carousel` - Image/content carousels (namespace import)
- `Skeleton` - Loading placeholders
- `Toggle` - Toggle switches
- `Tooltip` - Hover tooltips
- `Sheet` - Modal/drawer components
- `Separator` - Visual separators

### 2. IMPORT PATTERNS

Follow these consistent import patterns:

**Individual components**:

```javascript
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Badge } from '$lib/components/ui/badge';
```

**Namespaced components**:

```javascript
import * as Card from '$lib/components/ui/card';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import * as Carousel from '$lib/components/ui/carousel';
```

### 3. FALLBACK STRATEGY

Only use basic HTML elements (`div`, `span`, `p`, `section`, etc.) when:

- No suitable Shadcn component exists for the specific UI requirement
- You've verified by checking the full `$lib/components/ui/` directory structure
- The requirement is for semantic HTML structure rather than styled UI components

### 4. COMPONENT DISCOVERY PROCESS

Before defaulting to HTML elements:

1. Check the `$lib/components/ui/index.ts` file for available exports
2. Look through the ui/ directory structure for suitable components
3. Consider component variants (e.g., Alert has AlertDescription and AlertTitle)
4. Check existing project files for usage patterns

### 5. CONSISTENCY GOALS

- Maintain consistent styling and behavior across the application
- Leverage the existing Shadcn design system
- Avoid creating custom solutions when Shadcn components suffice
- Ensure accessibility and responsive design through pre-built components

### 6. IMPLEMENTATION NOTES

- Always check existing imports in the current file for patterns
- Use TypeScript interfaces provided by the components
- Follow the component's intended usage as demonstrated in existing project files
- Consider the component's built-in variants and props before customization
