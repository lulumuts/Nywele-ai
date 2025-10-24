# Supabase Authentication Implementation Plan

## 🎯 Goal

Replace the current `localStorage` user profile system with proper Supabase authentication and database storage.

---

## 📋 Current State Analysis

### ✅ What's Already Set Up

1. **Supabase Package**: `@supabase/supabase-js` v2.75.1 installed
2. **Supabase Client**: `lib/supabase.ts` exists with basic client setup
3. **User Profile Pages**: Registration, Profile, Recommendations all built
4. **Data Structure**: Clear user profile schema already defined

### ❌ What's Missing

1. **Environment Variables**: Supabase URL and keys not configured
2. **Database Schema**: Users table doesn't exist
3. **Authentication Flow**: No login/logout/signup integration
4. **Protected Routes**: No auth checks on pages
5. **Session Management**: Using localStorage instead of Supabase sessions

### 📊 Current User Profile Structure (localStorage)

```typescript
{
  name: string;
  email: string;
  hairType: '4a' | '4b' | '4c';
  hairGoals: string[];
  createdAt: string;
}
```

---

## 🗺️ Implementation Plan

### **Phase 1: Supabase Setup** (15 minutes)

#### 1.1 Environment Configuration

**What**: Add Supabase credentials to `.env.local`

**Files to create/modify**:

- `.env.local` (create if doesn't exist)

**Variables needed**:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**How to get credentials**:

1. Go to [supabase.com](https://supabase.com)
2. Open your project (or create new one)
3. Settings → API → Copy URL and anon key

#### 1.2 Database Schema

**What**: Create users table in Supabase

**SQL to run** (in Supabase SQL Editor):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users_profiles table (extends Supabase auth.users)
CREATE TABLE public.users_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hair_type TEXT NOT NULL CHECK (hair_type IN ('4a', '4b', '4c')),
  hair_goals TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hair_type TEXT NOT NULL,
  desired_style TEXT NOT NULL,
  stylist_name TEXT,
  stylist_business TEXT,
  stylist_phone TEXT,
  appointment_date DATE,
  appointment_time TEXT,
  cost_min INTEGER,
  cost_max INTEGER,
  cost_duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users_profiles
CREATE POLICY "Users can view own profile"
  ON public.users_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings"
  ON public.bookings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_users_profiles_hair_type ON public.users_profiles(hair_type);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_appointment_date ON public.bookings(appointment_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users_profiles
CREATE TRIGGER update_users_profiles_updated_at
  BEFORE UPDATE ON public.users_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Why this structure?**

- `users_profiles` extends Supabase's built-in `auth.users`
- Separates auth data (email, password) from profile data (name, hair type)
- `bookings` table stores all booking history (not just latest)
- RLS ensures users can only access their own data

---

### **Phase 2: Supabase Client Enhancement** (10 minutes)

#### 2.1 Update Supabase Client

**What**: Add authentication helpers and TypeScript types

**File**: `lib/supabase.ts`

**Add**:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// TypeScript types
export interface UserProfile {
  id: string;
  name: string;
  hair_type: "4a" | "4b" | "4c";
  hair_goals: string[];
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  hair_type: string;
  desired_style: string;
  stylist_name?: string;
  stylist_business?: string;
  stylist_phone?: string;
  appointment_date?: string;
  appointment_time?: string;
  cost_min?: number;
  cost_max?: number;
  cost_duration?: string;
  created_at: string;
}

// Helper functions
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("users_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data as UserProfile;
}

export async function getLatestBooking(userId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return data as Booking | null;
}

export async function signOut() {
  await supabase.auth.signOut();
}
```

#### 2.2 Create Auth Context

**What**: React context for managing auth state across app

**File**: `lib/AuthContext.tsx` (new)

**Purpose**:

- Centralized auth state management
- Auto-refresh on auth changes
- Easy access to user/profile anywhere in app

---

### **Phase 3: Update Registration Flow** (20 minutes)

#### 3.1 Modify Registration Page

**What**: Replace localStorage with Supabase auth + database

**File**: `app/register/page.tsx`

**Changes**:

1. Import Supabase client
2. On form submit:
   - Call `supabase.auth.signUp()` with email/password
   - Create profile in `users_profiles` table
   - Redirect to recommendations
3. Add password field to form
4. Add error handling for existing emails

**New Flow**:

```typescript
const handleSubmit = async () => {
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password, // New field
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (authError) {
    // Handle error (email already exists, etc.)
    return;
  }

  // 2. Create profile
  const { error: profileError } = await supabase.from("users_profiles").insert({
    id: authData.user!.id,
    name,
    hair_type: hairType,
    hair_goals: selectedGoals,
  });

  if (profileError) {
    // Handle error
    return;
  }

  // 3. Redirect
  router.push("/recommendations");
};
```

---

### **Phase 4: Add Login Page** (15 minutes)

#### 4.1 Create Login Page

**What**: New page for existing users to log in

**File**: `app/login/page.tsx` (new)

**Features**:

- Email + password form
- "Forgot password" link
- Link to registration
- Error handling
- Redirect to dashboard after login

**Flow**:

```typescript
const handleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError(error.message);
    return;
  }

  router.push("/dashboard");
};
```

---

### **Phase 5: Update Profile Page** (15 minutes)

#### 5.1 Fetch from Supabase

**What**: Replace localStorage reads with Supabase queries

**File**: `app/profile/page.tsx`

**Changes**:

1. On page load: Fetch user profile from database
2. On save: Update database instead of localStorage
3. Fetch latest booking from bookings table
4. Add "Sign Out" button

**New data fetching**:

```typescript
useEffect(() => {
  async function loadProfile() {
    const user = await getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const profile = await getUserProfile(user.id);
    setProfile(profile);

    const booking = await getLatestBooking(user.id);
    setLatestBooking(booking);
  }

  loadProfile();
}, []);
```

---

### **Phase 6: Update Recommendations Page** (10 minutes)

#### 6.1 Check Auth State

**What**: Fetch profile from database, redirect if not logged in

**File**: `app/recommendations/page.tsx`

**Changes**:

1. Check if user is logged in
2. Fetch profile from database
3. Fetch latest booking from database
4. Update registration prompt to link to login/register

---

### **Phase 7: Update Booking Flow** (10 minutes)

#### 7.1 Save to Database

**What**: Save bookings to Supabase instead of localStorage

**File**: `app/booking-flow/page.tsx`

**Changes**:

1. On confirm: Insert booking into `bookings` table
2. Link booking to authenticated user
3. Handle errors

**New save logic**:

```typescript
const handleConfirmBooking = async () => {
  const user = await getCurrentUser();

  const { error } = await supabase.from("bookings").insert({
    user_id: user!.id,
    hair_type: hairType,
    desired_style: desiredStyle,
    stylist_name: selectedStylist?.name,
    stylist_business: selectedStylist?.business_name,
    stylist_phone: selectedStylist?.phone,
    appointment_date: selectedDate,
    appointment_time: selectedTime,
    cost_min: styleCost.min,
    cost_max: styleCost.max,
    cost_duration: styleCost.duration,
  });

  if (error) {
    // Handle error
    return;
  }

  setBookingConfirmed(true);
};
```

---

### **Phase 8: Update Dashboard** (10 minutes)

#### 8.1 Show Auth Status

**What**: Display login/logout based on Supabase session

**File**: `app/dashboard/page.tsx`

**Changes**:

1. Check Supabase auth session
2. If logged in: Show "Welcome back, [Name]" + profile link
3. If not logged in: Show "Login" or "Sign Up" buttons
4. Fetch user name from database

---

### **Phase 9: Protected Routes** (15 minutes)

#### 9.1 Add Auth Middleware

**What**: Redirect unauthenticated users from protected pages

**File**: `middleware.ts` (new, root directory)

**Purpose**:

- Automatically check auth on every page load
- Redirect to `/login` if not authenticated
- Allow public pages (home, stylists, how-it-works)

**Code**:

```typescript
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  const protectedPaths = ["/profile", "/recommendations", "/booking-flow"];
  const isProtected = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}
```

---

### **Phase 10: Auth Callback Handler** (5 minutes)

#### 10.1 Email Verification Callback

**What**: Handle email confirmation redirects

**File**: `app/auth/callback/route.ts` (new)

**Purpose**: Supabase email links redirect here after verification

---

### **Phase 11: Password Reset** (10 minutes)

#### 11.1 Forgot Password Page

**What**: Allow users to reset passwords

**File**: `app/forgot-password/page.tsx` (new)

**Features**:

- Email input
- Send reset link via Supabase
- Success message

---

### **Phase 12: Migration & Testing** (30 minutes)

#### 12.1 Data Migration (Optional)

**What**: Migrate any existing localStorage data to Supabase

**Strategy**:

- Create migration script
- Run once to move test data
- Or just start fresh

#### 12.2 Testing Checklist

- [ ] User can register with email + password
- [ ] User receives confirmation email
- [ ] User can log in
- [ ] User can view profile
- [ ] User can edit hair goals
- [ ] User can book a style
- [ ] Booking saves to database
- [ ] Recommendations show personalized tips
- [ ] User can log out
- [ ] Protected pages redirect to login
- [ ] Password reset works

---

## 📦 Additional Dependencies Needed

```bash
npm install @supabase/auth-helpers-nextjs
```

**Why?**: Provides Next.js-specific helpers for:

- Middleware auth checks
- Server-side rendering with auth
- Cookie-based sessions

---

## 🔄 Migration Strategy

### Option 1: Fresh Start (Recommended)

- Deploy new auth system
- Existing localStorage data expires naturally
- Users create new accounts with proper auth

### Option 2: Manual Migration

- Add one-time migration page
- Detect localStorage data
- Prompt user to create account with that data
- Move data to Supabase
- Clear localStorage

---

## 📊 Files to Create

1. `lib/AuthContext.tsx` - Auth state management
2. `app/login/page.tsx` - Login page
3. `app/forgot-password/page.tsx` - Password reset
4. `app/auth/callback/route.ts` - Email verification handler
5. `middleware.ts` - Protected routes
6. `SUPABASE_AUTH_SETUP.md` - Setup instructions

---

## 📝 Files to Modify

1. `lib/supabase.ts` - Add helper functions
2. `app/register/page.tsx` - Add password, use Supabase
3. `app/profile/page.tsx` - Fetch from database
4. `app/recommendations/page.tsx` - Check auth, fetch from DB
5. `app/booking-flow/page.tsx` - Save to database
6. `app/dashboard/page.tsx` - Show auth status
7. `.env.local` - Add Supabase credentials

---

## ⏱️ Estimated Time

- **Phase 1**: Supabase Setup (15 min)
- **Phase 2**: Client Enhancement (10 min)
- **Phase 3**: Registration (20 min)
- **Phase 4**: Login Page (15 min)
- **Phase 5**: Profile Page (15 min)
- **Phase 6**: Recommendations (10 min)
- **Phase 7**: Booking Flow (10 min)
- **Phase 8**: Dashboard (10 min)
- **Phase 9**: Protected Routes (15 min)
- **Phase 10**: Auth Callback (5 min)
- **Phase 11**: Password Reset (10 min)
- **Phase 12**: Testing (30 min)

**Total**: ~2.5-3 hours for complete implementation

---

## 🎯 Success Criteria

After implementation:

- ✅ No more localStorage for user data
- ✅ Real authentication with email/password
- ✅ Users can login from any device
- ✅ Password reset functionality
- ✅ Protected routes automatically redirect
- ✅ All bookings stored in database
- ✅ Profile persists across devices
- ✅ Row-level security protects user data

---

## 🚀 Next Steps After Auth

Once Supabase auth is working:

1. **Email Verification**: Require email confirmation
2. **Social Login**: Add Google/GitHub OAuth
3. **Booking History**: Show all past bookings
4. **Email Notifications**: Appointment reminders
5. **Profile Photos**: Upload to Supabase Storage
6. **Analytics Integration**: Track authenticated user behavior

---

## 📚 Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## ⚠️ Important Notes

1. **Breaking Change**: Existing localStorage data won't automatically transfer
2. **Email Required**: Users need valid emails for Supabase auth
3. **Password Security**: Supabase handles hashing/security
4. **Session Management**: Uses secure HTTP-only cookies
5. **Production Ready**: RLS policies protect data in production

---

## 🎉 Benefits of This Approach

1. **Security**: Proper authentication, password hashing, RLS
2. **Scalability**: Database-backed, not browser-limited
3. **Multi-Device**: Login from anywhere
4. **Persistence**: Data doesn't disappear if localStorage clears
5. **Features**: Email verification, password reset, OAuth ready
6. **Analytics**: Track real users across sessions
7. **Production Ready**: Battle-tested Supabase infrastructure

---

**Ready to implement?** Start with Phase 1 (Supabase Setup) and work through each phase systematically. Each phase can be tested independently before moving to the next! 🚀
