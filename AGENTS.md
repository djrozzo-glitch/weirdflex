# Working on WeirdFlex

Read [the project context](docs/PROJECT_CONTEXT.md) for the commercial offer, homepage structure, game ownership, and deployment map. Use the current checkout and production site to confirm details before changing them.

## Scope and communication

- Communicate with the owner in Russian. Keep all website copy in concise, natural English.
- Preserve “Small games. Big ideas.” and personalization from €299. The starting package covers an existing game with agreed branding, visual elements, and promotional links. Quote new mechanics, integrations, leaderboards, and original development separately.
- Keep changes focused and preserve existing working-tree edits. Discuss major redesigns, destructive operations, DNS, credentials, and infrastructure changes with the owner first. Leave gameplay and backends in sibling game projects alone unless the owner explicitly requests changes.
- Review the diff and verify changes through their normal entry points. Make a focused commit and push to `main` when authorized and supported. Use a focused pull request if direct updates are restricted. Report the commit and the actual test and deployment status.

## Homepage and assets

- The homepage uses static HTML, CSS, and browser JavaScript. Preserve its warm off-white palette, near-black type, terracotta accent, bold editorial headlines, and consistent game artwork and actions. Add a framework or dependency only when the task needs it.
- Keep the six sections and the combined process and case-study section. Discuss any return of “Small business. Big play.” with the owner first.
- Aim for one logical section per desktop viewport where the content fits. Allow natural growth on small or short screens. Test keyboard navigation, touch, readable type, responsive heights, and horizontal overflow, with particular attention to iPhone Safari and safe areas.
- Keep first paint independent of the mascot and below-the-fold media. Optimize new images for the web, reserve their layout space, and lazy-load offscreen artwork. Update the versioned homepage references when a cached stylesheet or script changes. Check the live images, demo routes, and relevant embedded or proxied pages.
- Preserve the title, description, canonical URL, Open Graph and Twitter/X metadata, social artwork, favicon, structured data, semantic headings, and descriptive alt text. Keep internal revision identifiers out of public titles and descriptions.

## Ozzy and analytics

- Use the original illustrated sprite artwork in `assets/shiba/`. Keep Ozzy hidden until an original frame is ready. Preserve sprite proportions, original behaviors, touch drag and petting, Easter eggs, and the corresponding events. Respect reduced motion and keep important controls reachable.
- For mascot changes, check a cold load, delayed and failed first frames, background-tab resume, reduced motion, and drag on mobile. Verify both the visible behavior and what happens while artwork is pending.
- Keep PostHog opt-in and in the EU. Honor saved consent, keep session recording and autocapture disabled, and preserve existing event names and intent. Inspect current instrumentation before adding events. Keep private credentials and user data out of the repository and logs.

## Checks and release

- Serve the repository root over HTTP for local homepage checks. A static server does not run Cloudflare Pages Functions. Verify proxied routes on the deployed site or in an appropriate Pages preview.
- Relevant Node checks for VOID SIGNAL are in `voidsignal/tests/`. There is no root package manifest or homepage test runner. For homepage changes, check the affected flows at desktop and mobile sizes and verify console errors and missing assets.
- Before changing deploy configuration, inspect the tracked workflows and the existing hosting setup. After publishing, check the relevant commit status and the live route.
