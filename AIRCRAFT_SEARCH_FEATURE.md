# Aircraft Search & Filter Feature

## 📋 Overview
Added search and filter functionality to the aircraft selection modal in the flight booking page to help airlines with large fleets find aircraft quickly.

## ✨ Features Added

### 1. **Aircraft Search Field**
- Real-time search across:
  - ✈️ Registration number (e.g., "F-GKXY")
  - 🏷️ Aircraft name (e.g., "Airbus A320neo")
  - 🔤 Aircraft type/ICAO code (e.g., "A320", "B738")
  - 🏠 Home airport (e.g., "LFPG", "KJFK")
- Clear button (✕) to reset search instantly

### 2. **Aircraft Type Filter**
- Dropdown showing all unique aircraft types in the fleet
- Automatically sorted alphabetically
- "All Aircraft Types" option to show everything
- Works in combination with the search field

### 3. **Smart Display**
- Shows number of available aircraft (e.g., "12 available")
- Only appears when fleet has more than 5 aircraft (avoids clutter for small fleets)
- Aircraft cards now display:
  - Registration (bold)
  - Aircraft name
  - **Aircraft type** + Home airport

### 4. **Empty State Messages**
- Different messages based on context:
  - When filters are active: "🔍 No aircraft matching your search"
  - When no filters: "No available aircraft for this route"
- "Clear Filters" button appears when search/filter is active

### 5. **Auto-Reset**
- Filters automatically reset when:
  - Opening the modal for a new route
  - Closing the modal
  - Canceling the booking

## 🎯 Use Cases

### Small VA (< 5 aircraft)
- Search/filter fields **don't appear** (clean interface)
- Direct aircraft selection without clutter

### Medium VA (5-20 aircraft)
- Search field helps find specific registrations
- Type filter helps when booking specific aircraft types

### Large VA (20+ aircraft)
- Essential for quick aircraft lookup
- Combine search + filter for precise results
- Example: Search "KJFK" + Filter "B738" = All 737-800s based at JFK

## 📱 UI/UX Details

### Search Field
```
🔍 Search registration, type, base...  [✕]
```
- Placeholder with emoji for visual clarity
- Clear button appears when text is entered
- Real-time filtering (no submit button needed)

### Type Filter
```
[All Aircraft Types ▼]
A320
A321
B738
B77W
...
```
- Populated dynamically from fleet
- Sorted alphabetically
- Default: "All Aircraft Types"

### Aircraft Cards
```
┌─────────────────────────────────┐
│ F-GKXY                       ✓ │
│ Airbus A320neo                  │
│ A320 • 🏠 LFPG                  │
└─────────────────────────────────┘
```
- Checkmark (✓) appears when selected
- Type badge + home airport on same line

## 🔧 Technical Implementation

### State Variables
```typescript
const [aircraftSearchTerm, setAircraftSearchTerm] = useState('');
const [aircraftFilterType, setAircraftFilterType] = useState<string>('all');
```

### Filter Logic
```typescript
let availableAircraft = selectedRoute?.aircraft_type
  ? fleet.filter(a => a.aircraft_type === selectedRoute.aircraft_type)
  : fleet;

if (aircraftSearchTerm || aircraftFilterType !== 'all') {
  availableAircraft = availableAircraft.filter(aircraft => {
    const matchesSearch = 
      aircraft.registration.toLowerCase().includes(aircraftSearchTerm.toLowerCase()) ||
      aircraft.aircraft_name.toLowerCase().includes(aircraftSearchTerm.toLowerCase()) ||
      aircraft.aircraft_type.toLowerCase().includes(aircraftSearchTerm.toLowerCase()) ||
      aircraft.home_airport.toLowerCase().includes(aircraftSearchTerm.toLowerCase());
    
    const matchesType = aircraftFilterType === 'all' || aircraft.aircraft_type === aircraftFilterType;
    
    return matchesSearch && matchesType;
  });
}
```

### Aircraft Types Dropdown
```typescript
const aircraftTypes = Array.from(new Set(fleet.map(a => a.aircraft_type))).sort();
```

## 📝 Usage Examples

### Example 1: Find Specific Registration
1. User types "F-NEO" in search
2. System shows only aircraft with "F-NEO" in registration, name, type, or base
3. User selects from filtered results

### Example 2: Find All 737s
1. User selects "B738" from type dropdown
2. System shows only Boeing 737-800 aircraft
3. User can further narrow with search if needed

### Example 3: Find Aircraft at Specific Base
1. User types "KJFK" in search
2. System shows all aircraft based at JFK
3. User can filter by type if needed (e.g., only show JFK-based A320s)

### Example 4: Combined Search
1. User types "A32" in search
2. User selects "A320" from dropdown
3. System shows only A320s (combining both filters)

## 🎨 Visual Design

- Search field: White background, slate borders, aviation-blue focus
- Type dropdown: Matches search field styling
- Clear button: Slate-400 text, hover to slate-600
- "Clear Filters" button: Aviation-600 background
- Aircraft count: Subtle slate-500 text

## 🚀 Performance

- **Instant filtering**: No API calls, pure client-side filtering
- **Efficient rendering**: Only filtered aircraft cards are rendered
- **Smart show/hide**: Filters only appear when fleet > 5 aircraft

## 📊 Benefits

1. **Scalability**: Essential for VAs planning to grow their fleet
2. **User Experience**: Quick aircraft selection, even with 100+ aircraft
3. **Flexibility**: Combine search + filter for precise results
4. **Clean UI**: Auto-hides for small fleets (no clutter)
5. **Mobile-Friendly**: Touch-optimized, responsive design

## 🔄 Future Enhancements (Optional)

- [ ] Sort by registration, type, or home airport
- [ ] Filter by status (active/maintenance/retired)
- [ ] Show total flight hours per aircraft
- [ ] Favorite aircraft (quick access)
- [ ] Recent aircraft used by pilot
- [ ] Filter by aircraft location (if tracking enabled)

## ✅ Testing Checklist

- [x] Search works across all fields (registration, name, type, base)
- [x] Type filter shows all unique aircraft types
- [x] Combined search + filter works correctly
- [x] Filters reset when opening/closing modal
- [x] "Clear Filters" button appears when needed
- [x] Empty state messages are contextual
- [x] Aircraft count updates dynamically
- [x] Search/filter only shows when fleet > 5 aircraft
- [x] No TypeScript errors
- [x] Responsive design works on mobile
