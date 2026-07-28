// Utility map to synchronize Excel district names with TopoJSON district names

const EXCEL_TO_TOPO_MAP = {
  'Banas Kantha': 'Banaskantha',
  'Arvalli': 'Aravalli',
  'Kachchh': 'Kutch',
  'Gir-Somnath': 'Gir Somnath',
  'Panch Mahals': 'Panchmahal',
  'Sabar Kantha': 'Sabarkantha',
  'Mahesana': 'Mehsana',
  'Chhota Udepur': 'Chhota Udaipur',
  'The Dangs': 'Dang'
}

const TOPO_TO_EXCEL_MAP = Object.entries(EXCEL_TO_TOPO_MAP).reduce((acc, [excel, topo]) => {
  acc[topo] = excel
  return acc
}, {})

/**
 * Normalizes a district name from TopoJSON to match Excel name or vice versa
 */
export function getExcelDistrictName(topoName) {
  if (!topoName) return ''
  return TOPO_TO_EXCEL_MAP[topoName] || topoName
}

export function getTopoDistrictName(excelName) {
  if (!excelName) return ''
  return EXCEL_TO_TOPO_MAP[excelName] || excelName
}

/**
 * Normalizes any district string for flexible comparison
 */
export function normalizeDistrict(name) {
  if (!name) return ''
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}
