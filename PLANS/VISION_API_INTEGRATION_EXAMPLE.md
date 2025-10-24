# Vision API Integration Example

## How to Integrate into Booking Flow

### Step 1: Analyze Current Hair Photo (When Uploaded)

Add this to `app/page.tsx` where users upload their current hair:

```typescript
const [hairAnalysis, setHairAnalysis] = useState<any>(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);

const handleCurrentHairUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      setCurrentHairImage(base64Image);

      // Analyze with Vision API
      setIsAnalyzing(true);
      try {
        const response = await fetch("/api/analyze-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64Image,
            imageType: "current_hair",
          }),
        });

        const result = await response.json();

        if (result.success) {
          setHairAnalysis(result.data);

          // Show detected hair type to user
          if (result.data.hairType) {
            alert(
              `Detected ${result.data.hairType.hairType.toUpperCase()} hair with ${Math.round(
                result.data.hairType.confidence * 100
              )}% confidence!`
            );
          }

          // Show health insights
          if (result.data.health.healthScore > 70) {
            alert(
              `Your hair looks healthy! Health score: ${result.data.health.healthScore}/100`
            );
          }
        }
      } catch (error) {
        console.error("Analysis failed:", error);
        // Continue with upload even if analysis fails
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  }
};
```

### Step 2: Show Analysis Results to User

Add a display section after the photo upload:

```typescript
{
  currentHairImage && hairAnalysis && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200"
    >
      <h4 className="font-semibold text-purple-800 mb-2">✨ Hair Analysis</h4>

      {hairAnalysis.hairType && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-700">
            <strong>Detected Type:</strong>{" "}
            {hairAnalysis.hairType.hairType.toUpperCase()}
          </span>
          <span className="text-xs bg-purple-100 px-2 py-1 rounded-full">
            {Math.round(hairAnalysis.hairType.confidence * 100)}% confident
          </span>
        </div>
      )}

      {hairAnalysis.health && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-700">
            <strong>Health Score:</strong> {hairAnalysis.health.healthScore}/100
          </span>
          {hairAnalysis.health.healthScore > 70 && <span>✅</span>}
        </div>
      )}

      {hairAnalysis.labels.slice(0, 5).map((label: any, i: number) => (
        <span
          key={i}
          className="inline-block text-xs bg-white px-2 py-1 rounded mr-2 mb-2"
        >
          {label.name}
        </span>
      ))}
    </motion.div>
  );
}
```

### Step 3: Analyze Inspiration Photo (When Uploaded)

```typescript
const handleInspirationUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      setInspirationImage(base64Image);
      setDesiredStyleSource("upload");

      // Analyze with Vision API
      try {
        const response = await fetch("/api/analyze-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64Image,
            imageType: "inspiration",
          }),
        });

        const result = await response.json();

        if (result.success && result.data.detectedStyle) {
          // Auto-match to existing style
          const detectedStyle = result.data.detectedStyle.style;
          const matchedStyle = popularStyles.find((s) =>
            s.toLowerCase().includes(detectedStyle.replace(/-/g, " "))
          );

          if (matchedStyle) {
            setDesiredStyle(matchedStyle);
            alert(
              `We detected "${matchedStyle}" in your photo! Pre-selected for you.`
            );
          } else {
            setDesiredStyle("custom-style");
          }
        }
      } catch (error) {
        console.error("Analysis failed:", error);
        setDesiredStyle("custom-style");
      }
    };
    reader.readAsDataURL(file);
  }
};
```

### Step 4: Use Analysis Data in Booking

Pass the analysis data to the booking flow:

```typescript
const handleSubmit = async () => {
  // ... existing validation ...

  // Store analysis data
  if (hairAnalysis) {
    sessionStorage.setItem("hairAnalysis", JSON.stringify(hairAnalysis));
  }

  // ... navigate to booking flow ...
};
```

### Step 5: Display in Booking Flow

In `app/booking-flow/page.tsx`, retrieve and display:

```typescript
useEffect(() => {
  const analysisData = sessionStorage.getItem("hairAnalysis");
  if (analysisData) {
    const analysis = JSON.parse(analysisData);

    // Show insights in Step 1
    console.log("Hair type:", analysis.hairType?.hairType);
    console.log("Health score:", analysis.health?.healthScore);

    // Use for smart recommendations
    if (analysis.hairType && analysis.health.healthScore < 50) {
      // Recommend protective styles for damaged hair
    }
  }
}, []);
```

## UI Components

### Loading State

```typescript
{
  isAnalyzing && (
    <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-xl">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Analyzing your hair...</p>
      </div>
    </div>
  );
}
```

### Error State

```typescript
{
  analysisError && (
    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-sm text-red-700">
        ⚠️ Couldn't analyze image. Continuing with manual selection.
      </p>
    </div>
  );
}
```

### Success State with Insights

```typescript
{
  hairAnalysis && (
    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="text-purple-600" size={20} />
        <h4 className="font-semibold text-gray-800">AI Hair Analysis</h4>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {hairAnalysis.hairType && (
          <div className="bg-white p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Hair Type</p>
            <p className="text-lg font-bold text-purple-600">
              {hairAnalysis.hairType.hairType.toUpperCase()}
            </p>
          </div>
        )}

        <div className="bg-white p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Health Score</p>
          <p className="text-lg font-bold text-purple-600">
            {hairAnalysis.health.healthScore}/100
          </p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs text-gray-500 mb-2">Detected Features</p>
        <div className="flex flex-wrap gap-2">
          {hairAnalysis.labels.slice(0, 6).map((label: any, i: number) => (
            <span
              key={i}
              className="text-xs bg-white px-2 py-1 rounded-full text-gray-700"
            >
              {label.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Smart Features to Build

### 1. Style Recommendations Based on Health

```typescript
const recommendStylesForHairHealth = (healthScore: number) => {
  if (healthScore < 50) {
    return ["two-strand-twists", "flat-twists", "mini-twists"]; // Low manipulation
  } else if (healthScore < 70) {
    return ["box-braids", "knotless-braids", "senegalese-twists"]; // Protective
  } else {
    return ["all-styles"]; // Healthy hair can try anything
  }
};
```

### 2. Detect Current Style for Maintenance Booking

```typescript
if (analysis.detectedStyle) {
  const currentStyle = analysis.detectedStyle.style;
  // Suggest: "Looks like you have box braids! Need a touch-up?"
  // Redirect to maintenance booking flow
}
```

### 3. Color Matching for Extensions

```typescript
const matchHairColor = (colors: any[]) => {
  const dominantColor = colors[0].color;
  // Use RGB values to match with product color codes
  return {
    productMatch: "Human Hair Bundle #1B",
    confidence: 0.85,
  };
};
```

### 4. Progress Tracking (Before/After)

```typescript
// Store analysis results with timestamps
const progressEntries = [
  { date: "2025-01-01", healthScore: 45, style: "natural" },
  { date: "2025-02-01", healthScore: 60, style: "box-braids" },
  { date: "2025-03-01", healthScore: 75, style: "box-braids" },
];

// Show improvement graph
```

## Testing Checklist

- [ ] Upload current hair photo → See analysis results
- [ ] Detected hair type matches visual inspection
- [ ] Health score makes sense
- [ ] Upload inspiration photo → Auto-detects style
- [ ] Loading state shows during analysis
- [ ] Error handling works if API fails
- [ ] Analysis data persists through booking flow
- [ ] Works without Vision API configured (graceful degradation)

---

**Next**: Set up Vision API credentials and test! 🚀
