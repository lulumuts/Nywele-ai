# Hydration Error Fix

## Problem

React/Next.js hydration errors occurred when server-rendered HTML didn't match client-rendered content. The error message was:

```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
```

## Root Cause

Several components were accessing `localStorage` and rendering different content on the server vs. client:

1. **`/app/braiders/page.tsx`**: Loading jobs from localStorage and rendering them immediately
2. **`/app/components/Navbar.tsx`**: Loading user profile name from localStorage

Since `localStorage` is only available in the browser (not during server-side rendering), the server rendered default/empty content while the client tried to render actual data, causing a mismatch.

## Solution

### 1. Braiders Page - Client-Only Rendering

Added an `isClient` state flag that delays rendering until after hydration:

```typescript
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
  loadJobs();
}, []);

// Render loading state on server, actual content on client
{!isClient ? (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading dashboard...</p>
    </div>
  </div>
) : (
  // Actual dashboard content
)}
```

**Why this works:**

- Server renders a simple loading spinner (same on every request)
- Client mounts, sets `isClient` to true
- Client then loads localStorage data and re-renders
- No mismatch because server and initial client render are identical

### 2. Navbar - Default Values

Changed from nullable state to default values:

```typescript
// Before (caused hydration issues)
const [userName, setUserName] = useState<string | null>(null);

// After (no hydration issues)
const [userName, setUserName] = useState<string>("Profile");
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
  const profile = localStorage.getItem("nywele-user-profile");
  if (profile) {
    const parsedProfile = JSON.parse(profile);
    setUserName(parsedProfile.name || "Profile");
  }
}, []);
```

**Why this works:**

- Server renders "Profile" as the default
- Client first renders "Profile" (matches server)
- Client then loads actual name and updates
- No mismatch because initial render is the same

## General Rules to Avoid Hydration Errors

### ❌ DON'T DO THIS:

```typescript
// Direct localStorage access in render
const userName = localStorage.getItem("user") || "Guest";
return <div>Hello {userName}</div>;

// Conditional rendering based on localStorage
if (typeof window !== "undefined" && localStorage.getItem("loggedIn")) {
  return <Dashboard />;
}
return <Login />;
```

### ✅ DO THIS INSTEAD:

```typescript
// Method 1: Client-only rendering
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);

if (!isClient) return <LoadingSpinner />;
return <ActualContent />;

// Method 2: Default values
const [userName, setUserName] = useState("Guest");

useEffect(() => {
  const name = localStorage.getItem("user");
  if (name) setUserName(name);
}, []);

return <div>Hello {userName}</div>;
```

## Other Common Causes of Hydration Errors

1. **Browser APIs**: `window`, `document`, `navigator`, `localStorage`, `sessionStorage`
2. **Date/Time**: `new Date()` can differ between server and client
3. **Random Values**: `Math.random()` generates different values each time
4. **CSS-in-JS**: Some libraries generate different class names on server vs client
5. **Conditional Rendering**: Based on client-only state

## How to Debug Hydration Errors

1. **Check Browser Console**: Usually shows which element mismatched
2. **Look for Client-Only APIs**: Search for `localStorage`, `window`, etc.
3. **Check Conditional Rendering**: Look for conditions that might differ
4. **Use Suppressors Sparingly**: `suppressHydrationWarning` hides the error but doesn't fix it
5. **Test SSR**: Run `npm run build && npm start` to catch SSR issues

## Testing

After implementing these fixes:

✅ No hydration warnings in browser console  
✅ Page loads smoothly without flashing content  
✅ Server-rendered HTML matches client-rendered HTML  
✅ Data from localStorage loads after hydration

## Files Updated

- `/app/braiders/page.tsx` - Added client-only rendering guard
- `/app/components/Navbar.tsx` - Changed to default values instead of null

## Related Documentation

- [Next.js Hydration Errors](https://nextjs.org/docs/messages/react-hydration-error)
- [React Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)
- [useEffect for Client-Only Code](https://react.dev/reference/react/useEffect#displaying-different-content-on-the-server-and-the-client)
