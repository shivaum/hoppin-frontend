# Frontend Architecture Guide

## Navigation & Data Flow Principles

This document defines the architectural patterns for the Hoppin frontend application, establishing strict contracts between screens and components.

---

## Core Principle: ID-Based Navigation

**Screens are responsible for fetching their own data. Navigation passes only IDs and minimal context.**

### ✅ GOOD: Minimal Navigation Params
```typescript
// Pass only IDs and context flags
navigation.navigate('RideDetails', {
  rideId: 'abc123',
  source: 'rider'
});

navigation.navigate('EditRide', {
  rideId: 'xyz789'
});

navigation.navigate('Chat', {
  rideId: 'ride123',
  otherUserId: 'user456'
});
```

### ❌ BAD: Passing Full Objects
```typescript
// DON'T pass entire data objects
navigation.navigate('EditRide', {
  rideId: ride.id,
  start_address: ride.start_location,
  end_address: ride.end_location,
  // ... 10+ more fields
  requests: ride.requests,
});
```

**Why?** Passing full objects through navigation:
- Creates stale data (ride gets updated, nav params don't)
- Breaks TypeScript safety (large param objects are hard to type)
- Couples screens together (changes ripple through navigation calls)
- Makes debugging harder (where did this data come from?)

---

## Navigation Type Contracts

All navigation params are strictly typed in `src/navigation/types.ts`:

```typescript
export type MainStackParamList = {
  RideDetails: { rideId: string; source?: 'search' | 'rider' | 'driver' };
  EditRide: { rideId: string };
  Chat: { rideId: string; otherUserId: string };
  // ... other screens
}
```

TypeScript will enforce these contracts. If you try to pass extra params, you'll get a compile error.

---

## Screen Architecture Pattern

Every screen follows this structure:

```
src/screens/[ScreenName]/
├── index.tsx              # Main screen (presentation + orchestration)
├── hooks/                 # Business logic
│   └── use[ScreenName].ts
├── components/            # Screen-specific UI components
│   ├── Component1.tsx
│   └── Component2.tsx
├── services/              # API calls
│   └── [name]Service.ts
└── utils/                 # Pure utility functions
    ├── validation.ts
    └── formatting.ts
```

---

## Component Responsibility Boundaries

### Components Should:
✅ Receive data via props
✅ Receive callbacks via props
✅ Handle UI interactions
✅ Manage local UI state (animations, toggles, etc.)

### Components Should NOT:
❌ Make API calls directly
❌ Access global state (Context, Redux) for data
❌ Navigate to other screens (exception: list items can navigate)
❌ Contain business logic

### Example: Proper Component

```typescript
// ✅ GOOD: Pure component
interface RideCardProps {
  ride: Ride;                           // Data
  onPress: (rideId: string) => void;    // Callback
  onRequest?: (rideId: string) => void; // Optional action
}

export function RideCard({ ride, onPress, onRequest }: RideCardProps) {
  return (
    <TouchableOpacity onPress={() => onPress(ride.id)}>
      <Text>{ride.startLocation}</Text>
      {onRequest && (
        <Button title="Request" onPress={() => onRequest(ride.id)} />
      )}
    </TouchableOpacity>
  );
}
```

```typescript
// ❌ BAD: Component with API calls
export function RideCard({ ride }: { ride: Ride }) {
  const handleRequest = async () => {
    await requestRide(ride.id); // API call in component!
    // ...
  };

  return <TouchableOpacity onPress={handleRequest}>...</TouchableOpacity>;
}
```

---

## Data Fetching Pattern

### Screen-Level Hooks Own All Business Logic

Each screen has a primary custom hook that:
- Fetches data from API on mount
- Manages all screen state
- Provides callbacks for actions
- Handles loading/error states

**Example: useEditRide Hook**

```typescript
// src/screens/EditRide/hooks/useEditRide.ts
export function useEditRide(params: { rideId: string }) {
  const [pickup, setPickup] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await rideService.fetchRideDetails(params.rideId);
        setPickup(data.start_location);
        // ... set other state
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.rideId]);

  // Action handlers
  const handleSave = async () => {
    await rideService.updateRide(params.rideId, { pickup, ... });
  };

  return {
    pickup,
    setPickup,
    loading,
    error,
    handleSave,
    // ... other state and callbacks
  };
}
```

**Using the Hook in Screen:**

```typescript
// src/screens/EditRide/index.tsx
export default function EditRide() {
  const { params } = useRoute<Route>();
  const editRide = useEditRide(params);

  if (editRide.loading) return <LoadingSpinner />;
  if (editRide.error) return <ErrorView message={editRide.error} />;

  return (
    <View>
      <TextInput value={editRide.pickup} onChangeText={editRide.setPickup} />
      <Button title="Save" onPress={editRide.handleSave} />
    </View>
  );
}
```

---

## Service Layer Pattern

Services are pure functions that make API calls. They:
- Live in `src/screens/[Screen]/services/` or `src/integrations/`
- Never access React hooks or component state
- Return promises with typed data
- Throw errors (caught by hooks)

**Example: rideService.ts**

```typescript
// src/screens/EditRide/services/rideService.ts
import { getRideDetails as apiGetRideDetails } from '../../../integrations/hopin-backend/driver';

export const rideService = {
  fetchRideDetails: async (rideId: string): Promise<DriverRide> => {
    return await apiGetRideDetails(rideId);
  },

  updateRide: async (rideId: string, updates: UpdateRidePayload): Promise<void> => {
    await apiUpdateRide(rideId, updates);
  },
};
```

---

## Real-World Examples

### Example 1: EditRide Screen

**Before (Bad):**
```typescript
// Passed 12 props via navigation
navigation.navigate('EditRide', {
  rideId, start_address, end_address, departureISO,
  price_per_seat, available_seats, start_lat, start_lng,
  end_lat, end_lng, requests: [...]
});
```

**After (Good):**
```typescript
// Pass only ID
navigation.navigate('EditRide', { rideId: ride.id });

// Screen fetches everything
function EditRide() {
  const { params } = useRoute();
  const editRide = useEditRide(params); // Fetches all data
  // ...
}
```

### Example 2: Chat Screen

**Before (Bad):**
```typescript
// Passed entire conversation object (50+ lines)
navigation.navigate('Chat', {
  conversation: {
    id, otherUser: {...}, ride: {...}, lastMessage: {...}, status, userRole
  }
});
```

**After (Good):**
```typescript
// Pass only IDs
navigation.navigate('Chat', {
  rideId: conversation.ride.id,
  otherUserId: conversation.otherUser.id
});

// Screen fetches conversation metadata
function Chat() {
  const { rideId, otherUserId } = route.params;
  const { conversation } = useConversation(rideId, otherUserId);
  // ...
}
```

---

## Benefits of This Architecture

✅ **Type Safety**: TypeScript enforces minimal navigation params
✅ **Fresh Data**: Screens always fetch latest data, never stale
✅ **Testability**: Components are pure, hooks are isolated
✅ **Debuggability**: Clear data flow, single source of truth
✅ **Consistency**: Same pattern everywhere
✅ **Performance**: No massive objects passed through navigation
✅ **Maintainability**: Clear boundaries, single responsibility

---

## When to Break the Rules

### Exception 1: List Item Components Can Navigate
It's acceptable for list item components (RiderRideItem, DriverRideItem, etc.) to use `useNavigation` for drill-down navigation:

```typescript
// Acceptable
export function RiderRideItem({ request }: Props) {
  const navigation = useNavigation();

  const goToDetails = () => {
    navigation.navigate('RideDetails', { rideId: request.ride_id });
  };

  return <TouchableOpacity onPress={goToDetails}>...</TouchableOpacity>;
}
```

### Exception 2: Display-Only Calculations
Simple calculations for display purposes can remain in components:

```typescript
// Acceptable for display
const dropoffTime = calculateEstimatedArrival(ride.departure, travelMinutes);
```

But complex business logic should be in hooks.

---

## Migration Checklist

When refactoring an existing screen:

- [ ] Update navigation types in `types.ts` to enforce minimal params
- [ ] Create screen folder structure (hooks/, components/, services/, utils/)
- [ ] Extract API calls into service layer
- [ ] Create custom hook for screen business logic
- [ ] Update navigation calls to pass only IDs
- [ ] Extract screen-specific components
- [ ] Update all imports
- [ ] Test navigation flows
- [ ] Verify data freshness (edit → back → data updates)

---

## Questions?

If you're unsure whether to fetch data in a screen or pass it via navigation, ask:

1. **Could this data change?** → Fetch it in the screen
2. **Is this more than 3 fields?** → Fetch it in the screen
3. **Is this complex or nested data?** → Fetch it in the screen

**When in doubt: Fetch in the screen. Only pass IDs.**

---

*Last updated: 2025-09-29*
*Architecture established during navigation refactoring project*