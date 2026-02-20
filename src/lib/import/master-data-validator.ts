import { type FieldMapping, convertValue } from "./column-mapping";

// ─── Validation Types ────────────────────────────────────────────────────────

export interface ValidationError {
  rowIndex: number;
  field: string;
  message: string;
}

export interface ValidationResult {
  validItems: Record<string, unknown>[];
  errors: ValidationError[];
  duplicates: number;
  stats: {
    total: number;
    valid: number;
    errors: number;
    duplicates: number;
  };
}

// ─── Validate Master Data ────────────────────────────────────────────────────

export function validateMasterData(
  rows: string[][],
  headers: string[],
  columnMap: Record<number, string>,
  fields: FieldMapping[],
  existingItems: Record<string, unknown>[],
  duplicateCheckKeys: string[]
): ValidationResult {
  const fieldMap = new Map<string, FieldMapping>();
  for (const f of fields) fieldMap.set(f.key, f);

  const requiredKeys = fields.filter((f) => f.required).map((f) => f.key);
  const errors: ValidationError[] = [];
  const validItems: Record<string, unknown>[] = [];
  let duplicateCount = 0;

  // Build set of existing values for duplicate checking
  const existingValueSets = duplicateCheckKeys.map((key) =>
    new Set(existingItems.map((item) => String(item[key] || "").toLowerCase()))
  );

  // Track values added in this import for internal duplicate detection
  const importedValueSets = duplicateCheckKeys.map(() => new Set<string>());

  for (let ri = 0; ri < rows.length; ri++) {
    const row = rows[ri];
    const item: Record<string, unknown> = {};
    let hasError = false;

    // Map values
    for (const [colIdx, fieldKey] of Object.entries(columnMap)) {
      const field = fieldMap.get(fieldKey);
      if (!field) continue;
      const raw = row[Number(colIdx)] || "";
      item[fieldKey] = convertValue(raw, field);
    }

    // Apply defaults for unmapped fields
    for (const field of fields) {
      if (item[field.key] === undefined && field.defaultValue !== undefined) {
        item[field.key] = field.defaultValue;
      }
    }

    // Check required fields
    for (const key of requiredKeys) {
      if (item[key] === undefined || item[key] === "") {
        const field = fieldMap.get(key);
        errors.push({
          rowIndex: ri,
          field: key,
          message: `"${field?.label || key}" majburiy`,
        });
        hasError = true;
      }
    }

    // Check for duplicates against existing data
    if (!hasError && duplicateCheckKeys.length > 0) {
      const isDuplicate = duplicateCheckKeys.every((key, ki) => {
        const val = String(item[key] || "").toLowerCase();
        return existingValueSets[ki].has(val) || importedValueSets[ki].has(val);
      });

      if (isDuplicate) {
        duplicateCount++;
        const dupFields = duplicateCheckKeys.map((k) => item[k]).join(" ");
        errors.push({
          rowIndex: ri,
          field: duplicateCheckKeys[0],
          message: `"${dupFields}" allaqachon mavjud`,
        });
        hasError = true;
      }
    }

    if (!hasError) {
      // Track for internal duplicate detection
      duplicateCheckKeys.forEach((key, ki) => {
        importedValueSets[ki].add(String(item[key] || "").toLowerCase());
      });
      validItems.push(item);
    }
  }

  return {
    validItems,
    errors,
    duplicates: duplicateCount,
    stats: {
      total: rows.length,
      valid: validItems.length,
      errors: errors.length - duplicateCount,
      duplicates: duplicateCount,
    },
  };
}
