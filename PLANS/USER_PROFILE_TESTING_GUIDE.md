# User Profile & Registration Testing Guide

Complete guide for testing the new user profile and daily recommendations system.

---

## 🎯 What's New

### Features Implemented

1. **User Registration** (`/register`)

   - 3-step onboarding form
   - Collects: name, email, hair type, hair goals
   - Stored in `localStorage` (will be Supabase later)

2. **User Profile Page** (`/profile`)

   - View and edit profile information
   - See latest booking
   - Quick access to features

3. **Enhanced Daily Recommendations** (`/recommendations`)

   - Now requires user profile
   - Tips tailored to hair goals + booking data
   - Combines profile goals with actual booked styles

4. **Dashboard Integration**
   - Shows login status
   - "Sign Up" banner if not registered
   - "Welcome back" with profile link if registered

---

## 🧪 Complete Testing Flow

### Flow 1: New User Registration → Daily Tips

**Purpose**: Test that new users can register and immediately see personalized tips

**Steps**:

1. **Clear localStorage** (simulate new user):

   ```javascript
   // Open browser console
   localStorage.clear();
   ```

2. **Visit Dashboard**: `http://localhost:3000/dashboard`

   - ✅ Should see "Create Your Profile" banner at top
   - ✅ Banner should have "Sign Up" button

3. **Click "Sign Up"** → Should go to `/register`

4. **Step 1: Basic Info**

   - Enter name: "Test User"
   - Enter email: "test@example.com"
   - ✅ "Continue" button disabled until both filled
   - Click "Continue"

5. **Step 2: Hair Type**

   - Select hair type: "4c"
   - ✅ Selection should highlight
   - Click "Continue"

6. **Step 3: Hair Goals**

   - Select multiple goals: "Hair Growth", "Moisture Balance", "Low Maintenance"
   - ✅ Selected goals should highlight
   - ✅ Bottom shows count: "Selected: 3 goal(s)"
   - Click "Complete Registration"

7. **Redirected to `/recommendations`**

   - ✅ Should show 4-5 personalized tips
   - ✅ Tips should mention 4C hair
   - ✅ Tips should include moisture-related advice (since "Moisture Balance" was selected)
   - ✅ Tips should include growth-related advice (since "Hair Growth" was selected)
   - ✅ Top right has "View Profile" button

8. **Check Profile**: Click "View Profile"

   - ✅ Should show: Name, Email, Hair Type (4C)
   - ✅ Should show selected goals with emojis
   - ✅ "Last Booking" section should NOT appear (no booking yet)

9. **Return to Dashboard**: Click "← Dashboard"
   - ✅ Should now show "Welcome back, Test User" banner
   - ✅ Banner should have "View Profile" button

---

### Flow 2: Registered User → Book Style → Enhanced Tips

**Purpose**: Test that booking enhances recommendations for registered users

**Prerequisites**: Complete Flow 1 first (user profile exists)

**Steps**:

1. **From Dashboard**, click "Book Your Style" card

2. **Home Page** (`/`):

   - Upload a hair photo
   - Select hair type: "4c" (matches profile)
   - Select style: "Box Braids"
   - Click "Continue to Booking"

3. **Booking Flow** (`/booking-flow`):

   - **Step 1**: Review style → Click "Continue to Date Selection"
   - **Step 2**: Pick date (tomorrow) + time (2:00 PM) → Click "Continue to Stylist"
   - **Step 3**: Select stylist → Click "Review Booking"
   - **Step 4**: Review → Click "Confirm Booking"

4. **Success Screen**:

   - ✅ Shows "Booking Confirmed! 🎉"
   - ✅ Shows booking details (style, date, time, stylist)
   - ✅ Has "Get Hair Care Tips" button
   - Click "Get Hair Care Tips"

5. **Enhanced Recommendations** (`/recommendations`):

   - ✅ Should now show 4-5 tips
   - ✅ Tips should mention "Box Braids" specifically
   - ✅ Should include maintenance schedule for braids
   - ✅ Should still include goal-based tips (moisture, growth)
   - ✅ Tips are more specific than before booking

6. **Check Profile** again: Click "View Profile"
   - ✅ Should now show "Latest Booking" section
   - ✅ Shows: Style (Box Braids), Date, Stylist name

---

### Flow 3: Direct Access to Recommendations (No Profile)

**Purpose**: Test that unregistered users are prompted to register

**Steps**:

1. **Clear localStorage**:

   ```javascript
   localStorage.clear();
   ```

2. **Visit `/recommendations` directly**

3. **Should see onboarding prompt**:

   - ✅ "Create Your Profile" heading
   - ✅ Lists what info will be collected
   - ✅ Has "Create Profile" button (not "Start Booking Flow")
   - Click "Create Profile"

4. **Should go to `/register`** and follow Flow 1

---

### Flow 4: Profile Editing

**Purpose**: Test that users can update their hair goals

**Prerequisites**: User profile exists

**Steps**:

1. **Visit `/profile`**

2. **Hair Goals Section**:

   - ✅ Shows current goals as badges
   - Click "Edit" button

3. **Edit Mode**:

   - ✅ All goal options shown as toggles
   - ✅ Current goals are highlighted
   - Unselect "Low Maintenance"
   - Add "Try New Styles"
   - Click "Save"

4. **View Mode**:

   - ✅ Updated goals shown
   - ✅ "Low Maintenance" removed
   - ✅ "Try New Styles" added

5. **Test Recommendations**: Go to `/recommendations`
   - ✅ Tips should reflect new goals
   - ✅ Should NOT see low-maintenance tips anymore

---

## 📊 Data Storage Check

### What's Stored in localStorage

**After Registration**:

```javascript
localStorage.getItem('nywele-user-profile')
// Should return:
{
  "name": "Test User",
  "email": "test@example.com",
  "hairType": "4c",
  "hairGoals": ["growth", "moisture", "maintenance"],
  "createdAt": "2025-10-20T..."
}
```

**After Booking**:

```javascript
localStorage.getItem('nywele-latest-booking')
// Should return:
{
  "id": "1729...",
  "hairType": "4c",
  "desiredStyle": "box-braids",
  "stylistInfo": {
    "name": "Amara Okonkwo",
    "business": "Braids by Amara",
    "phone": "+254712345678"
  },
  "date": "2025-10-21",
  "time": "2:00 PM",
  "cost": { "min": 150, "max": 300, "duration": "6-8 weeks" },
  "bookedAt": "2025-10-20T..."
}
```

---

## ✅ Success Criteria

### Registration Flow

- [ ] All 3 steps work without errors
- [ ] Form validation works (can't proceed without filling fields)
- [ ] Profile saved to localStorage
- [ ] Redirects to recommendations after completion

### Profile Page

- [ ] Shows all user information correctly
- [ ] Edit goals functionality works
- [ ] Shows latest booking if exists
- [ ] Quick actions work (Daily Tips, Find Stylists)

### Daily Recommendations

- [ ] Shows onboarding prompt when no profile
- [ ] Shows basic tips after registration (no booking)
- [ ] Shows enhanced tips after booking
- [ ] Tips tailored to hair goals
- [ ] Tips mention specific booked style

### Dashboard Integration

- [ ] Shows correct banner based on login status
- [ ] "Sign Up" button works
- [ ] "View Profile" button works
- [ ] Profile persists across page refreshes

### Booking Integration

- [ ] Booking updates user profile if needed
- [ ] Booking data accessible to recommendations
- [ ] Success screen links to recommendations

---

## 🐛 Known Limitations (Before Supabase)

1. **No Real Authentication**: Using localStorage, not real login
2. **Single User**: localStorage only supports one user per browser
3. **No Persistence Across Devices**: Data only on current browser
4. **No Email Verification**: Email not validated
5. **No Password**: No security layer

**These will be fixed when we integrate Supabase!**

---

## 🚀 Next Steps After Testing

Once testing is complete:

1. **Supabase Integration**:

   - Create `users` table
   - Move from localStorage to database
   - Add real authentication

2. **Enhanced Recommendations**:

   - Weather-based tips
   - Time-based tips (style cycle reminders)
   - Product recommendations

3. **Booking Enhancements**:
   - Real stylist availability
   - SMS/email confirmations
   - Payment integration

---

## 📝 Testing Checklist

Copy this to track your testing:

```
Flow 1: New User Registration
[ ] Clear localStorage
[ ] See "Create Profile" banner on dashboard
[ ] Complete 3-step registration
[ ] See personalized tips
[ ] View profile shows correct info

Flow 2: Booking Enhancement
[ ] Book a style as registered user
[ ] Recommendations update with style-specific tips
[ ] Profile shows latest booking

Flow 3: Direct Recommendations Access
[ ] Without profile, see registration prompt
[ ] Click leads to /register

Flow 4: Profile Editing
[ ] Edit hair goals
[ ] Changes reflected in recommendations

Data Storage
[ ] Profile saved to localStorage
[ ] Booking saved to localStorage
[ ] Data persists on page refresh
```

---

## 🔍 Debugging Tips

**If recommendations don't show**:

```javascript
// Check if profile exists
console.log(localStorage.getItem("nywele-user-profile"));
```

**If tips aren't personalized**:

```javascript
// Check if booking exists
console.log(localStorage.getItem("nywele-latest-booking"));
```

**Reset everything**:

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

**Ready to test!** Start with Flow 1 and work through each scenario. 🚀
