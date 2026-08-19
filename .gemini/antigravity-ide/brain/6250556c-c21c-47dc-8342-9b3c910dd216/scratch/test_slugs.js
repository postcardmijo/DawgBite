async function test() {
  const slugs = [
    'hillside',
    'hillside-dining-commons',
    'hillside-dining',
    'the-hillside',
    'the-hillside-dining-commons',
    'dining-hall-6',
    'dining-hall-7',
    'dining-hall-8',
    'hillside-commons',
    'uga-hillside',
    'hillside-hall'
  ];

  // Also query the schools endpoint if available
  try {
    const schoolsResp = await fetch('https://uga.api.nutrislice.com/menu/api/schools/?format=json');
    if (schoolsResp.ok) {
      const schools = await schoolsResp.json();
      console.log('Schools from Nutrislice API:');
      console.log(JSON.stringify(schools, null, 2));
    } else {
      console.log('Schools endpoint status:', schoolsResp.status);
    }
  } catch (e) {
    console.log('Error fetching schools:', e.message);
  }

  const year = 2026, month = '08', day = '19';
  for (const s of slugs) {
    const url = `https://uga.api.nutrislice.com/menu/api/weeks/school/${s}/menu-type/lunch/${year}/${month}/${day}/?format=json`;
    try {
      const r = await fetch(url);
      console.log(`Slug: ${s} => Status: ${r.status}`);
    } catch(e) {
      console.log(`Slug: ${s} => Error: ${e.message}`);
    }
  }
}
test();
