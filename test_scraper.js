const ORG = "uga";
const HALL_MAP = {
  "dining-hall-1": "Bolton Dining Commons",
  "dining-hall-2": "Oglethorpe Dining Commons",
  "dining-hall-3": "Snelling Dining Commons",
  "dining-hall-4": "The Niche (Health Sciences Campus)",
  "dining-hall-5": "The Village Summit (Joe Frank Harris)",
  "dining-hall-6": "West Campus Dining Commons",
};

const DINING_HALLS = Object.keys(HALL_MAP);
const MEALS = [
  "breakfast",
  "lunch",
  "dinner",
  "late-1",
  "late-2",
  "over-night",
];

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");
const dateString = `${year}-${month}-${day}`;

async function run() {
  console.log(`Checking date: ${dateString}`);
  for (const hall of DINING_HALLS) {
    let successMeals = [];
    let errors = [];
    for (const meal of MEALS) {
      const url = `https://${ORG}.api.nutrislice.com/menu/api/weeks/school/${hall}/menu-type/${meal}/${year}/${month}/${day}/?format=json`;
      try {
        const resp = await fetch(url);
        if (resp.ok) {
          const data = await resp.json();
          const todayData = (data.days || []).find(d => d.date === dateString);
          const hasFood = todayData && todayData.menu_items && todayData.menu_items.filter(it => it.food).length > 0;
          if (hasFood) {
            successMeals.push(`${meal} (items present)`);
          } else if (todayData) {
            successMeals.push(`${meal} (empty)`);
          } else {
            successMeals.push(`${meal} (no day data)`);
          }
        } else {
          errors.push(`${meal}: ${resp.status}`);
        }
      } catch (e) {
        errors.push(`${meal}: ${e.message}`);
      }
    }
    console.log(`Hall: ${HALL_MAP[hall]} (${hall})`);
    if (successMeals.length > 0) console.log(`  Success: ${successMeals.join(", ")}`);
    if (errors.length > 0) console.log(`  Errors: ${errors.join(", ")}`);
  }
}

run();
