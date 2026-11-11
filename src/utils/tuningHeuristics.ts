import { EcuMapDefinition } from '../types/ecu';

export interface TuningHazard {
  id: string;
  type: 'cliff' | 'overboost' | 'knock' | 'rail_high' | 'lean_spike';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  titleMizo: string;
  description: string;
  descriptionMizo: string;
  affectedCells: { row: number; col: number; val: number; safeTarget?: number }[];
  suggestedAction: 'smooth' | 'clamp' | 'revert';
  safeClampValue?: number;
}

/**
 * Scan a map matrix for calibration risks, extreme cliffs, and physics limits
 */
export function analyzeMapHazards(map: EcuMapDefinition): TuningHazard[] {
  const hazards: TuningHazard[] = [];
  const rows = map.rows;
  const cols = map.cols;
  const data = map.data;
  const orig = map.originalData;

  const isBoostMap = map.category === 'boost' || map.id.includes('boost');
  const isIgnitionMap = map.category === 'ignition';
  const isRailMap = map.id.includes('rail');

  // 1. Check for Overboost beyond turbocharger safety limits
  if (isBoostMap) {
    const overboostCells: { row: number; col: number; val: number; safeTarget?: number }[] = [];
    const maxSafeBoost = 2400; // mbar absolute ceiling for typical 2.2/1.3 CRDe

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (data[r][c] > maxSafeBoost) {
          overboostCells.push({ row: r, col: c, val: data[r][c], safeTarget: maxSafeBoost });
        }
      }
    }

    if (overboostCells.length > 0) {
      const peakVal = Math.max(...overboostCells.map(c => c.val));
      hazards.push({
        id: 'hazard-overboost',
        type: 'overboost',
        severity: 'critical',
        title: `Excessive Turbo Boost Pressure Detected (${peakVal} mbar)`,
        titleMizo: `Turbo Boost Sang Lutuk A Awm (${peakVal} mbar)`,
        description: `Boost exceeds safe mechanical limit of ${maxSafeBoost} mbar by +${peakVal - maxSafeBoost} mbar. Risk of turbine overspeed and intercooler blowout.`,
        descriptionMizo: `Boost pressure hi ${maxSafeBoost} mbar aiin a sang lutuk (+${peakVal - maxSafeBoost} mbar). Turbocharger keh emaw boost pipe puak a hlauhawm.`,
        affectedCells: overboostCells,
        suggestedAction: 'clamp',
        safeClampValue: maxSafeBoost,
      });
    }
  }

  // 2. Check for Excessive Ignition Advance (Detonation / Knock hazard)
  if (isIgnitionMap) {
    const knockCells: { row: number; col: number; val: number; safeTarget?: number }[] = [];
    const maxSafeTiming = 38; // deg BTDC

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const origVal = orig[r]?.[c] ?? data[r][c];
        const advanceDelta = data[r][c] - origVal;

        if (data[r][c] > maxSafeTiming || advanceDelta > 6.0) {
          knockCells.push({ row: r, col: c, val: data[r][c], safeTarget: Math.min(maxSafeTiming, origVal + 3.0) });
        }
      }
    }

    if (knockCells.length > 0) {
      hazards.push({
        id: 'hazard-knock',
        type: 'knock',
        severity: 'critical',
        title: 'Severe Spark Advance — Engine Knock Hazard',
        titleMizo: 'Ignition Advance Sang Lutuk — Engine Knocking A Hlauhawm',
        description: `Ignition timing advanced beyond safe combustion window. High risk of detonation/pinging and piston crown pitting.`,
        descriptionMizo: `Spark plug-in meipui a chhem hma lutuk a, engine cylinder chhung knocking/ri chik chik leh piston chhiat a hlauhawm.`,
        affectedCells: knockCells,
        suggestedAction: 'clamp',
        safeClampValue: maxSafeTiming,
      });
    }
  }

  // 3. Check for High Rail Pressure Over-stress
  if (isRailMap) {
    const highRailCells: { row: number; col: number; val: number; safeTarget?: number }[] = [];
    const maxSafeRail = 1800; // Bar

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (data[r][c] > maxSafeRail) {
          highRailCells.push({ row: r, col: c, val: data[r][c], safeTarget: maxSafeRail });
        }
      }
    }

    if (highRailCells.length > 0) {
      hazards.push({
        id: 'hazard-rail',
        type: 'rail_high',
        severity: 'warning',
        title: 'Common Rail Over-Pressurization',
        titleMizo: 'Common Rail Pressure Sang Lutuk',
        description: `Fuel rail pressure exceeds high-pressure pump mechanical specification of ${maxSafeRail} Bar.`,
        descriptionMizo: `Diesel high-pressure pump tana him tawk ${maxSafeRail} Bar a pel a, pump chhiat a hlauhawm.`,
        affectedCells: highRailCells,
        suggestedAction: 'clamp',
        safeClampValue: maxSafeRail,
      });
    }
  }

  // 4. Check for Steep Gradient Cliffs (Jagged Cell Spikes)
  const cliffCells: { row: number; col: number; val: number }[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const current = data[r][c];

      // Check right neighbor
      if (c < cols - 1) {
        const nextCol = data[r][c + 1];
        const diff = Math.abs(current - nextCol);
        const avg = (Math.abs(current) + Math.abs(nextCol)) / 2;
        if (avg > 10 && diff / avg > 0.40) {
          cliffCells.push({ row: r, col: c, val: current });
        }
      }

      // Check bottom neighbor
      if (r < rows - 1) {
        const nextRow = data[r + 1][c];
        const diff = Math.abs(current - nextRow);
        const avg = (Math.abs(current) + Math.abs(nextRow)) / 2;
        if (avg > 10 && diff / avg > 0.40) {
          cliffCells.push({ row: r, col: c, val: current });
        }
      }
    }
  }

  if (cliffCells.length > 0) {
    hazards.push({
      id: 'hazard-cliff',
      type: 'cliff',
      severity: 'warning',
      title: `Jagged Surface Spikes Detected (${cliffCells.length} cells)`,
      titleMizo: `Map Cell Inkar Inthlau Lutuk (${cliffCells.length} cells)`,
      description: `Steep gradient cliff (>40% delta between adjacent cells). Will cause throttle jerk and uneven power delivery.`,
      descriptionMizo: `Cell inkar inthlau lutuk vanga motor kal lai phut zawk zawk leh zia chhe tur siamrem a ngai.`,
      affectedCells: cliffCells.slice(0, 8),
      suggestedAction: 'smooth',
    });
  }

  return hazards;
}

/**
 * Apply 3x3 Gaussian smoothing algorithm to eliminate steep jagged cliffs
 */
export function smoothMapMatrix(data: number[][]): number[][] {
  const rows = data.length;
  const cols = data[0].length;
  const smoothed: number[][] = [];

  for (let r = 0; r < rows; r++) {
    const newRow: number[] = [];
    for (let c = 0; c < cols; c++) {
      let sum = 0;
      let count = 0;

      // 3x3 local neighborhood
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const weight = dr === 0 && dc === 0 ? 2 : 1;
            sum += data[nr][nc] * weight;
            count += weight;
          }
        }
      }

      newRow.push(Math.round((sum / count) * 10) / 10);
    }
    smoothed.push(newRow);
  }

  return smoothed;
}

/**
 * Clamp map values to a safe ceiling
 */
export function clampMapMatrix(data: number[][], ceiling: number): number[][] {
  return data.map(row => row.map(val => (val > ceiling ? ceiling : val)));
}
