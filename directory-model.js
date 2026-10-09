/* Explicit brand groups. Similar institution names alone do not imply one company. */
const COMPANY_NAMES = new Map([
  ...[5,6,22,23,42,49].map(id=>[id,'Laboratório Médico Vital Brasil']),
  ...[9,21,29].map(id=>[id,'Cepac']),
  ...[4,7].map(id=>[id,'Instituto Santa Rosa']),
  ...[17,46].map(id=>[id,'BioCenter'])
]);
const normalizeSearch = value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const COMPANIES = [...PARTNERS.reduce((groups,unit)=>{
  const name=COMPANY_NAMES.get(unit.id)||unit.name;
  const key=COMPANY_NAMES.has(unit.id)?name:`unit-${unit.id}`;
  if(!groups.has(key))groups.set(key,{id:unit.id,name,image:unit.image,units:[]});
  groups.get(key).units.push(unit);
  return groups;
},new Map()).values()];
function filterCompanies({query='',city='',category='todos',specialty=''}={}){
  const terms=normalizeSearch(query).split(/\s+/).filter(Boolean);
  return COMPANIES.map(company=>({...company,matchingUnits:company.units.filter(unit=>{
    const text=normalizeSearch([company.name,unit.name,unit.city,unit.address,...unit.specialties].join(' '));
    return (!city||unit.city===city)&&(category==='todos'||unit.categories.includes(category))&&(!specialty||unit.specialties.includes(specialty))&&terms.every(term=>text.includes(term));
  })})).filter(company=>company.matchingUnits.length);
}
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
