# Unfluke Pro — Premium Redesign Spec (READ FIRST)

You are restyling ONE screen of a React Native (Expo Router) trading app to a
premium look. A shared design system already exists. Match it exactly.

## THE LOOK
Two themes, switched at runtime via context:
- **Light**: clean white surfaces (`#FFFFFF`) on a soft grey canvas (`#F4F4F6`),
  hairline borders, soft shadows, warm amber/gold accents on key metrics & CTAs.
- **Dark**: near-black canvas (`#0A0B0E`), charcoal cards (`#14161B`), and a
  signature **GOLD** accent (`#E9C46A`) on buttons, highlights, badges, active
  states, icons. NOT blue. Green = profit, red = loss.

Premium = generous spacing, clear type hierarchy (big bold tabular numbers for
values, tiny uppercase letter-spaced labels), rounded cards (radius 14–22),
gold gradient primary CTAs, subtle dividers. Avoid: flat grey boxes, emoji as
icons, cramped rows, hardcoded hex colors.

## HARD RULES (DO NOT VIOLATE)
1. **NEVER change logic.** Do not touch: event handlers, onPress bodies, API
   calls, redux `useSelector`/`useDispatch`/thunks, formik/yup, navigation
   (`router.push`/`replace` targets), socket code, useEffect logic, data
   transforms, conditionals that drive rendering, component props/exports.
   Only change: JSX presentation, styles, colors, icons, spacing, wrapper
   structure for visual layout.
2. **Theme everything.** Replace `const c = Colors.light` and any hardcoded
   hex strings (`#fff`, `#4f46e5`, `#111`, etc.) with theme tokens. Inside the
   component: `const { colors: c, isDark } = useTheme();`. Convert the static
   `StyleSheet.create({...})` into a factory `const makeStyles = (c: AppColors) =>
   StyleSheet.create({...})` and call `const s = makeStyles(c)` inside the
   component. If you need `isDark` in styles, pass it: `makeStyles(c, isDark)`.
3. **Keep all existing functionality working.** Every button, input, list,
   modal, chart must still render and behave the same. Preserve all `key` props,
   `testID`s, refs, and conditional renders.
4. **Reuse, don't reinvent.** Import shared primitives where they fit:
   `import { Surface, SectionLabel, GoldButton, GhostButton, ProBadge, Chip,
   DeltaText, Sparkline, StatBlock } from "@/components/ui/Premium";`
5. **Use lucide-react-native icons** (already a dependency) instead of emoji.
6. Do not run builds, installs, or git commands. Do not edit other files.
7. Keep the file's imports valid — add `useTheme`, `AppColors`, lucide icons as
   needed; remove now-unused `Colors.light` imports only if truly unused.

## IMPORTS YOU'LL TYPICALLY ADD
```ts
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
// icons e.g.: import { ChevronRight, Search } from "lucide-react-native";
```

## TOKEN REFERENCE (constants/Colors.ts → AppColors)
Core: `background, surface, surfaceElevated, card, primary`
Text: `text, textSecondary, textMuted`
Borders: `border, borderLight`
Gold: `gold, goldBright, goldDeep, goldLight (tint bg), goldMuted, onGold (text ON gold)`
Sentiment: `profit, profitBg, loss, lossBg, success, error, warning, info`
Components: `headerBg, inputBg, inputBorder, overlay`

Primary CTA = gold gradient (`<GoldButton label=... onPress=... />`) OR a
`LinearGradient colors={[c.goldBright, c.gold, c.goldDeep]}`.
Secondary = `GhostButton` (outlined).
Big values: `fontWeight:"800", fontVariant:["tabular-nums"], color:c.text`.
Tiny labels: `fontSize:11, fontWeight:"700", letterSpacing:1.2,
textTransform:"uppercase", color:c.textMuted`.

## PATTERN EXAMPLE (input row, themed)
```tsx
const { colors: c, isDark } = useTheme();
const s = makeStyles(c);
...
const makeStyles = (c: AppColors) => StyleSheet.create({
  card: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1,
          borderColor: c.border, padding: 16 },
  label: { fontSize: 13, fontWeight: "600", color: c.textSecondary },
  input: { backgroundColor: c.inputBg, borderColor: c.inputBorder,
           borderWidth: 1, borderRadius: 12, color: c.text },
});
```

## DELIVERABLE
Rewrite the assigned file in place using Edit/Write. Preserve every line of
logic. Return a short summary: what you restyled, confirmation that no logic/
handlers/redux/nav were changed, and any token you had to add.
