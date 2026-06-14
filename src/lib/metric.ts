export interface ParsedMetric {
  prefix: string;
  end: number;
  suffix: string;
  decimals: number;
}

export function parseMetric(raw: string): ParsedMetric {
  const value = (raw ?? '').toString().trim();
  const m = value.match(/^([^\d\-+]*?)\s*([\-+]?\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*([^\d\s]*)$/);
  if (!m) {
    return { prefix: '', end: 0, suffix: value, decimals: 0 };
  }
  const [, prefix, num, suffix] = m;
  const normalized = num.replace(/,/g, '');
  const end = parseFloat(normalized);
  const decimals = normalized.split('.')[1]?.length ?? 0;
  return {
    prefix: prefix ?? '',
    end: isNaN(end) ? 0 : end,
    suffix: suffix ?? '',
    decimals,
  };
}
