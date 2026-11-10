/**
 * ApexECU Studio - Type Definitions
 */

export interface VehicleIdentity {
  make: string;
  model: string;
  variant: string;
  engine: string;
  displacement: string;
  fuelType: 'Diesel' | 'Petrol' | 'Bike EFI';
  transmission: string;
  ecuFamily: string;
  hardwareNumber: string;
  softwareNumber: string;
  softwareVersion: string;
  vinCode: string;
  year: number;
}

export interface StoredFaultCode {
  code: string;
  description: string;
  descriptionMizo: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'Active' | 'Pending' | 'Historical';
  freezeFrame?: {
    rpm: number;
    speedKmH: number;
    coolantTempC: number;
    loadPercent: number;
  };
}

export interface EcuMapDefinition {
  id: string;
  name: string;
  nameMizo: string;
  category: 'fuel' | 'boost' | 'ignition' | 'limits' | 'emissions';
  description: string;
  descriptionMizo: string;
  offset: number; // Hex byte address in binary
  rows: number;   // Engine load / Throttle / Pressure
  cols: number;   // Engine RPM points
  xAxis: {
    name: string;
    unit: string;
    values: number[];
  };
  yAxis: {
    name: string;
    unit: string;
    values: number[];
  };
  zUnit: string;
  factor: number;
  offsetAdd: number;
  originalData: number[][];
  data: number[][];
}

export interface ForensicItem {
  component: string;
  componentMizo: string;
  finding: string;
  findingMizo: string;
  status: 'stock' | 'modified' | 'risky';
  detail: string;
}

export interface ForensicReport {
  status: 'stock' | 'already_modified' | 'corrupt';
  isFactoryStock: boolean;
  riskLevel: 'safe' | 'moderate' | 'high';
  detectedMods: string[];
  detectedModsMizo: string[];
  findings: ForensicItem[];
  previousTunerSignature?: string;
  flashWriteCount: number;
}

export interface ImmoStatus {
  supported: boolean;
  active: boolean; // true = Immo ON (factory locked), false = Immo OFF (bypassed)
  state: 'active' | 'disabled' | 'virgin' | 'locked_otp';
  patchAddress?: number;
  ecuNotes: string;
  ecuNotesMizo: string;
}

export interface FeatureAuditItem {
  id: string;
  name: string;
  nameMizo: string;
  status: 'supported' | 'protected' | 'incompatible';
  badge: 'green' | 'red' | 'amber';
  description: string;
  descriptionMizo: string;
  safetyReason?: string;
}

export interface TuneMetrics {
  stockHp: number;
  tunedHp: number;
  stockTorqueNm: number;
  tunedTorqueNm: number;
  stockBoostBar: number;
  tunedBoostBar: number;
  stockRailBar: number;
  tunedRailBar: number;
  stockRevLimitRpm: number;
  tunedRevLimitRpm: number;
  launchControlEnabled: boolean;
  launchControlRpm: number;
  popBangEnabled: boolean;
  popBangDelayMs: number;
  egrDisabled: boolean;
  dpfDisabled: boolean;
  catDisabled: boolean;
  dtcMaskedCodes: string[];
}

export interface ProjectChangelogEntry {
  timestamp: string;
  action: string;
  actionMizo: string;
  details: string;
}

export interface Project {
  id: string;
  name: string;
  customerName: string;
  customerPhone: string;
  vehiclePlate: string;
  odometerKm: number;
  date: string;
  workshopName: string;
  tunerName: string;
  notes: string;
  vehicle: VehicleIdentity;
  originalSha256: string;
  tunedSha256: string;
  checksumValid: boolean;
  checksumValue: string;
  fileSize: number;
  fileName: string;
  isSample: boolean;
  forensicReport: ForensicReport;
  immoStatus: ImmoStatus;
  storedFaults: StoredFaultCode[];
  maps: EcuMapDefinition[];
  selectedMapId: string;
  tuneMetrics: TuneMetrics;
  auditItems: FeatureAuditItem[];
  changelog: ProjectChangelogEntry[];
  createdAt: string;
  updatedAt: string;
}
