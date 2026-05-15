# Play Store Publish Checklist — Unfluke

## ✅ Completed
- [x] Play Console org account created (Unfluke, ID: 6357035038822422790)
- [x] DUNS number obtained
- [x] App code fixes (signup, simulator, backtester) shipped to `test` branch
- [x] App icon 512×512 ready (`playstore-assets/icon-512.png`)
- [x] Store listing draft (`STORE_LISTING.md`)
- [x] Privacy policy draft (`PRIVACY_POLICY.md`)

## ⏳ Pending — Manager / Account Owner

### Identity verifications (in Play Console)
- [ ] **Verify organisation's website** (`unfluke.in`) — needs DNS access
- [ ] **Verify phone number** — OTP to account owner's phone

These BLOCK app publishing until done.

## ⏳ Pending — App Build & Assets

### Production build
- [ ] Bump version in `app.json` if needed (currently `1.0.0`)
- [ ] Run: `npx eas-cli build --profile production --platform android`
- [ ] Wait for `.aab` file from EAS
- [ ] Download `.aab`

### Visual assets
- [ ] Screenshots: 3-8 phone screenshots (see `SCREENSHOTS_GUIDE.md`)
- [ ] Feature graphic: 1024×500 banner
- [ ] (Optional) 7-inch tablet screenshots
- [ ] (Optional) 10-inch tablet screenshots

### Privacy policy
- [ ] Host `PRIVACY_POLICY.md` content as `https://www.unfluke.in/privacy`
  - Convert markdown to HTML
  - Add to website routes
  - Confirm publicly accessible (no login)

### Internal forms (in Play Console "Set up your app" section)
- [ ] App access — provide test login credentials for Google review
- [ ] Ads — declare yes/no
- [ ] Content rating — fill questionnaire
- [ ] Target audience — 18+
- [ ] News app — No
- [ ] COVID-19 contact tracing — No
- [ ] Data safety — fill from `STORE_LISTING.md` "Data Safety Form Answers"
- [ ] Government app — No
- [ ] **Financial features declaration** — YES (trading app)
  - May need to upload supporting docs (broker tie-up, SEBI registration, or compliance proof)

### Store listing
- [ ] App name: Unfluke
- [ ] Short description (use `STORE_LISTING.md`)
- [ ] Full description (use `STORE_LISTING.md`)
- [ ] App icon (512×512)
- [ ] Feature graphic
- [ ] Phone screenshots
- [ ] Category: Finance
- [ ] Tags
- [ ] Contact email + website + privacy URL

### Release
- [ ] Production → Create new release
- [ ] Upload `.aab`
- [ ] Release name (auto-filled from version code)
- [ ] Release notes ("Initial release of Unfluke...")
- [ ] Review and rollout to production

## After submission
- Google review takes 3-7 days for first release
- Watch the Play Console "Status" column for issues
- Common rejection reasons:
  - Privacy policy doesn't match data collection
  - Financial app without proper disclaimer
  - Missing test credentials for review
  - Permissions used but not justified
