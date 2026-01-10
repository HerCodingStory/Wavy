# Garmin Watch Integration Guide

## Overview
Integration options for Wavy water sports conditions app with Garmin watches.

## Option 1: Connect IQ Widget (Recommended)

### What is Connect IQ?
- Garmin's platform for developing watch apps, widgets, and watch faces
- Apps run natively on Garmin watches
- Can access watch sensors and display data

### Architecture

```
┌─────────────────┐
│  Your Next.js   │
│     App API     │
└────────┬────────┘
         │ HTTPS/REST API
         │ JSON Data
         ▼
┌─────────────────┐
│  Garmin Connect │
│      Server     │
│  (Publishes CIQ)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Garmin Watch   │
│  (CIQ Widget)   │
│  - Fetches data │
│  - Displays UI  │
└─────────────────┘
```

### Development Process

1. **Set up Connect IQ SDK**
   - Download from Garmin Developer Portal
   - Install Eclipse or VS Code extension
   - Create widget project

2. **Build Widget (Monkey C language)**
   ```monkeyc
   // Example structure
   class WavyConditionsView extends Ui.View {
       function initialize() {
           Ui.View.initialize();
       }
       
       // Fetch data from your API
       function onUpdate(dc) {
           // Display conditions
           dc.drawText(x, y, "Wind: 15mph", ...);
       }
   }
   ```

3. **API Integration**
   - Widget calls your Next.js API endpoint
   - Example: `GET /api/watch/conditions?lat=25.79&lon=-80.13`
   - Returns lightweight JSON optimized for watch

4. **Publishing**
   - Test on Garmin simulator
   - Submit to Garmin Connect IQ Store
   - Users install from Garmin Connect app

### Widget Features

**Watch Face Widget:**
- Current wind speed/direction
- Wave height
- Condition score (e.g., "Surf: 8/10")
- Best time indicator

**App Widget:**
- Full conditions dashboard
- Multiple locations
- Detailed metrics
- Navigation to different sports

### Data API Endpoint Needed

Create a watch-optimized API endpoint:

```typescript
// /api/watch/conditions/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const sport = searchParams.get("sport") || "surfing";
  
  // Fetch minimal data for watch
  const [wind, waves, conditions] = await Promise.all([
    fetch(`/api/wind?lat=${lat}&lon=${lon}`),
    fetch(`/api/waves?lat=${lat}&lon=${lon}`),
    fetch(`/api/${sport}-conditions?lat=${lat}&lon=${lon}`),
  ]);
  
  // Return lightweight JSON
  return NextResponse.json({
    wind: {
      speed: 15.2,  // mph
      direction: "NE",
      gusts: 18.5
    },
    waves: {
      height: 3.2,  // ft
      period: 8,
      score: 75
    },
    conditions: {
      score: 85,
      level: "Good",
      emoji: "🏄"
    },
    updated: "2025-01-10T14:30:00Z"
  });
}
```

## Option 2: Garmin Connect API

### Use Cases
- Sync activity data
- Add conditions context to activities
- Performance analytics

### Setup

1. **Register App**
   - Garmin Developer Portal
   - OAuth 2.0 credentials
   - API keys

2. **User Authorization**
   ```typescript
   // OAuth flow
   const authUrl = `https://connect.garmin.com/oauthConfirm?
     oauth_token=${token}&
     oauth_callback=${callbackUrl}`;
   ```

3. **API Integration**
   ```typescript
   // Fetch activities
   const activities = await fetch(
     'https://connectapi.garmin.com/activity-service/activities',
     {
       headers: {
         'Authorization': `Bearer ${accessToken}`
       }
     }
   );
   ```

4. **Enhance Activities**
   - Add weather/conditions metadata
   - Store in your database
   - Show correlation in app

## Option 3: Notification-Based

### Approach
- Phone app sends notifications
- Garmin mirrors phone notifications
- Limited customization

### Implementation
```typescript
// Web Push API (if PWA)
// or phone app notifications
navigator.serviceWorker.register('/sw.js')
  .then(reg => {
    reg.showNotification("Great conditions at South Beach!", {
      body: "Wind: 15mph, Waves: 3ft - Perfect for surfing!",
      icon: "/logo1.png",
      badge: "/badge.png"
    });
  });
```

## Technical Requirements

### Connect IQ Widget

**Language:** Monkey C (Garmin's JavaScript-like language)

**Capabilities:**
- HTTP requests (to your API)
- Data storage (simple key-value)
- Watch sensors access
- UI rendering
- Background updates (limited)

**Limitations:**
- Battery impact (frequent updates drain battery)
- Network dependency
- Limited screen real estate
- Update frequency restrictions

**Watch Compatibility:**
- Forerunner series
- Fenix series
- Vivoactive series
- Most modern Garmin watches

### API Considerations

**Optimize for Watch:**
- Minimal JSON response
- Compressed data
- Cache-friendly
- Fast response times (< 1s ideal)

**Rate Limiting:**
- Watches update every 15-60 minutes
- Implement reasonable rate limits
- Use caching aggressively

## Development Timeline

### Phase 1: API Endpoint (1-2 days)
- Create watch-optimized endpoint
- Test with curl/Postman
- Optimize response size

### Phase 2: Connect IQ Widget (1-2 weeks)
- Learn Monkey C basics
- Build simple widget
- Integrate with API
- Test on simulator

### Phase 3: Publishing (1 week)
- Beta testing
- Garmin review process
- Store listing

## Alternative: Apple Watch / Wear OS

If targeting broader market:
- **Apple Watch:** Native iOS/watchOS app
- **Wear OS:** Android Wear app
- Better integration with phone apps
- Easier development (React Native, Flutter)

## Recommendations

**Start with:** Connect IQ Widget
- Most native experience
- Direct access to watch
- Good for water sports community

**Future:** Garmin Connect API
- Add activity correlation
- Performance insights
- More engagement

**Budget consideration:**
- Connect IQ development: Moderate learning curve
- Garmin Connect API: More complex, requires OAuth
- May want to hire Garmin developer if unfamiliar with Monkey C

## Resources

- Garmin Developer Portal: https://developer.garmin.com/
- Connect IQ SDK: https://developer.garmin.com/connect-iq/sdk/
- Monkey C Documentation: https://developer.garmin.com/connect-iq/programmers-guide/
- API Documentation: https://developer.garmin.com/connect-iq/connect-iq-basics/

