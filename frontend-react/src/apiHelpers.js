import { TABLES } from './constants';

const getTableSchema = (tableName) => TABLES.find((t) => t.name === tableName);

export const getPrimaryKeyField = (tableName) => {
  const schema = getTableSchema(tableName);
  const pk = schema?.attributes.find((attr) => attr.isPrimary);
  return pk?.name ?? null;
};

export const coerceFieldValue = (attr, rawValue) => {
  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return rawValue;
  }

  switch (attr.type) {
    case 'int':
      return Number.parseInt(String(rawValue).trim(), 10);
    case 'decimal':
      return Number.parseFloat(String(rawValue).trim());
    case 'boolean':
      if (typeof rawValue === 'boolean') return rawValue;
      return String(rawValue).toLowerCase() === 'true';
    default:
      return String(rawValue).trim();
  }
};

export const coerceRowForTable = (tableName, row) => {
  const schema = getTableSchema(tableName);
  if (!schema) return row;

  const coerced = {};
  for (const [field, value] of Object.entries(row)) {
    if (value === '' || value === null || value === undefined) continue;
    const attr = schema.attributes.find((a) => a.name === field);
    coerced[field] = attr ? coerceFieldValue(attr, value) : value;
  }
  return coerced;
};

export const coerceAttributesForTable = (tableName, attributes) => {
  const schema = getTableSchema(tableName);
  if (!schema) return attributes;

  const coerced = {};
  for (const [field, value] of Object.entries(attributes)) {
    if (value === '' || value === null || value === undefined) continue;
    const attr = schema.attributes.find((a) => a.name === field);
    coerced[field] = attr ? coerceFieldValue(attr, value) : value;
  }
  return coerced;
};

export const parseApiError = async (response) => {
  try {
    const data = await response.json();
    return data.error || data.message || response.statusText;
  } catch {
    return response.statusText;
  }
};
