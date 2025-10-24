# Quick Test: Job Spec & Matching Flow

## 5-Minute Test Script

### Setup

```bash
# Server should be running at http://localhost:3000
# Clear localStorage to start fresh (optional)
localStorage.clear();
```

---

## Test 1: Customer Books with Spec (3 min)

### Step 1: Start Booking

1. Go to `http://localhost:3000`
2. Click "Book Your Style"
3. Upload a hair photo (any image)
4. Select hair type: **4c**
5. Select style: **Knotless Braids**
6. Click "Continue to Booking"

### Step 2: Review Spec

**Expected**: You should see a purple/pink box showing:

- ⏰ Time Estimate: 6-8 hours
- 📦 Required Products:
  - Xpression braiding hair (6-8 packs) @ KES 1,200 each = KES 7,200-9,600
  - Edge control (1) @ KES 300 = KES 300
  - Shine spray (1) @ KES 400 = KES 400
- 💰 Total Materials: KES 7,900-10,300
- ✅ Min. Hair Length: 2 inches
- ✅ Suitable for: 4A, 4B, 4C
- ✅ Skill Level: Intermediate

**Action**: Click "Continue to Date Selection"

### Step 3: Choose Date & Time

1. Select tomorrow's date
2. Select time: 10:00 AM
3. Click "Continue to Stylist"

### Step 4: Smart Matching

**Expected**: You should see **only stylists with knotless-braids skill**:

- ✅ Amara Okonkwo (Braids by Amara) - has skill + 10 hours available
- ❌ Others filtered out (no knotless-braids skill)

**Action**:

1. Click on Amara Okonkwo
2. Click "Review Booking"

### Step 5: Confirm

**Expected**: Review screen shows:

- Style: Knotless Braids
- Date: Tomorrow
- Time: 10:00 AM
- Stylist: Amara Okonkwo

**Action**: Click "Confirm Booking"

### Step 6: Check Status

**Expected**: Success screen shows:

- ✅ "Booking Confirmed! 🎉"
- ⏳ Status badge: "Waiting for Quote"
- Booking details visible

✅ **Test 1 Complete**: Job created and waiting for braider

---

## Test 2: Braider Submits Quote (1 min)

### Step 1: Access Braider Dashboard

1. Go to `http://localhost:3000/dashboard`
2. Click "Braider Dashboard" (green card)

### Step 2: View Inbox

**Expected**:

- Job appears in inbox
- Shows: "Knotless Box Braids (Medium)"
- Customer info: 4C, Tomorrow, 10:00 AM
- Time: 6-8 hours
- Materials: KES 7,900-10,300

**Action**: Click "Review & Submit Quote"

### Step 3: Edit Quote

**Expected**: QuoteEditor opens with:

- Pre-filled products from spec
- Default labor cost: KES 5,000

**Action**:

1. Optionally adjust products/labor
2. Add notes: "Includes scalp treatment"
3. Review total (should be ~KES 12,900-15,300)
4. Click "Submit Quote"

✅ **Test 2 Complete**: Quote submitted

---

## Test 3: Customer Approves Quote (1 min)

### Step 1: Return to Booking

1. Go back to booking success page (or use browser back)
2. Refresh if needed

### Step 2: View Quote

**Expected**:

- 💰 Status badge: "Quote Received"
- "View Quote" link appears

**Action**: Click "View Quote"

### Step 3: Review Quote Modal

**Expected**: Modal shows:

- Quote from Amara Okonkwo
- Products list with costs
- Labor cost: KES 5,000
- Total: KES 12,900-15,300
- Notes: "Includes scalp treatment"

**Action**: Click "✅ Approve Quote"

### Step 4: Confirmation

**Expected**:

- Alert: "Booking confirmed! Your stylist will be notified."
- Status badge updates to: ✅ "Confirmed"
- Quote button disappears

✅ **Test 3 Complete**: Full flow tested!

---

## Quick Verification Checklist

### Spec Generation

- [ ] Products list shows correct items
- [ ] Quantities show ranges (e.g., 6-8 packs)
- [ ] Unit costs are in KES
- [ ] Subtotals calculated correctly
- [ ] Total materials sum is correct
- [ ] Time estimate shows hours
- [ ] Hair requirements displayed

### Smart Matching

- [ ] Only stylists with required skill appear
- [ ] Stylists without enough hours filtered out
- [ ] Higher-rated stylists appear first
- [ ] All matched stylists can complete the job

### Braider Dashboard

- [ ] Job appears in inbox
- [ ] Spec details visible
- [ ] QuoteEditor pre-filled correctly
- [ ] Can add/remove products
- [ ] Total calculates in real-time
- [ ] Quote submits successfully

### Customer Quote Approval

- [ ] Status updates from "Waiting" to "Quote Received"
- [ ] "View Quote" button appears
- [ ] Modal shows all quote details
- [ ] Can approve quote
- [ ] Status updates to "Confirmed"

---

## Test Other Styles

### Goddess Locs (Advanced, 6-10 hours)

```
1. Select "Goddess Locs"
2. Step 1: Verify 6-10 hours, KES 11,650-15,950 materials
3. Step 3: Only Thandiwe Mwangi appears (12 hours available)
4. Others filtered (not enough hours)
```

### Two Strand Twists (Beginner, 3-5 hours)

```
1. Select "Two Strand Twists"
2. Step 1: Verify 3-5 hours, KES 1,550 materials
3. Step 3: Njeri Wambui appears (8 hours available)
4. Simple, quick style
```

---

## Troubleshooting

### Issue: No spec shows in Step 1

**Fix**: Check style name mapping in `mapStyleToTemplateSlug()`. Style name must match template key.

### Issue: No stylists appear in Step 3

**Fix**: Check if any stylist has the required skill in their `skills` array. May need to add style to stylist skills.

### Issue: Quote doesn't appear after submission

**Fix**: Refresh the booking success page. LocalStorage requires manual refresh without real-time sync.

### Issue: Can't see braider dashboard

**Fix**: Go to `/dashboard` and look for green "Braider Dashboard" card. Should be 4th item.

---

## Data Inspection (Browser Console)

```javascript
// View latest booking
JSON.parse(localStorage.getItem("nywele-latest-booking"));

// View jobs inbox
JSON.parse(localStorage.getItem("nywele-jobs-inbox"));

// View quote (replace BOOKING_ID)
JSON.parse(localStorage.getItem("nywele-quote-BOOKING_ID"));

// Clear all data
localStorage.clear();
```

---

## Success! 🎉

If all tests pass, you have:

- ✅ Working job spec generation
- ✅ Smart stylist matching
- ✅ Braider quote submission
- ✅ Customer quote approval
- ✅ End-to-end booking flow

**Next**: Gather feedback, plan Supabase migration, add AI enhancements

