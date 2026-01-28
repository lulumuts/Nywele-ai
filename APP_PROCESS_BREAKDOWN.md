# Nywele.ai - Complete Process Breakdown

## 📱 Application Overview

**Nywele.ai** is an AI-powered African hair care platform that provides personalized hair analysis, style recommendations, booking services, and comprehensive hair care routines.

---

## 🚪 Entry Points

### 1. **Home Page** (`/`)

- **Intro Animation**: GSAP-powered animated intro (can be skipped)
- **Default Redirect**: Automatically redirects to `/dashboard` after intro
- **Direct Access**: Users can navigate directly to any page via URL

### 2. **Dashboard** (`/dashboard`)

- **Main Hub**: Central navigation point for all features
- **Profile Check**: Detects if user has profile
- **Welcome Message**: Personalized greeting if profile exists
- **Quick Actions**: Links to all major features

---

## 🔄 Main User Flows

### **Flow 1: New User Registration → Hair Care**

```
Dashboard (/dashboard)
  ↓ (No profile detected)
  → Shows "Create Your Profile" CTA
  ↓ Click "Sign Up" or "Get Started"

Register Page (/register)
  ↓ Step 1: Basic Info
  - Name
  - Email
  ↓ Step 2: Hair Type
  - Select: 4a, 4b, or 4c
  ↓ Step 3: Hair Goals
  - Select multiple goals (growth, moisture, health, etc.)
  ↓ Step 4: Optional Details (Expandable)
  - Porosity (low/normal/high)
  - Length (short/medium/long)
  - Concerns (dryness, breakage, etc.)
  - Budget (low/medium/high)
  - Climate (dry/humid/temperate)
  - Advanced: Density, strand thickness, elasticity, scalp condition
  - Allergies, sensitivities, preferences
  - Lifestyle: wash frequency, protective style frequency, activity level
  ↓ Complete Registration
  → Redirects to /hair-care
```

### **Flow 2: Hair Care Routine Generation**

```
Hair Care Page (/hair-care)
  ↓ Step 0: Profile Check
  - If no profile → redirects to /register

  ↓ Step 1: Name & Email (if not in profile)
  - Collects basic info

  ↓ Step 2: Upload Hair Photo
  - Drag & drop or click to upload
  - Image validation (max 10MB)
  - Photo stored in state

  ↓ Step 3: AI Analysis (Automatic)
  - Uploads to /api/analyze-image
  - Google Vision API analyzes:
    * Hair type detection
    * Health score
    * Length, density, texture, volume
    * Shine, frizz levels
    * Damage assessment
    * Detected style
    * Color treatment detection
    * Product residues
    * Scalp health
    * Dominant colors
  - Gemini AI Health Analysis:
    * Curl pattern
    * Porosity
    * Strand thickness
    * Health indicators (moisture, protein, scalp, SSKs, split ends, heat damage)
    * Recommendations (immediate actions, products, techniques, schedule)

  ↓ Analysis Results Display
  - Overall Quality Score (0-100)
  - Primary Metrics Grid (Hair Type, Health, Length, Density, Texture, Volume)
  - Condition Metrics (Shine, Frizz)
  - Gemini Health Score (progress bar)
  - Hair Characteristics
  - Health Indicators (color-coded)
  - Recommendations (expandable)
  - Damage Assessment
  - Detected Style
  - Color Treatment
  - Product Residues
  - Scalp Health
  - Detected Features (labels)
  - Dominant Colors (swatches)

  ↓ Step 4: Generate Routine
  - Click "Generate My Routine"
  - Calls /api/hair-care-routine
  - AI generates personalized routine:
    * Daily routine steps
    * Weekly routine steps
    * Monthly routine steps
    * Product recommendations
    * Maintenance schedule
    * Expected results
    * Stylist tips

  ↓ Routine Results Display
  - "You Can Expect" section (expandable)
  - Tab Navigation: Routine / Maintenance / Products / Tips
  - Save Routine button (saves to profile)
  - View saved routines from profile
```

### **Flow 3: Style Booking**

```
Home Page (/)
  ↓ Upload Current Hair Photo
  - Optional: Upload inspiration photo
  ↓ Select Desired Style
  - Choose from 8 styles OR upload inspiration
  - Styles: Box Braids, Knotless Braids, Senegalese Twists,
            Faux Locs, Cornrows, Two-Strand Twists,
            Passion Twists, Goddess Locs
  ↓ Click "Find My Perfect Stylist"
  → Redirects to /booking-flow

Booking Flow (/booking-flow)
  ↓ Step 0: Style Selection
  - Enter desired style name
  - Select budget range
  - Select time preference
  - Optional: Upload inspiration photo for AI detection

  ↓ Step 1: Review Style
  - Shows uploaded hair photo
  - Shows style image (from library or AI-generated)
  - Displays cost estimate
  - Shows duration (weeks)
  - Shows maintenance level
  - Job spec generated automatically
  ↓ Click "Continue to Date Selection"

  ↓ Step 2: Choose Date & Time
  - Calendar view (next 14 days)
  - Time slots (9 AM - 4 PM, hourly)
  - Selected date/time stored
  ↓ Click "Continue to Stylist Selection"

  ↓ Step 3: Choose Stylist
  - System matches stylists by:
    * Style specialty (must have skill)
    * Availability (hours per day)
    * Budget match (price range)
    * Rating (sorted highest first)
  - Displays 3-5 matched stylists
  - Each card shows:
    * Rating & reviews
    * Location
    * Price range ($, $$, $$$)
    * Phone & Instagram
    * Specialties tags
  - Select stylist
  ↓ Click "Continue to Confirmation"

  ↓ Step 4: Confirm Booking
  - Review all selections
  - Job spec summary
  - Booking status: "pending_quote"
  - Stylist receives job spec
  ↓ Click "Confirm Booking"
  → Success screen
  - Booking confirmed
  - Stylist contact info
  - Next steps
```

### **Flow 4: Profile Management**

```
Profile Page (/profile)
  ↓ View Profile
  - Personal info (name, email)
  - Hair type
  - Hair goals (editable)
  - Concerns (editable)
  - Advanced details (editable)
  - Saved routines (cards)

  ↓ Edit Mode
  - Toggle edit for each section
  - Update goals, concerns, details
  - Save changes → Updates localStorage

  ↓ View Saved Routines
  - Click routine card
  - Opens routine in /hair-care?view=saved
  - Can delete routines
```

### **Flow 5: Recommendations**

```
Recommendations Page (/recommendations)
  ↓ Profile Check
  - If no profile → Shows registration prompt
  - If profile exists → Shows personalized tips

  ↓ Display Tips
  - Based on:
    * Hair type
    * Hair goals
    * Current concerns
    * Latest booking (if exists)
  - 4-5 personalized daily tips
  - Actionable care instructions
  - Cost-effective maintenance tips
```

### **Flow 6: Analytics**

```
Analytics Page (/analytics)
  ↓ Load Stats
  - Calls getAnalyticsStats()
  - Fetches from Supabase analytics_events table

  ↓ Display Metrics
  - Total recommendations
  - Total style generations
  - Total product clicks
  - Total salon views
  - AI success rate
  - Popular hair types
  - Popular styles
  - Popular products
  - Recent activity
```

---

## 🎯 Core Features

### **1. AI Hair Analysis**

- **Vision API Integration**: Google Cloud Vision API
- **Gemini AI Health Analysis**: Deep health assessment
- **Metrics Tracked**:
  - Hair type (4a/4b/4c) with confidence
  - Overall quality score (0-100)
  - Health score
  - Length, density, texture, volume
  - Shine, frizz levels
  - Damage severity & types
  - Detected style
  - Color treatment
  - Product residues
  - Scalp health
  - Dominant colors

### **2. Hair Care Routine Generator**

- **AI-Powered**: GPT-4 generates personalized routines
- **Components**:
  - Daily routine (morning refresh, scalp care, night protection)
  - Weekly routine (cleansing, deep conditioning, treatments)
  - Monthly routine (clarifying, hot oil, trimming)
  - Product recommendations (with alternatives)
  - Maintenance schedule
  - Expected results timeline
  - Stylist tips

### **3. Style Booking System**

- **18 Available Styles**:
  - Protective: Box Braids, Knotless Braids, Cornrows, Senegalese Twists, Passion Twists, Faux Locs, Goddess Locs
  - Natural: Wash and Go, Twist Out, Bantu Knot Out, Braid Out, High Puff, Afro, Finger Coils
  - Low Manipulation: Two-Strand Twists, Bantu Knots, Mini Twists, Flat Twists
- **Smart Stylist Matching**:
  - Filters by style specialty
  - Checks availability (hours per day)
  - Matches budget range
  - Sorts by rating
- **Job Spec Generation**: Automatic spec creation for stylists

### **4. User Profile System**

- **Registration**: 3-step onboarding (expandable to 5+ steps)
- **Profile Storage**: localStorage (key: `nywele-user-profile`)
- **Saved Routines**: Users can save multiple hair care routines
- **Editable**: All profile fields can be updated

### **5. Product Recommendations**

- **Database**: 12+ authentic African hair products
- **Categories**: Extensions, styling, shampoos, conditioners, oils, tools
- **AI Matching**: Products matched to hair type, porosity, goals
- **Pricing**: KES pricing with vendor info

### **6. Analytics Tracking**

- **Events Tracked**:
  - Recommendations generated
  - Style generations (AI success/failure)
  - Product clicks
  - Salon views
- **Storage**: Supabase `analytics_events` table
- **Dashboard**: Real-time usage insights

---

## 📊 Data Flow

### **Storage Mechanisms**

1. **localStorage**:

   - `nywele-user-profile`: Complete user profile
   - `nywele-latest-booking`: Most recent booking
   - `nywele-skip-intro`: Intro skip preference
   - `nywele-viewing-routine`: Routine being viewed

2. **sessionStorage**:

   - `userHairPhoto`: Base64 encoded photo
   - `inspirationPhoto`: Inspiration image
   - `hairAnalysis`: Analysis results
   - `recommendation`: Generated routine
   - `desiredStyle`: Selected style
   - `hairType`: Detected hair type

3. **Supabase Database**:
   - `analytics_events`: Event tracking
   - `styles`: Hairstyle catalog
   - `products`: Product database
   - `salons`: Salon directory
   - `recommendations`: Saved recommendations

### **API Endpoints**

1. **`/api/analyze-image`**: Hair photo analysis (Vision API)
2. **`/api/hair-health`**: Gemini health analysis
3. **`/api/hair-care-routine`**: Generate routine (GPT-4)
4. **`/api/recommend`**: Product recommendations
5. **`/api/style`**: Style image generation (Gemini)
6. **`/api/analyze-style`**: Style detection from photo

---

## 🎨 User Interface Structure

### **Pages**

| Page            | Route              | Purpose                                      |
| --------------- | ------------------ | -------------------------------------------- |
| Home            | `/`                | Intro animation → redirects to dashboard     |
| Dashboard       | `/dashboard`       | Main hub, profile check, quick actions       |
| Register        | `/register`        | User registration (3-5 steps)                |
| Profile         | `/profile`         | View/edit profile, saved routines            |
| Hair Care       | `/hair-care`       | Photo upload → analysis → routine generation |
| Booking Flow    | `/booking-flow`    | 4-step booking process                       |
| Results         | `/results`         | Display routine results (legacy?)            |
| Recommendations | `/recommendations` | Personalized daily tips                      |
| Analytics       | `/analytics`       | Usage statistics dashboard                   |
| How It Works    | `/how-it-works`    | Platform explanation                         |
| Stylists        | `/stylists`        | Stylist directory                            |
| Braiders        | `/braiders`        | Braider-specific page                        |
| Salons          | `/salons`          | Salon directory                              |

### **Components**

- **Navbar**: Global navigation
- **SpecSummary**: Job spec display
- **QuoteEditor**: Quote editing (for braiders)

---

## 🔐 Authentication & Authorization

- **Current**: No authentication (localStorage-based)
- **Future**: Supabase Auth integration planned
- **API Protection**: `requireAuth()` middleware checks API keys

---

## 🎯 Key Technologies

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion (animations)
- **AI Services**:
  - OpenAI GPT-4 (routine generation)
  - Google Gemini (health analysis, image generation)
  - Google Vision API (hair analysis)
- **Database**: Supabase (PostgreSQL)
- **Storage**: localStorage, sessionStorage
- **Analytics**: Custom tracking to Supabase

---

## 📈 Current State Summary

### **✅ Fully Functional**

- User registration & profile management
- Hair photo analysis (Vision API + Gemini)
- AI-powered routine generation
- Style booking flow (4 steps)
- Stylist matching algorithm
- Product recommendations
- Analytics tracking
- Saved routines system

### **🔄 In Progress / Partial**

- Supabase Auth (planned)
- Real-time booking confirmations
- Payment integration
- Stylist dashboard

### **📝 Known Limitations**

- All data stored in localStorage (not persistent across devices)
- No real-time updates
- No email notifications
- No payment processing
- Analytics requires Supabase setup

---

## 🚀 Typical User Journey

1. **First Visit**: Intro animation → Dashboard
2. **Registration**: Create profile (3-5 steps)
3. **Hair Analysis**: Upload photo → Get AI analysis
4. **Routine Generation**: Generate personalized care routine
5. **Save Routine**: Save to profile for later
6. **Book Style**: Select style → Match stylist → Confirm booking
7. **Get Tips**: View personalized recommendations
8. **Manage Profile**: Edit goals, view saved routines

---

## 📝 Notes

- **18 hairstyles** available in the system
- **12+ products** in product database
- **Analytics** tracks all major user actions
- **All flows** are localStorage-based (client-side only)
- **AI services** require API keys (OpenAI, Google)

---

_Last Updated: Current State Analysis_
_Document Version: 1.0_
