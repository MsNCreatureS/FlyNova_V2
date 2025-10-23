# SimBrief Aircraft Type Error - Fix Documentation

## Problem Description
SimBrief API was returning "Invalid Aircraft Type" error when generating flight plans. Investigation revealed that the `va_fleet.aircraft_type` column was storing full aircraft names (e.g., "Airbus A320neo") instead of ICAO aircraft codes (e.g., "A20N" or "A320").

## Root Cause
The `AircraftSearch` component in `src/components/AircraftSearch.tsx` was incorrectly passing the full aircraft name as the first parameter of its `onChange` callback instead of the ICAO code.

**Incorrect code (line 86):**
```typescript
onChange(aircraft.name, aircraft);
```

The fleet management forms expected the first parameter to be the ICAO code:
```typescript
onChange={(icao, aircraft) => setAircraftForm({
  ...aircraftForm,
  aircraft_type: icao || aircraft.icao_code || aircraft.iata_code || '',
  aircraft_name: aircraft.name
}))
```

## Solution Implemented

### 1. Fixed AircraftSearch Component
**File:** `src/components/AircraftSearch.tsx`

**Changes:**
- Updated the `handleSelectAircraft` function to pass ICAO/IATA code instead of aircraft name
- Updated the interface documentation to reflect the correct parameter type

```typescript
const handleSelectAircraft = (aircraft: Aircraft) => {
  setSelectedAircraft(aircraft);
  setSearchTerm(formatAircraftDisplay(aircraft));
  setShowResults(false);
  // Pass ICAO code as first parameter (falls back to IATA or empty string)
  const aircraftCode = aircraft.icao_code || aircraft.iata_code || '';
  onChange(aircraftCode, aircraft);
};
```

### 2. Created Database Fix Script
**File:** `fix-aircraft-types.sql`

This SQL script updates all existing `va_fleet` records that have full aircraft names in the `aircraft_type` field and replaces them with proper ICAO codes.

**Coverage:**
- Airbus A320 family (A320, A321, A319, A318, neo variants)
- Airbus A330 family (A330-200/300/800/900)
- Airbus A340 family (A340-200/300/500/600)
- Airbus A350 family (A350-900/1000)
- Airbus A380
- Boeing 737 family (737-700/800/900, MAX variants)
- Boeing 747 family (747-400/8)
- Boeing 757 family (757-200/300)
- Boeing 767 family (767-200/300/400)
- Boeing 777 family (777-200/300/8/9, ER/LR variants)
- Boeing 787 family (787-8/9/10)
- Embraer family (E170/175/190/195)
- CRJ family (CRJ-200/700/900/1000)
- ATR family (ATR 42/72)
- Dash 8 family (Q400, Dash 8-300/400)

## Impact Areas

### Forms Fixed:
1. **Add Aircraft Modal** (line ~1096 in manage/page.tsx) ✅
2. **Edit Aircraft Modal** (line ~1533 in manage/page.tsx) ✅
3. **Add Route Modal** (line ~1211 in manage/page.tsx) ✅
4. **Edit Route Modal** (line ~1655 in manage/page.tsx) ✅

All forms now correctly store ICAO codes in the `aircraft_type` field.

## Testing Steps

### 1. Test New Aircraft Creation
1. Navigate to VA Management → Fleet tab
2. Click "+ Add Aircraft"
3. Search for an aircraft (e.g., "A320neo")
4. Select it from the dropdown
5. Complete the form and submit
6. **Expected:** `aircraft_type` field should contain "A20N" (not "Airbus A320neo")

### 2. Test Existing Records
1. Run the `fix-aircraft-types.sql` script on your database
2. Check the `va_fleet` table
3. **Expected:** All aircraft_type values should be 3-5 character ICAO codes

### 3. Test SimBrief Generation
1. Book a flight with a corrected aircraft
2. Navigate to the briefing page
3. Click "Generate Flight Plan" with SimBrief
4. **Expected:** Flight plan generates successfully without "Invalid Aircraft Type" error

### 4. Verify Console Logs
The briefing page has debug logs that show:
```
[SimBrief Debug] Original aircraft_type from flight:
[SimBrief Debug] Final aircraft ICAO code sent to SimBrief:
```
Check that the "Final aircraft ICAO code" is correct (3-5 characters)

## Database Migration Instructions

1. **Backup your database first:**
   ```bash
   mysqldump -u root flynova > flynova_backup_$(date +%Y%m%d).sql
   ```

2. **Run the fix script:**
   ```bash
   mysql -u root flynova < fix-aircraft-types.sql
   ```

3. **Verify the results:**
   ```sql
   SELECT registration, aircraft_type, aircraft_name 
   FROM va_fleet 
   WHERE LENGTH(aircraft_type) > 6;
   ```
   This query should return 0 rows (no aircraft_type values longer than 6 characters)

## Prevention
With the fix in place:
- ✅ New aircraft added via the form will automatically use ICAO codes
- ✅ Existing database records can be fixed with the SQL script
- ✅ The `extractAircraftICAO` fallback function on the briefing page provides additional safety

## Files Modified
1. `src/components/AircraftSearch.tsx` - Fixed to return ICAO code
2. `fix-aircraft-types.sql` - New database migration script

## Related Files (No Changes Needed)
- `src/app/va/[id]/manage/page.tsx` - Already correctly expects ICAO code
- `src/app/va/[id]/pilot/briefing/[flightId]/page.tsx` - Has fallback extraction function
- `server/routes/flights.js` - Passes through aircraft_type as-is

## Notes
- The `extractAircraftICAO` function in the briefing page provides a fallback mechanism for any edge cases
- Aircraft names are still stored correctly in the `aircraft_name` field
- Routes can optionally use aircraft_type for filtering (also fixed to use ICAO codes)
