# Braider Dashboard Guide

## Overview

The Braider Dashboard (`/braiders`) provides a comprehensive interface for stylists to manage job requests, review customer requirements, and submit professional quotes.

## Dashboard Features

### 1. **Stats Overview**

At the top of the dashboard, braiders see:

- **Pending Jobs**: Number of jobs awaiting quotes
- **Completed Jobs**: Number of quotes submitted or confirmed bookings
- **Total Jobs**: Overall job count

### 2. **Job Inbox Tabs**

Two tabs allow braiders to organize their work:

- **Pending Tab**: Shows all jobs that need quotes
- **Completed Tab**: Shows jobs with submitted quotes or confirmed bookings

## Job Card Information

Each job card displays comprehensive customer information:

### Customer Details

- **Hair Type**: Detected or provided by customer (e.g., "4C")
- **Budget**: Customer's budget range (e.g., "KES 5,000-8,000")
- **Requested Date**: When the customer wants the service
- **Requested Time**: Specific appointment time
- **Time Preference**: Customer's preferred time slot (e.g., "Afternoon (12pm-5pm)")

### Style Information

- **Style Name**: The hairstyle requested (e.g., "Senegalese Twists")
- **Request Date**: When the job was submitted

### Job Specification Summary

Auto-generated specifications include:

- **Time Estimate**: Expected duration range (e.g., "4-6 hours")
- **Estimated Materials**: Cost range for products needed (e.g., "KES 2,000 - 3,500")

### Job Status

Visual indicators show:

- 🟡 **Pending Quote**: Awaiting braider's quote
- 🔵 **Quote Submitted**: Quote sent, awaiting customer approval
- 🟢 **Confirmed**: Booking confirmed by customer

## Quote Submission Process

### Step 1: Review Job Details

Click "Review & Submit Quote" on any pending job to see:

- Full job specification with required products
- Detailed time estimates
- Customer requirements and preferences

### Step 2: Customize Quote

Using the Quote Editor, braiders can:

- **Adjust Product Quantities**: Modify amounts for each required product
- **Set Labor Cost**: Enter professional service fee (in KES)
- **Add Notes**: Include special instructions, availability, or requirements
- **See Live Total**: Watch the total cost update in real-time

### Step 3: Submit

Once submitted:

- Quote is saved to the customer's booking
- Job moves to "Quote Submitted" status
- Customer can review and approve on their dashboard
- Braider sees job in "Completed" tab with "Quote Sent - Awaiting Customer" label

## What Customers Can't See

To protect braider business information:

- Individual product costs (only final total is shared)
- Internal notes or calculations
- Braider's cost breakdown

## What Customers DO See

When reviewing quotes:

- Total service cost
- Estimated time
- List of products that will be used
- Any public notes or instructions from the braider

## Mock Data Note

Currently using `localStorage` for proof-of-concept. In production:

- Jobs will sync with Supabase database
- Real-time notifications when new jobs arrive
- Customer messaging system
- Portfolio and reviews integration

## Testing the Flow

### As a Braider:

1. Navigate to `/braiders`
2. View stats and pending jobs
3. Click "Review & Submit Quote" on any job
4. Adjust products and set labor cost
5. Add notes and submit quote
6. See job move to "Completed" tab

### As a Customer:

1. Complete a booking flow
2. View booking on dashboard
3. See quote notification when braider submits
4. Review and approve quote

## Future Enhancements

- Push notifications for new jobs
- Chat with customers
- Calendar integration
- Portfolio showcase
- Automated availability matching
- Skills-based job routing
