const RACES = {
  1:  { name: 'Human',      faction: 'alliance' },
  2:  { name: 'Orc',        faction: 'horde' },
  3:  { name: 'Dwarf',      faction: 'alliance' },
  4:  { name: 'Night Elf',  faction: 'alliance' },
  5:  { name: 'Undead',     faction: 'horde' },
  6:  { name: 'Tauren',     faction: 'horde' },
  7:  { name: 'Gnome',      faction: 'alliance' },
  8:  { name: 'Troll',      faction: 'horde' },
  10: { name: 'Blood Elf',  faction: 'horde' },
  11: { name: 'Draenei',    faction: 'alliance' },
};

const CLASSES = {
  1:  'Warrior',
  2:  'Paladin',
  3:  'Hunter',
  4:  'Rogue',
  5:  'Priest',
  6:  'Death Knight',
  7:  'Shaman',
  8:  'Mage',
  9:  'Warlock',
  11: 'Druid',
};

const ZONES = {
  // Eastern Kingdoms
  1:    'Dun Morogh',
  12:   'Elwynn Forest',
  14:   'Dustwallow Marsh',
  22:   "Stranglethorn Vale",
  26:   'Blackrock Mountain',
  28:   'Western Plaguelands',
  38:   'Loch Modan',
  40:   'Westfall',
  41:   'Deadwind Pass',
  44:   'Redridge Mountains',
  45:   'Arathi Highlands',
  46:   'Burning Steppes',
  47:   'The Hinterlands',
  51:   'Searing Gorge',
  85:   'Tirisfal Glades',
  130:  'Silverpine Forest',
  139:  'Eastern Plaguelands',
  267:  'Hillsbrad Foothills',
  364:  'Duskwood',
  365:  'Wetlands',
  1519: 'Stormwind City',
  1537: 'Ironforge',
  // Kalimdor
  141:  'Teldrassil',
  148:  'Darkshore',
  215:  'Mulgore',
  331:  'Ashenvale',
  357:  'Feralas',
  361:  'Felwood',
  362:  'Moonglade',
  363:  'Azshara',
  367:  'Thousand Needles',
  400:  'Tanaris',
  405:  "Un'Goro Crater",
  406:  'Silithus',
  1637: 'Orgrimmar',
  1638: 'Thunder Bluff',
  1657: 'Darnassus',
  3430: 'Eversong Woods',
  3433: 'Ghostlands',
  3524: 'Azuremyst Isle',
  3525: 'Bloodmyst Isle',
  3557: 'The Exodar',
  3487: 'Silvermoon City',
  // Outland
  3483: 'Hellfire Peninsula',
  3518: 'Nagrand',
  3519: 'Terokkar Forest',
  3520: 'Shadowmoon Valley',
  3521: "Zangarmarsh",
  3522: "Nagrand",
  3523: "Blade's Edge Mountains",
  3703: 'Shattrath City',
  // Northrend
  65:   'Dragonblight',
  66:   "Zul'Drak",
  67:   'Icecrown',
  74:   'The Storm Peaks',
  3537: 'Borean Tundra',
  3711: 'Howling Fjord',
  4197: 'Wintergrasp',
  4395: 'Dalaran',
  4742: 'Hrothgar\'s Landing',
  // Instances / common indoor areas
  721:  'Gnomeregan',
  796:  'Scarlet Monastery',
  1196: 'Blackrock Depths',
  1477: 'Un\'Goro Crater',
  2557: 'Dire Maul',
  2597: 'Alterac Valley',
  2677: 'Warsong Gulch',
  3277: 'Stratholme',
  3358: 'Arathi Basin',
  3456: 'Naxxramas',
  3457: 'Plaguelands: The Scarlet Enclave',
  4100: 'The Oculus',
  4120: 'The Nexus',
  4196: 'Vault of Archavon',
  4273: "Ulduar",
  4493: 'Ulduar',
  4812: 'Trial of the Crusader',
  4820: "Trial of the Champion",
  4987: "Icecrown Citadel",
};

function resolveZone(zoneId) {
  return ZONES[zoneId] || `Unknown Zone (${zoneId})`;
}

function resolveRace(raceId) {
  return RACES[raceId] || { name: `Unknown (${raceId})`, faction: 'neutral' };
}

function resolveClass(classId) {
  return CLASSES[classId] || `Unknown (${classId})`;
}

module.exports = { resolveZone, resolveRace, resolveClass };
