// APP-6(D) Edition D Version 1 sector modifier dictionaries (Annex A).
//
// Generated once from Tables A-11, A-12, A-14, A-15, A-17, A-18, A-20, A-21, A-26,
// A-28, A-29, A-35, A-36, A-38 and A-39 (physical PDF pages 735-815; printed page =
// physical page - 714, prefixed "A-"). The names are labels for editors only: the
// renderer draws the graphic or letters from the icon parts, never the name.
// Code 00 means "no modifier"; 99 is the Version Extension Flag (not an ordinary
// modifier); "reserved" lists inclusive code ranges that are reserved for future use.
// Set 36 (Mine Warfare), set 00 (Unknown) and Land Equipment sector 2 have no
// dictionary in this edition.
export const app6dSectorDictionaries = {
  10: {
    sector1: {
      table: "A-20",
      pdf: [750, 751, 752],
      printed: ["A-36", "A-37", "A-38"],
      entries: [
        ["00", "Unspecified"],
        ["01", "Air Mobile/Air Assault"],
        ["02", "Area"],
        ["03", "Attack"],
        ["04", "Biological"],
        ["05", "Border"],
        ["06", "Bridging"],
        ["07", "Chemical"],
        ["08", "Close Protection"],
        ["09", "Combat"],
        ["10", "Command and Control"],
        ["11", "Communications Contingency Package"],
        ["12", "Construction"],
        ["13", "Cross Cultural Communication"],
        ["14", "Crowd and Riot Control"],
        ["15", "Decontamination"],
        ["16", "Detention"],
        ["17", "Direct Communications"],
        ["18", "Diving"],
        ["19", "Division"],
        ["20", "Dog"],
        ["21", "Drilling"],
        ["22", "Electro–Optical"],
        ["23", "Enhanced"],
        ["24", "Explosive Ordnance Disposal (EOD)"],
        ["25", "Fire Direction Centre"],
        ["26", "Force"],
        ["27", "Forward"],
        ["28", "Ground Station Module"],
        ["29", "Landing Support"],
        ["30", "Large Extension Node"],
        ["31", "Maintenance"],
        ["32", "Meteorological"],
        ["33", "Mine Countermeasure"],
        ["34", "Missile"],
        ["35", "Mobile Advisor and Support"],
        ["36", "Mobile Subscriber Equipment"],
        ["37", "Mobility Support"],
        ["38", "Movement Control Centre"],
        ["39", "Multinational"],
        ["40", "Multinational Specialized Unit"],
        ["41", "Multiple Rocket Launcher"],
        ["42", "NATO Medical Role 1"],
        ["43", "NATO Medical Role 2"],
        ["44", "NATO Medical Role 3"],
        ["45", "NATO Medical Role 4"],
        ["46", "Naval"],
        ["47", "Node Centre"],
        ["48", "Nuclear"],
        ["49", "Operations"],
        ["50", "Radar"],
        ["51", "Radio Frequency Identification (RFID) Interrogator / Sensor"],
        ["52", "Radiological"],
        ["53", "Search and Rescue"],
        ["54", "Security"],
        ["55", "Sensor"],
        ["56", "Sensor Control Module (SCM)"],
        ["57", "Signals Intelligence"],
        ["58", "Single Shelter Switch"],
        ["59", "Single Rocket Launcher"],
        ["60", "Smoke"],
        ["61", "Sniper"],
        ["62", "Sound Ranging"],
        ["63", "Special Operations Forces (SOF)"],
        ["64", "Special Weapons and Tactics"],
        ["65", "Survey"],
        ["66", "Tactical Exploitation"],
        ["67", "Target Acquisition"],
        ["68", "Topographic"],
        ["69", "Utility"],
        ["70", "Video Imagery (Combat Camera)"],
        ["75", "Medevac"],
        ["76", "Ranger"],
        ["77", "Support"],
        ["78", "Aviation"],
        ["79", "Route, Reconnaissance, and Clearance"],
        ["80", "Command Post Node"],
        ["81", "Joint Network Node"],
        ["82", "Retransmission Site"],
        ["94", "Theatre"],
        ["95", "Army or Theatre Army"],
        ["96", "Corps"],
        ["97", "Brigade"],
        ["98", "Headquarters or headquarters staff element"]
      ],
      reserved: [
        ["71", "74"],
        ["83", "93"]
      ],
      vef: "99"
    },
    sector2: {
      table: "A-21",
      pdf: [753, 754],
      printed: ["A-39", "A-40"],
      entries: [
        ["00", "Unspecified"],
        ["01", "Airborne"],
        ["02", "Arctic"],
        ["03", "Battle Damage Repair"],
        ["04", "Bicycle Equipped"],
        ["05", "Casualty Staging"],
        ["06", "Clearing"],
        ["07", "Close Range"],
        ["08", "Control"],
        ["09", "Decontamination"],
        ["10", "Demolition"],
        ["11", "Dental"],
        ["12", "Digital"],
        ["13", "Enhanced Position Location Reporting System (EPLRS)"],
        ["14", "Equipment"],
        ["15", "Heavy"],
        ["16", "High Altitude"],
        ["17", "Intermodal"],
        ["18", "Intensive Care"],
        ["19", "Light"],
        ["20", "Laboratory"],
        ["21", "Launcher"],
        ["22", "Long Range"],
        ["23", "Low Altitude"],
        ["24", "Medium"],
        ["25", "Medium Altitude"],
        ["26", "Medium Range"],
        ["27", "Mountain"],
        ["28", "High to Medium Altitude"],
        ["29", "Multi–Channel"],
        ["30", "Optical (Flash)"],
        ["31", "Pack Animal"],
        ["32", "Patient Evacuation Coordination"],
        ["33", "Preventive Maintenance"],
        ["34", "Psychological"],
        ["35", "Radio Relay Line of Sight"],
        ["36", "Railroad"],
        ["37", "Recovery (Unmanned Systems)"],
        ["38", "Recovery (Maintenance)"],
        ["39", "Rescue Coordination Centre"],
        ["40", "Riverine"],
        ["41", "Single Channel"],
        ["42", "Ski"],
        ["43", "Short Range"],
        ["44", "Strategic"],
        ["45", "Support"],
        ["46", "Tactical"],
        ["47", "Towed"],
        ["48", "Troop"],
        ["49", "Vertical or Short Take–Off and Landing (VTOL/VSTOL)"],
        ["50", "Veterinary"],
        ["51", "Wheeled"],
        ["52", "High to Low Altitude"],
        ["53", "Medium to Low Altitude"],
        ["54", "Attack"],
        ["55", "Refuel"],
        ["56", "Utility"],
        ["57", "Combat Search and Rescue"]
      ],
      reserved: [["58", "98"]],
      vef: "99"
    }
  },
  15: {
    sector1: {
      table: "A-26",
      pdf: [766],
      printed: ["A-52"],
      entries: [
        ["00", "Unspecified"],
        ["01", "Biological"],
        ["02", "Chemical"],
        ["03", "Early Warning Radar"],
        ["04", "Intrusion"],
        ["05", "Nuclear"],
        ["06", "Radiological"],
        ["07", "Upgraded Early Warning Radar"],
        ["08", "Hijacking"],
        ["09", "Civilian"]
      ],
      reserved: [["10", "98"]],
      vef: "99"
    }
  },
  20: {
    sector1: {
      table: "A-28",
      pdf: [773],
      printed: ["A-59"],
      entries: [
        ["00", "Unspecified"],
        ["01", "Biological"],
        ["02", "Chemical"],
        ["03", "Nuclear"],
        ["04", "Radiological"],
        ["05", "Decontamination"],
        ["06", "Coal"],
        ["07", "Geothermal"],
        ["08", "Hydroelectric"],
        ["09", "Natural Gas"],
        ["10", "Petroleum"],
        ["11", "Civilian"],
        ["12", "Civilian Telephone"],
        ["13", "Civilian Television"],
        ["14", "Retransmission Site"],
        ["15", "Joint Network Node"],
        ["16", "Command Post Node"]
      ],
      reserved: [["17", "98"]],
      vef: "99"
    },
    sector2: {
      table: "A-29",
      pdf: [773],
      printed: ["A-59"],
      entries: [
        ["00", "Unspecified"],
        ["01", "Biological"],
        ["02", "Chemical"],
        ["03", "Nuclear"],
        ["04", "Radiological"],
        ["05", "Atomic Energy Reactor"],
        ["06", "Nuclear Material Production"],
        ["07", "Nuclear Material Storage"],
        ["08", "Weapons Grade"]
      ],
      reserved: [["09", "98"]],
      vef: "99"
    }
  },
  30: {
    sector1: {
      table: "A-35",
      pdf: [810],
      printed: ["A-96"],
      entries: [
        ["00", "Unspecified"],
        ["01", "Own Ship"],
        ["02", "Anti-air Warfare"],
        ["03", "Antisubmarine Warfare"],
        ["04", "Escort"],
        ["05", "Electronic Warfare"],
        ["06", "Intelligence, Surveillance, Reconnaissance"],
        ["07", "Mine Countermeasures"],
        ["08", "Missile Defence"],
        ["09", "Medical"],
        ["10", "Mine Warfare"],
        ["11", "Remote Multi–Mission Vehicle"],
        ["12", "Special Operations Forces (SOF)"],
        ["13", "Surface Warfare"],
        ["14", "Ballistic Missile"],
        ["15", "Guided Missile"],
        ["16", "Other Guided Missile"],
        ["17", "Torpedo"],
        ["18", "Drone–Equipped"],
        ["19", "Helicopter–Equipped/VSTOL"],
        ["20", "Ballistic Missile Defence, Shooter"],
        [
          "21",
          "Ballistic Missile Defence, Long-Range Surveillance and Track (LRS&T)"
        ],
        ["22", "Sea-Base X-Band"],
        ["23", "Hijacking"]
      ],
      reserved: [["24", "98"]],
      vef: "99"
    },
    sector2: {
      table: "A-36",
      pdf: [811],
      printed: ["A-97"],
      entries: [
        ["00", "Unspecified"],
        ["01", "Nuclear Powered"],
        ["02", "Heavy"],
        ["03", "Light"],
        ["04", "Medium"],
        ["05", "Dock"],
        ["06", "Logistics"],
        ["07", "Tank"],
        ["08", "Vehicle"],
        ["09", "Fast"],
        ["10", "Air–Cushioned (US)"],
        ["11", "Air–Cushioned (NATO)"],
        ["12", "Hydrofoil"],
        ["13", "Autonomous Control"],
        ["14", "Remotely Piloted"],
        ["15", "Expendable"]
      ],
      reserved: [["16", "98"]],
      vef: "99"
    }
  },
  35: {
    sector1: {
      table: "A-38",
      pdf: [814],
      printed: ["A-100"],
      entries: [
        ["00", "Unspecified"],
        ["01", "Antisubmarine Warfare"],
        ["02", "Auxiliary"],
        ["03", "Command and Control"],
        ["04", "Intelligence, Surveillance, Reconnaissance"],
        ["05", "Mine Countermeasures"],
        ["06", "Mine Warfare"],
        ["07", "Surface Warfare"],
        ["08", "Attack"],
        ["09", "Ballistic Missile"],
        ["10", "Guided Missile"],
        ["11", "Other Guided Missile"],
        ["12", "Special Operations Forces (SOF)"],
        ["13", "Possible Submarine Low 1"],
        ["14", "Possible Submarine Low 2"],
        ["15", "Possible Submarine High 3"],
        ["16", "Possible Submarine High 4"],
        ["17", "Probable Submarine"],
        ["18", "Certain Submarine"],
        ["19", "Anti-torpedo Torpedo"],
        ["20", "Hijacking/Hijacked"]
      ],
      reserved: [["21", "98"]],
      vef: "99"
    },
    sector2: {
      table: "A-39",
      pdf: [815],
      printed: ["A-101"],
      entries: [
        ["00", "Unspecified"],
        ["01", "Air Independent Propulsion"],
        ["02", "Diesel Electric, General"],
        ["03", "Diesel – Type 1"],
        ["04", "Diesel – Type 2"],
        ["05", "Diesel – Type 3"],
        ["06", "Nuclear Powered, General"],
        ["07", "Nuclear – Type 1"],
        ["08", "Nuclear – Type 2"],
        ["09", "Nuclear – Type 3"],
        ["10", "Nuclear – Type 4"],
        ["11", "Nuclear – Type 5"],
        ["12", "Nuclear – Type 6"],
        ["13", "Nuclear – Type 7"],
        ["14", "Autonomous Control"],
        ["15", "Remotely Piloted"],
        ["16", "Expendable"]
      ],
      reserved: [["17", "98"]],
      vef: "99"
    }
  },
  "01": {
    sector1: {
      table: "A-11",
      pdf: [735, 736],
      printed: ["A-21", "A-22"],
      entries: [
        ["00", "Not Applicable"],
        ["01", "Attack/Strike"],
        ["02", "Bomber"],
        ["03", "Cargo"],
        ["04", "Fighter"],
        ["05", "Interceptor"],
        ["06", "Tanker"],
        ["07", "Utility"],
        [
          "08",
          "Vertical or Short Take-off and Landing (VSTOL)/ Vertical Take-off and Landing (VTOL)"
        ],
        ["09", "Passenger"],
        ["10", "Ultra Light"],
        ["11", "Airborne Command Post (ACP)"],
        ["12", "Airborne Early Warning (AEW)"],
        ["13", "Government"],
        ["14", "Medical Evacuation (MEDEVAC)"],
        ["15", "Escort"],
        ["16", "Electronic Combat (EC)/Jammer"],
        ["17", "Patrol"],
        ["18", "Reconnaissance"],
        ["19", "Trainer"],
        ["20", "Photographic Reconnaissance"],
        ["21", "Personnel Recovery"],
        ["22", "Antisubmarine Warfare"],
        ["23", "Communications"],
        ["24", "Electronic Support Measures (ESM)"],
        ["25", "Mine Countermeasures (MCM)"],
        ["26", "Search and Rescue"],
        ["27", "Special Operations Forces"],
        ["28", "Surface Warfare"],
        ["29", "Very Important Person (VIP) Transport"],
        ["30", "Combat Search and Rescue (CSAR)"],
        ["31", "Suppression of Enemy Air Defences"],
        ["32", "Antisurface Warfare"],
        ["33", "Fighter/Bomber"],
        ["34", "Intensive Care"],
        ["35", "Electronic Attack (EA)"],
        ["36", "Multimission"],
        ["37", "Hijacking"],
        ["38", "ASW Helo- LAMPS"],
        ["39", "ASW Helo – SH-60R"]
      ],
      reserved: [["40", "98"]],
      vef: "99"
    },
    sector2: {
      table: "A-12",
      pdf: [736],
      printed: ["A-22"],
      entries: [
        ["00", "Not Applicable"],
        ["01", "Heavy"],
        ["02", "Medium"],
        ["03", "Light"],
        ["04", "Boom–Only"],
        ["05", "Drogue–Only"],
        ["06", "Boom and Drogue"],
        ["07", "Close Range"],
        ["08", "Short Range"],
        ["09", "Medium Range"],
        ["10", "Long Range"],
        ["11", "Downlinked"]
      ],
      reserved: [["12", "98"]],
      vef: "99"
    }
  },
  "02": {
    sector1: {
      table: "A-14",
      pdf: [737],
      printed: ["A-23"],
      entries: [
        ["00", "Unspecified"],
        ["01", "Air"],
        ["02", "Surface"],
        ["03", "Subsurface"],
        ["04", "Space"],
        ["05", "Anti–Ballistic"],
        ["06", "Ballistic"],
        ["07", "Cruise"],
        ["08", "Interceptor"]
      ],
      reserved: [["09", "98"]],
      vef: "99"
    },
    sector2: {
      table: "A-15",
      pdf: [738],
      printed: ["A-24"],
      entries: [
        ["00", "Unspecified"],
        ["01", "Air"],
        ["02", "Surface"],
        ["03", "Subsurface"],
        ["04", "Space"],
        ["05", "Launched"],
        ["07", "Patriot"],
        ["08", "Standard Missile-2 (SM-2)"],
        ["09", "Standard Missile-6 (SM-6)"],
        ["10", "Evolved Sea Sparrow Missile (ESSM)"],
        ["11", "Rolling Airframe Missile (RAM)"],
        ["12", "Short Range"],
        ["13", "Medium Range"],
        ["14", "Intermediate Range"],
        ["15", "Long Range"],
        ["16", "Intercontinental"]
      ],
      reserved: [
        ["06", "06"],
        ["17", "98"]
      ],
      vef: "99"
    }
  },
  "05": {
    sector1: {
      table: "A-17",
      pdf: [740],
      printed: ["A-26"],
      entries: [
        ["00", "Unspecified"],
        ["01", "Low Earth Orbit (LEO)"],
        ["02", "Medium Earth Orbit (MEO)"],
        ["03", "High Earth Orbit (HEO)"],
        ["04", "Geosynchronous Orbit (GSO)"],
        ["05", "Geostationary Orbit (GO)"],
        ["06", "Molniya Orbit (MO)"]
      ],
      reserved: [["07", "98"]],
      vef: "99"
    },
    sector2: {
      table: "A-18",
      pdf: [741],
      printed: ["A-27"],
      entries: [
        ["00", "Unspecified"],
        ["01", "Optical"],
        ["02", "Infrared"],
        ["03", "Radar"],
        ["04", "Signals Intelligence (SIGINT)"]
      ],
      reserved: [["05", "98"]],
      vef: "99"
    }
  }
};

// Placement of sector 1 / sector 2 relative to the main icon. Air Missile (02) is
// horizontal (PDF 76-79); every other set is vertical (sector 1 above, sector 2 below).
export const app6dSectorPlacement = {
  "02": { sector1: "left", sector2: "right" }
};
export function sectorPlacement(set, sector) {
  const placement = app6dSectorPlacement[set];
  if (placement) return placement["sector" + sector];
  return sector === 1 ? "top" : "bottom";
}

export function sectorDictionary(set, sector) {
  const dictionary = app6dSectorDictionaries[set];
  return (dictionary && dictionary["sector" + sector]) || null;
}

// "none" (00), "defined", "vef" (99), "reserved" or "undefined" (no dictionary, or
// a code the table neither defines nor reserves).
export function classifySectorCode(set, sector, code) {
  const dictionary = sectorDictionary(set, sector);
  if (!dictionary || !/^[0-9]{2}$/.test(code)) return "undefined";
  if (code === "00") return "none";
  if (code === dictionary.vef) return "vef";
  if (dictionary.entries.some((entry) => entry[0] === code)) return "defined";
  if (dictionary.reserved.some((range) => code >= range[0] && code <= range[1]))
    return "reserved";
  return "undefined";
}
