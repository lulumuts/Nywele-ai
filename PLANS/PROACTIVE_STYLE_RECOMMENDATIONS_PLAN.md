# Proactive Hairstyle Recommendations Plan

## Overview

Create an intelligent recommendation system that suggests new hairstyles to users as their current style approaches its maintenance end date, using data from their onboarding profile and booking history.

## Goals

1. **Increase Rebooking Rate**: Remind users before their style expires
2. **Personalized Suggestions**: Use profile data for relevant recommendations
3. **Seamless Experience**: Make rebooking effortless
4. **Build Loyalty**: Show we remember and care about their hair journey

## Data Sources

### From User Profile (Onboarding Form)

- Hair type (e.g., 4C, 3B)
- Hair goals (growth, protective styling, low maintenance)
- Budget range
- Preferred time slots
- Lifestyle (active, professional, casual)
- Hair sensitivity/allergies
- Previous styles they've tried
- Favorite colors/lengths

### From Booking History

- Last style booked
- Booking date
- Style maintenance duration (e.g., "6-8 weeks")
- Preferred stylists
- Budget spent
- Appointment preferences (date/time patterns)

### From Style Library

- Maintenance duration for each style
- Complexity level
- Price range
- Hair types suitable for each style
- Similar/complementary styles
- Seasonal popularity

## Recommendation Logic

### 1. **Timing Calculation**

```typescript
interface BookingWithMaintenance {
  bookingDate: Date;
  styleName: string;
  maintenanceDurationWeeks: { min: number; max: number };
  reminderDate: Date;
}

// Calculate when to send reminder
function calculateReminderDate(booking: BookingWithMaintenance) {
  const avgWeeks =
    (booking.maintenanceDurationWeeks.min +
      booking.maintenanceDurationWeeks.max) /
    2;
  const reminderOffset = avgWeeks * 0.8; // Remind at 80% of maintenance period
  return addWeeks(booking.bookingDate, reminderOffset);
}
```

**Example:**

- User books Box Braids on Jan 1
- Maintenance duration: 6-8 weeks (avg 7 weeks)
- Reminder sent: Week 5.6 (80% of 7 weeks)
- User has ~1.4 weeks to book before style expires

### 2. **Recommendation Scoring**

Score styles based on:

- **Hair Type Match** (40%): Style suitable for user's hair type
- **Budget Fit** (20%): Within user's preferred range
- **Season/Trend** (10%): Currently popular or seasonal
- **Maintenance Match** (10%): Fits user's lifestyle
- **Variety** (10%): Different from last 2-3 styles
- **Goal Alignment** (10%): Matches hair goals (growth, protective, etc.)

```typescript
interface StyleScore {
  styleName: string;
  totalScore: number;
  reasons: string[]; // Why we're recommending this
}

function scoreStyle(
  style: Style,
  userProfile: UserProfile,
  bookingHistory: Booking[]
): StyleScore {
  let score = 0;
  const reasons: string[] = [];

  // Hair type match
  if (style.suitableHairTypes.includes(userProfile.hairType)) {
    score += 40;
    reasons.push(`Perfect for ${userProfile.hairType} hair`);
  }

  // Budget fit
  if (isWithinBudget(style.costRange, userProfile.budgetRange)) {
    score += 20;
    reasons.push(`Fits your budget`);
  }

  // Variety (not booked recently)
  const recentStyles = bookingHistory.slice(0, 3).map((b) => b.styleName);
  if (!recentStyles.includes(style.name)) {
    score += 10;
    reasons.push(`Try something new!`);
  }

  // Maintenance match
  if (matchesLifestyle(style, userProfile.lifestyle)) {
    score += 10;
    reasons.push(`${style.maintenanceLevel} maintenance fits your lifestyle`);
  }

  return { styleName: style.name, totalScore: score, reasons };
}
```

### 3. **Recommendation Categories**

**A. "Time for a Refresh" (Primary)**

- Same or similar style as last booking
- Lower friction for users who loved their last style
- "Book your Box Braids again?"

**B. "Try Something New" (Secondary)**

- Complementary styles (e.g., if they had braids, suggest twists)
- Higher scoring alternatives
- "Based on your preferences, you might love..."

**C. "Trending Now" (Tertiary)**

- Popular styles this season
- Celebrity-inspired looks
- "See what's popular this month"

## UI/UX Implementation

### Phase 1: Dashboard Widget (Week 1)

**Location:** Dashboard homepage

**Design:**

```
┌─────────────────────────────────────────────────┐
│ 🎯 Time for Your Next Style!                   │
│                                                 │
│ Your Senegalese Twists from Feb 1 will need    │
│ maintenance in ~2 weeks.                        │
│                                                 │
│ ┌──────────────┐  ┌──────────────┐             │
│ │ [Image]      │  │ [Image]      │             │
│ │ Same Style   │  │ Passion      │             │
│ │ Again        │  │ Twists       │             │
│ │ KES 5,000    │  │ KES 4,500    │             │
│ │ [Book Now]   │  │ [Book Now]   │             │
│ └──────────────┘  └──────────────┘             │
│                                                 │
│ [View More Styles]                              │
└─────────────────────────────────────────────────┘
```

**Features:**

- Show countdown to maintenance end date
- Display 2-3 recommended styles
- One-click rebooking with pre-filled preferences
- "View More Styles" opens full catalog with recommendations highlighted

### Phase 2: Email/Push Notifications (Week 2)

**Trigger Times:**

- **2 weeks before**: "Start planning your next style"
- **1 week before**: "Your style needs attention soon!"
- **At expiry**: "Time to refresh! Here are your top picks"

**Email Content:**

- Personalized greeting
- Reminder of current style and date
- 3 recommended styles with images
- CTA: "Book Now" → Pre-filled booking form

### Phase 3: In-App Notifications (Week 3)

**Notification Center:**

- Bell icon in header
- Badge with count
- List of notifications:
  - "Your Box Braids need refresh in 1 week"
  - "New styles perfect for your hair type"
  - "Your favorite stylist has availability"

### Phase 4: SMS Reminders (Week 4)

**SMS Template:**

```
Hi [Name]! Your [Style] from [Date] is ready for a refresh.
We've picked 3 perfect styles for you: [Style1], [Style2], [Style3].

Book now: [Short Link]

- Nywele AI ✨
```

## Technical Implementation

### 1. Data Models

```typescript
// Extended User Profile
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;

  // From onboarding
  hairType: string;
  hairGoals: string[];
  budgetRange: { min: number; max: number };
  lifestyle: "active" | "professional" | "casual" | "mixed";
  preferredTimeSlots: string[];
  sensitivities: string[];
  previousStyles: string[];

  // Preferences
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };

  // Computed
  lastBookingDate?: Date;
  nextRecommendationDate?: Date;
}

// Booking with maintenance tracking
interface Booking {
  id: string;
  userId: string;
  styleName: string;
  bookingDate: Date;
  maintenanceDuration: { min: number; max: number; unit: "weeks" };
  maintenanceEndDate: Date;
  reminderSentDates: Date[];
  status: "active" | "expired" | "refreshed";
}

// Recommendation
interface StyleRecommendation {
  id: string;
  userId: string;
  styleId: string;
  styleName: string;
  score: number;
  reasons: string[];
  createdAt: Date;
  expiresAt: Date;
  clicked: boolean;
  booked: boolean;
}
```

### 2. Background Jobs (Cron/Scheduled Functions)

```typescript
// lib/recommendations/scheduler.ts

// Run daily at 8am
export async function generateDailyRecommendations() {
  // 1. Find users whose styles are approaching maintenance date
  const usersNeedingReminder = await findUsersForRecommendation();

  // 2. For each user, generate personalized recommendations
  for (const user of usersNeedingReminder) {
    const recommendations = await generateRecommendationsForUser(user);

    // 3. Save recommendations
    await saveRecommendations(user.id, recommendations);

    // 4. Send notifications based on user preferences
    await sendNotifications(user, recommendations);
  }
}

async function findUsersForRecommendation(): Promise<User[]> {
  const today = new Date();

  return await db.users.findMany({
    where: {
      lastBooking: {
        maintenanceEndDate: {
          // Find bookings ending in 1-2 weeks
          gte: addWeeks(today, 1),
          lte: addWeeks(today, 2),
        },
      },
      reminderSent: false,
    },
    include: {
      profile: true,
      bookings: { orderBy: { bookingDate: "desc" }, take: 5 },
    },
  });
}
```

### 3. Recommendation Engine

```typescript
// lib/recommendations/engine.ts

export async function generateRecommendationsForUser(
  user: User
): Promise<StyleRecommendation[]> {
  const profile = user.profile;
  const bookingHistory = user.bookings;
  const lastBooking = bookingHistory[0];

  // Get all available styles
  const allStyles = await getAvailableStyles();

  // Score each style
  const scoredStyles = allStyles
    .map((style) => scoreStyle(style, profile, bookingHistory))
    .sort((a, b) => b.totalScore - a.totalScore);

  // Get top 5 recommendations
  const topRecommendations = scoredStyles.slice(0, 5);

  // Ensure variety: include same style, similar style, and different style
  const recommendations = [
    findSameStyle(lastBooking.styleName, topRecommendations), // Comfort choice
    findSimilarStyle(lastBooking.styleName, topRecommendations), // Safe new
    findDifferentStyle(lastBooking.styleName, topRecommendations), // Bold choice
  ].filter(Boolean);

  return recommendations;
}
```

### 4. Notification System

```typescript
// lib/notifications/send.ts

export async function sendNotifications(
  user: User,
  recommendations: StyleRecommendation[]
) {
  const { email, sms, push } = user.profile.notificationPreferences;

  if (email) {
    await sendEmailNotification(user, recommendations);
  }

  if (sms) {
    await sendSMSNotification(user, recommendations);
  }

  if (push) {
    await sendPushNotification(user, recommendations);
  }

  // Log notification sent
  await logNotification(
    user.id,
    "style_recommendation",
    recommendations.length
  );
}
```

## Database Schema Updates

```sql
-- Add to users_profiles table
ALTER TABLE users_profiles ADD COLUMN hair_goals TEXT[];
ALTER TABLE users_profiles ADD COLUMN lifestyle VARCHAR(50);
ALTER TABLE users_profiles ADD COLUMN notification_email BOOLEAN DEFAULT true;
ALTER TABLE users_profiles ADD COLUMN notification_sms BOOLEAN DEFAULT false;
ALTER TABLE users_profiles ADD COLUMN notification_push BOOLEAN DEFAULT true;

-- Add bookings tracking table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  style_name VARCHAR(255),
  style_slug VARCHAR(255),
  booking_date TIMESTAMP,
  maintenance_duration_min INT, -- in weeks
  maintenance_duration_max INT, -- in weeks
  maintenance_end_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add recommendations table
CREATE TABLE style_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  style_id UUID REFERENCES styles(id),
  score FLOAT,
  reasons TEXT[],
  clicked BOOLEAN DEFAULT false,
  booked BOOLEAN DEFAULT false,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add notifications log
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  notification_type VARCHAR(100),
  channel VARCHAR(50), -- 'email', 'sms', 'push'
  metadata JSONB,
  sent_at TIMESTAMP DEFAULT NOW()
);
```

## Integration with Existing Features

### 1. Onboarding Form Enhancement

Add questions:

- "What's your lifestyle?" (Active/Professional/Casual)
- "What are your hair goals?" (Growth/Protection/Styling/Low-maintenance)
- "How do you want to be reminded?" (Email/SMS/Push)

### 2. Booking Flow

After booking confirmation:

- Calculate maintenance end date
- Schedule reminder notifications
- Save booking to history with full details

### 3. Dashboard

- Add "Recommended for You" widget
- Show countdown to next style refresh
- Display personalized style cards

### 4. Profile Page

- Section: "Your Hair Journey"
- Timeline of past bookings
- Next recommended refresh date
- Notification preferences toggle

## Success Metrics

### Primary KPIs

1. **Rebooking Rate**: % of users who book again within 2 weeks of maintenance end
2. **Notification Click-Through Rate**: % of users who click recommendation
3. **Conversion Rate**: % of clicks that result in bookings
4. **Time to Rebook**: Days between maintenance end and next booking

### Secondary Metrics

- Average styles per user (variety adoption)
- Notification opt-out rate
- Style recommendation accuracy (user satisfaction survey)
- Revenue per user (lifetime value)

## Implementation Timeline

### Week 1: Foundation

- [ ] Update data models and database schema
- [ ] Enhance user profile with new fields
- [ ] Create recommendation engine core logic
- [ ] Build dashboard widget UI

### Week 2: Recommendation Logic

- [ ] Implement style scoring algorithm
- [ ] Create recommendation categories
- [ ] Build testing interface for recommendations
- [ ] Integrate with existing booking flow

### Week 3: Notifications

- [ ] Set up email templates
- [ ] Configure notification scheduling
- [ ] Implement in-app notification center
- [ ] Add notification preferences to profile

### Week 4: Testing & Refinement

- [ ] E2E testing of full flow
- [ ] A/B test recommendation timing (1 week vs 2 weeks)
- [ ] User feedback collection
- [ ] Performance optimization

### Week 5: Launch & Monitor

- [ ] Soft launch to 10% of users
- [ ] Monitor metrics and adjust
- [ ] Full rollout
- [ ] Documentation and training

## Future Enhancements

### Phase 2 (Months 2-3)

- **AI-Powered Suggestions**: Use ML to improve scoring over time
- **Seasonal Collections**: "Summer Styles" or "Holiday Looks"
- **Social Proof**: "3 of your friends tried this style"
- **Stylist Recommendations**: "Your favorite stylist can do this"

### Phase 3 (Months 4-6)

- **Virtual Try-On**: AR preview of styles
- **Hair Health Tracking**: Photo timeline of hair health
- **Loyalty Rewards**: Points for rebookings
- **Style Challenges**: "Try 3 new styles this quarter"

## Risk Mitigation

### Potential Issues:

1. **Notification Fatigue**: Too many reminders

   - _Solution_: Limit to 2-3 reminders per maintenance cycle, respect opt-out

2. **Irrelevant Recommendations**: Poor matching

   - _Solution_: Continuous feedback loop, "Not interested" button

3. **Privacy Concerns**: Too much tracking

   - _Solution_: Transparent data usage, easy opt-out, GDPR compliance

4. **Technical Failures**: Missed notifications
   - _Solution_: Retry logic, monitoring, fallback to email

## Conclusion

This proactive recommendation system will:

- ✅ Increase user engagement and retention
- ✅ Drive rebooking revenue
- ✅ Provide personalized, valuable service
- ✅ Build long-term customer loyalty
- ✅ Differentiate Nywele AI from competitors

By remembering users' preferences and proactively helping them maintain their hair care routine, we become an essential part of their beauty journey.
