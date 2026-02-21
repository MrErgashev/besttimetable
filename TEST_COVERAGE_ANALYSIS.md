# Test Coverage Analysis

## Current State

The codebase has **zero test coverage**. There are no test files, no testing dependencies, no test runner configuration, and no test scripts in `package.json`. The project has ~8,400 lines of application code across algorithms, parsers, stores, hooks, and components with no automated verification.

---

## Recommended Test Setup

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Vitest is recommended over Jest for this project because it has native ESM and TypeScript support, faster startup, and aligns well with the Next.js/Vite ecosystem.

---

## Priority Areas for Testing

### Priority 1: Scheduling Constraint System (Critical, High ROI)

**Files:** `src/lib/generator/constraints.ts` (311 lines)

This is the most business-critical code in the project. Constraint violations produce invalid timetables (double-booked teachers, overflowing rooms, conflicting groups). Every function here is a pure function that takes a context object and returns a boolean or number — ideal for unit testing.

**Functions to test:**

| Function | What to verify |
|----------|---------------|
| `isTeacherFree()` | Returns false when teacher already has an entry at that day+slot; true otherwise |
| `isRoomFree()` | Returns false when room is occupied at that day+slot |
| `isGroupFree()` | Returns false when any group in `group_ids` already has an entry |
| `roomHasCapacity()` | Returns false when total students exceed room capacity; handles missing room/group |
| `roomTypeMatches()` | Lab subjects require lab rooms; "oddiy" accepts any room type; missing room returns false |
| `checkHardConstraints()` | Composite check — rejects if any single hard constraint fails; validates track/slot alignment |
| `calculatePenalty()` | Consecutive lesson penalty scales correctly; last-slot avoidance; even distribution; first-year morning preference; weekly hour overflow |
| `detectConflicts()` | Finds teacher double-bookings, room double-bookings, group double-bookings, and capacity overflows across full schedule |

**Specific edge cases:**

- Empty `existingEntries` array (everything should be free)
- Room or teacher ID not found in context arrays
- Group with `student_count` of 0
- `constraints` with all soft constraints disabled (all penalties should be 0)
- Track mismatch between group and slot (hard reject)
- Multiple conflicts in the same timeslot

### Priority 2: Import Mapper & Fuzzy Matching (High ROI)

**Files:** `src/lib/import/mapper.ts` (257 lines)

The mapper converts raw imported strings into database IDs using fuzzy matching. Bugs here silently produce wrong mappings (assigning the wrong teacher or room to a lesson).

**Functions to test:**

| Function | What to verify |
|----------|---------------|
| `normalize()` | Lowercases, normalizes apostrophe variants (`'`, `ʻ`, `ʼ`), collapses whitespace |
| `similarity()` | Exact match returns 1.0; substring match returns 0.8; character overlap calculated correctly |
| `findBestMatch()` | Returns null for empty input; returns null when best score < 0.5; picks highest-scoring match |
| `matchDay()` | Maps Uzbek day names, English names, abbreviations ("du", "se"), and numbers ("1"-"5") |
| `matchSlot()` | Matches by slot ID, time string ("08:30-10:00"), pora number ("1-pora"), and label |
| `mapParsedRows()` | Successfully maps complete rows; collects unmapped rows with specific reasons; handles missing fields; stats are accurate |

**Specific edge cases:**

- Input with mixed Cyrillic/Latin characters
- Day input as just a number vs. a word
- Time input in non-standard formats ("8:30" vs "08:30")
- Subject name that fuzzy-matches multiple subjects (pick the best one)
- Row with all fields present but no matching entities (should go to unmapped)
- Empty rows array (stats should all be 0)
- `defaultGroupId` fallback when row has no group field

### Priority 3: Import Validator (High ROI)

**File:** `src/lib/import/master-data-validator.ts` (121 lines)

Pure validation logic that checks imported data for required fields and duplicates.

**Functions to test:**

| Function | What to verify |
|----------|---------------|
| `validateMasterData()` | Required fields missing → error with correct rowIndex; duplicates against existing data detected; duplicates within the same import batch detected; default values applied for unmapped fields; stats counts are consistent (total = valid + errors + duplicates); convertValue called correctly for each field type |

**Specific edge cases:**

- All rows valid (no errors, no duplicates)
- All rows invalid (all errors)
- Case-insensitive duplicate detection
- Multiple required fields missing on same row
- Empty `rows` array
- Empty `existingItems` array

### Priority 4: Greedy Scheduling Algorithm (Medium ROI, Higher Complexity)

**Files:** `src/lib/generator/greedy.ts` (338 lines)

The core scheduling algorithm. Harder to test due to randomness in tie-breaking, but the deterministic parts are testable.

**Functions to test:**

| Function | What to verify |
|----------|---------------|
| `expandLoadsToLessons()` | 3 weekly_hours → 2 lessons (ceil(3/1.5)); 1.5 hours → 1 lesson; 0 hours → 0 lessons |
| `countAvailableSlots()` | Returns 0 when group not found; counts only track-matching slots; decreases as entries fill slots |
| `sortByMostConstrained()` | Loads with fewer available slots appear first; doesn't mutate original array |
| `generateGreedy()` | Places all lessons when resources are abundant; returns "partial" status when some lessons can't be placed; respects existing entries; calls onProgress callback |
| `generateGreedyWithEntries()` | Returns both result and the new entries; new entries don't include pre-existing ones |

**Specific edge cases:**

- No rooms matching required type → all unplaced
- Single group, single teacher, single room, multiple loads → fills sequentially
- `existingEntries` pre-fill all slots → nothing placed
- Empty `loads` array → total=0, placed=0, status="complete"

### Priority 5: Zustand Stores (Easy wins, 100% coverage achievable)

**Files:** `src/stores/*.ts` (514 lines total, 7 stores)

All 7 stores follow the same CRUD pattern. They're straightforward to test by calling actions and asserting state.

**What to test per store:**

- **Add**: creates entity with nanoid ID and timestamps
- **Update**: modifies only the targeted entity, preserves others
- **Remove**: filters out by ID, no error on missing ID
- **Bulk operations**: `bulkLoad` replaces entire array, `clearAll` empties it
- **Lookup getters**: `getCell`, `getEntriesForGroup`, `getEntriesForTeacher`, `getEntriesForRoom` filter correctly
- **Move**: `moveEntry` updates day, slot_id, and updated_at

**useTimetableStore-specific:**
- `placeEntry` returns the created entry with generated ID
- `getCell` matches by day + slotId + groupId (checks `group_ids.includes`)

### Priority 6: Utility Functions (Quick wins)

**File:** `src/lib/utils.ts` (55 lines)

All pure functions, trivially testable.

| Function | What to verify |
|----------|---------------|
| `cn()` | Joins truthy values, skips undefined/null/false |
| `formatDate()` | Accepts both Date and string input |
| `formatShortDate()` | Correct DD.MM.YYYY format |
| `getCurrentWeekRange()` | Monday-Friday range; works on weekends (rolls back to Monday) |
| `truncate()` | Returns original if within limit; adds ellipsis at boundary |
| `getColorByIndex()` | Wraps around palette length |

---

## Lower Priority (Phase 2)

### Backtracking Algorithm
**File:** `src/lib/generator/backtrack.ts` (391 lines)

Complex stateful logic with nested loops. Test at the integration level: provide a partially-filled schedule with known conflicts and verify that `backtrackRepair` resolves them or reports failure.

### Export Functions
**Files:** `src/lib/export/excel.ts`, `src/lib/export/pdf.ts` (346 lines)

Side-effectful (file generation). Test the data transformation logic by mocking `XLSX.writeFile` and `jsPDF.save`, then asserting the table/sheet data structures are correct.

### Excel/Word Parsers
**Files:** `src/lib/import/excel-parser.ts`, `src/lib/import/word-parser.ts` (418 lines)

Depend on external libraries (xlsx, mammoth). Test with small fixture files. Verify format detection (list vs. grid), header extraction, and row parsing.

### Hooks
Test `useRoleAccess` and `useHydration` (pure logic). The others (`useAuth`, `useRealtimeSchedule`, `useSpecularLight`) require extensive mocking and are lower priority.

### Components
Component tests require React Testing Library with full store/theme provider setup. Start with `AlertsPanel` and `QuickStats` (data display) before tackling `DataTable` or `TimetableGrid` (complex interactions + drag-and-drop).

---

## Suggested Test File Structure

```
src/
  __tests__/                        # or colocate with source files
    lib/
      utils.test.ts
      generator/
        constraints.test.ts         # Priority 1
        greedy.test.ts              # Priority 4
        backtrack.test.ts           # Phase 2
      import/
        mapper.test.ts              # Priority 2
        master-data-validator.test.ts  # Priority 3
        excel-parser.test.ts        # Phase 2
        paste-parser.test.ts        # Phase 2
      export/
        excel.test.ts               # Phase 2
        pdf.test.ts                 # Phase 2
    stores/
      useTimetableStore.test.ts     # Priority 5
      useTeacherStore.test.ts
      useGroupStore.test.ts
      useSubjectStore.test.ts
      useRoomStore.test.ts
      useSubjectLoadStore.test.ts
    hooks/
      useRoleAccess.test.ts         # Phase 2
      useHydration.test.ts          # Phase 2
    components/
      dashboard/
        QuickStats.test.tsx         # Phase 2
        AlertsPanel.test.tsx        # Phase 2
  __fixtures__/                     # Shared test data
    schedule-entries.ts
    teachers.ts
    rooms.ts
    groups.ts
    subject-loads.ts
```

---

## Summary Table

| Priority | Area | Files | Lines | Effort | Impact |
|----------|------|-------|-------|--------|--------|
| 1 | Constraint system | constraints.ts | 311 | Low | **Critical** — invalid schedules |
| 2 | Import mapper | mapper.ts | 257 | Low | **High** — wrong data mappings |
| 3 | Import validator | master-data-validator.ts | 121 | Low | **High** — bad data enters system |
| 4 | Greedy algorithm | greedy.ts | 338 | Medium | **High** — broken generation |
| 5 | Zustand stores | 7 files | 514 | Low | **Medium** — state management bugs |
| 6 | Utilities | utils.ts | 55 | Trivial | **Low** — small surface area |
| Phase 2 | Backtracking, export, parsers, hooks, components | ~15 files | ~2,500 | High | **Medium** — less frequent code paths |
