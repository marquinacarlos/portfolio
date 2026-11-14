# Parked pages

Blog and Services are parked here on purpose (folders that start with `_` are private in
Next.js: they do NOT create routes). They are hidden until they have real content.

To bring one back:
1. Move the folder back to `app/[lang]/` (for example `_parked/blog` -> `blog`).
2. Add its entry to `navRoutes` in `lib/routes.ts` (see the commented examples there).
3. Add `routeEndLinks(...)` back to the last section of the previous route (see `app/[lang]/page.tsx`).
