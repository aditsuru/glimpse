<answer>

_March 4, 2026 — IST_

---

_<main-point>_

Let me use your actual code to teach this properly because there are real issues in it worth fixing.

---

**The spacing system problem — why random values bite you:**

When you write `p-8` here and `gap-6` there and `mt-12` somewhere else, you're making three separate decisions with no relationship to each other. The page feels inconsistent and you can't explain why. That's the actual problem CSS variables solve — not the variable itself, but forcing you to make decisions once and reuse them.

Tailwind already has a spacing scale built in. The entire scale is multiples of 4px. So `p-4` is 16px, `p-8` is 32px, `p-12` is 48px. The discipline is: **pick 3-4 values from this scale and use only those throughout a component.** Don't use p-8 in one place and p-7 in another. The eye doesn't see the difference but the inconsistency accumulates.

For your layout, a clean spacing set would be: `gap-4` for tight groupings, `gap-6` for related sections, `gap-8` for major sections. Pick it once, use it everywhere.

---

**The responsive bug in your code:**

You have `hidden lg:relative` on the sidebar. This is broken. `hidden` sets `display: none`. `lg:relative` sets `position: relative` at large screens — but it never sets `display: block` or `display: flex`, so the sidebar stays hidden even on large screens. You meant:

```tsx
// Wrong
className = "hidden lg:relative col-span-1 ...";

// Correct
className = "hidden lg:block col-span-1 ...";
```

Also your grid is `md:grid-cols-4` but the sidebar only shows at `lg`. Between `md` and `lg` you have a 4-column grid with the first column invisible — the feed will occupy `col-span-3` out of 4 columns with a ghost column next to it.

The fix is to make them consistent:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-4 w-full h-full gap-8">
  {/* sidebar — hidden below lg */}
  <div className="hidden lg:block col-span-1 ...">

  {/* feed — full width below lg, 3 cols at lg+ */}
  <div className="col-span-1 lg:col-span-3 ...">
```

---

**Mobile-first in practice — not just philosophy:**

Mobile-first means: write the mobile layout first with no breakpoint prefix, then override at larger screens with `md:` or `lg:`. The mistake most people make is writing the desktop layout and trying to hide things on mobile. That's desktop-first and creates the exact bug you have.

Your layout in mobile-first thinking:

```
Mobile:  single column, sidebar hidden, feed takes full width
Tablet:  still single column (sidebar still too cramped)
Desktop: 4-column grid, sidebar visible, feed takes 3 columns
```

Which translates to exactly:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full h-full p-4 md:p-8">
```

Notice `p-4 md:p-8` — less padding on mobile because screen space is precious, more on desktop.

---

**The Avatar size issue:**

`w-55` is not a standard Tailwind value — Tailwind's scale goes in 4-unit steps and `w-55` doesn't exist in the default config. You're likely getting a random size or it's falling through to nothing. Use `w-40` (160px) or `w-48` (192px) for a large profile avatar.

```tsx
<Avatar className="w-40 h-40">
```

Always use equal width and height for avatars otherwise it distorts.

---

**CSS variables — when they actually help:**

In your `globals.css` or Tailwind config, you can define tokens:

```css
:root {
	--sidebar-width: 280px;
	--content-max-width: 680px;
	--radius-card: 2rem;
}
```

This matters when the same value appears in 5+ places. If you want to change your card border radius across the whole app, you change one variable. But for a component you're building now — don't add this overhead yet. Tailwind's built-in scale is enough until you find yourself copying the same arbitrary value repeatedly.

---

**Your code cleaned up:**

```tsx
export default function Home() {
	return (
		<div className="w-screen h-screen p-4 md:p-8">
			<div className="grid grid-cols-1 lg:grid-cols-4 w-full h-full gap-6">
				{/* Sidebar — hidden on mobile and tablet */}
				<div className="hidden lg:flex flex-col col-span-1 min-h-full bg-background rounded-3xl">
					<div className="flex flex-col items-center gap-4 mt-12">
						<Avatar className="w-40 h-40">
							<AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
							<AvatarFallback>CN</AvatarFallback>
						</Avatar>
						<div className="flex flex-col items-center">
							<h1 className="text-2xl font-semibold">User Name</h1>
							<h2 className="text-base text-muted-foreground">@username</h2>
						</div>
					</div>
				</div>

				{/* Feed — full width on mobile, 3 cols on desktop */}
				<div className="col-span-1 lg:col-span-3 min-h-full bg-background brightness-95 rounded-3xl" />
			</div>
		</div>
	);
}
```

Three changes worth noting: `text-gray-600` became `text-muted-foreground` because shadcn's semantic tokens respect dark mode automatically — hardcoded gray doesn't. `rounded-4xl` became `rounded-3xl` because `4xl` isn't in Tailwind's default scale. And `hidden lg:relative` became `hidden lg:flex` which actually makes it visible.

_</main-point>_

_<conclusion>_
Your main bugs: `hidden lg:relative` never shows the sidebar, mismatched breakpoints between grid and sidebar visibility, `w-55` isn't a real Tailwind value, `text-gray-600` breaks dark mode. Mobile-first means write mobile with no prefix, add breakpoints to override upward. Spacing discipline means pick 3-4 values from the scale and stick to them. CSS variables help when the same arbitrary value repeats across many files — not needed yet.
_</conclusion>_

</answer>
