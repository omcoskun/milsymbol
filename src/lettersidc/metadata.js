//import { ms } from "../ms.js";
import {
  app6aIdentity,
  app6aProfile,
  app6aSymbolClass,
  app6aTextFields,
  decodeApp6aSizeMobility,
  getApp6aFields,
  validateApp6aOptions
} from "../modifierprofiles/app6a.js";
import { applyProfile } from "../modifierprofiles/common.js";

// APP-6A field rules live in the edition profile; re-exported for callers.
export { app6aSymbolClass, app6aTextFields, getApp6aFields, validateApp6aOptions };

export function metadata(ms, metadata, mapping) {
  this.options.sidc = this.options.sidc.toUpperCase();

  const codingscheme =
    this.options.sidc.charAt(0) != "" ? this.options.sidc.charAt(0) : "-";
  const affiliation =
    this.options.sidc.charAt(1) != "" ? this.options.sidc.charAt(1) : "-";
  const battledimension =
    this.options.sidc.charAt(2) != "" ? this.options.sidc.charAt(2) : "-";
  const status =
    this.options.sidc.charAt(3) != "" ? this.options.sidc.charAt(3) : "-";
  const functionid = (metadata.functionid =
    this.options.sidc.substr(4, 6) != ""
      ? this.options.sidc.substr(4, 6)
      : "------");
  const symbolmodifier11 =
    this.options.sidc.charAt(10) != "" ? this.options.sidc.charAt(10) : "-";
  const symbolmodifier12 =
    this.options.sidc.charAt(11) != "" ? this.options.sidc.charAt(11) : "-";
  /*
  const countrycode = this.options.sidc.substr(12, 2) != ""
    ? this.options.sidc.substr(12, 2)
    : "--";
  const orderofbattle = this.options.sidc.charAt(14) != "" ? this.options.sidc.charAt(14) : "-";
  */
  if (["H", "S", "J", "K"].indexOf(affiliation) > -1)
    metadata.affiliation = mapping.affiliation[0];
  if (["F", "A", "D", "M"].indexOf(affiliation) > -1)
    metadata.affiliation = mapping.affiliation[1];
  if (["N", "L"].indexOf(affiliation) > -1)
    metadata.affiliation = mapping.affiliation[2];
  if (["P", "U", "G", "W", "O"].indexOf(affiliation) > -1)
    metadata.affiliation = mapping.affiliation[3];

  if (["P", "A"].indexOf(battledimension) > -1)
    metadata.dimension = mapping.dimension[0];
  if (["G", "Z", "F", "X"].indexOf(battledimension) > -1)
    metadata.dimension = mapping.dimension[1];
  if (["S"].indexOf(battledimension) > -1)
    metadata.dimension = mapping.dimension[2];
  if (["U"].indexOf(battledimension) > -1)
    metadata.dimension = mapping.dimension[3];

  //dimension is in Space
  if (battledimension == "P" && codingscheme != "O" && !metadata.app6a) metadata.space = true;
  //codingscheme that are Activities
  if (codingscheme == "O" && ["V", "O", "R"].indexOf(battledimension) > -1) {
    metadata.activity = true;
  }
  //SymbolSets that are control-measure
  if (codingscheme == "G") metadata.controlMeasure = true;
  //symbolmodifier11 that are Installations
  if (symbolmodifier11 == "H") metadata.installation = true;
  //Planned/Anticipated/Suspect symbols should have a dashed outline
  if (this.style.frame && status == "A")
    metadata.notpresent = ms._dashArrays.anticipated;
  if (!metadata.app6a && this.style.frame && ["P", "A", "S", "G", "M"].indexOf(affiliation) > -1) {
    metadata.notpresent = ms._dashArrays.pending;
  }
  //Should it have a Condition Bar
  if (status == "C") metadata.condition = mapping.status[2];
  if (status == "D") metadata.condition = mapping.status[3];
  if (status == "X") metadata.condition = mapping.status[4];
  if (status == "F") metadata.condition = mapping.status[5];
  //Is it part of Exercise Symbols
  if (["G", "W", "D", "L", "M", "J", "K"].indexOf(affiliation) > -1) {
    metadata.context = mapping.context[1];
  }
  //Framing of SO tactical symbols differs slightly from C2 Symbology: UEI tactical symbols in that there is only one battle dimension: ground.
  if (codingscheme == "O") metadata.dimension = mapping.dimension[1];
  //Framing of EMS tactical symbols differs slightly from C2 Symbology: UEI tactical symbols in that there is only one battle dimension: ground.
  if (codingscheme == "E") metadata.dimension = mapping.dimension[1];
  //First save the dimensionType and affiliationType before we modifies it...
  metadata.baseDimension = metadata.dimension;
  metadata.baseAffilation = metadata.affiliation;
  //Joker and faker should have the shape of friendly
  if (affiliation == "J") metadata.joker = true;
  if (affiliation == "K") metadata.faker = true;
  if (metadata.joker || metadata.faker) {
    metadata.affiliation = mapping.affiliation[1];
  }
  //Ground Equipment should have the same geometry as sea Friend...
  if (
    codingscheme == "S" &&
    battledimension == "G" &&
    functionid.charAt(0) == "E"
  )
    metadata.dimension = mapping.dimension[2];
  //Signal INTELLIGENCE Ground should have the same geometry as sea Friend...
  if (codingscheme == "I" && battledimension == "G")
    metadata.dimension = mapping.dimension[2];
  //Some EMS symbosls should have the same geometry as sea Friend...
  if (
    codingscheme == "E" &&
    ((battledimension == "O" &&
      [
        "AB----",
        "AE----",
        "AF----",
        "BB----",
        "CB----",
        "CC----",
        "DB----",
        "DDB---",
        "DEB---",
        "DFB---",
        "DGB---",
        "DHB---",
        "DIB---",
        "DJB---",
        "DLB---",
        "DMB---",
        "DOB---",
        "EA----",
        "EB----",
        "EC----",
        "ED----",
        "EE----",
      ].indexOf(functionid) > -1) ||
      (battledimension == "F" &&
        ["BA----", "MA----", "MC----"].indexOf(functionid) > -1))
  ) {
    metadata.dimension = mapping.dimension[2];
  }
  //Setting up Headquarters/task force/dummy
  if (
    ["F", "G", "C", "D"].indexOf(symbolmodifier11) > -1 ||
    (symbolmodifier11 == "H" && symbolmodifier12 == "B")
  ) {
    metadata.feintDummy = true;
  }
  if (["A", "B", "C", "D"].indexOf(symbolmodifier11) > -1) {
    metadata.headquarters = true;
  }
  if (battledimension == "G" && functionid == "UH----") {
    metadata.headquarters = true;
  }
  if (["E", "B", "G", "D"].indexOf(symbolmodifier11) > -1) {
    metadata.taskForce = true;
  }
  //Setting up Echelon/Mobility/Towed Array Amplifier
  if (symbolmodifier12 == "A") metadata.echelon = mapping.echelonMobility[11]; //Team/Crew
  if (symbolmodifier12 == "B" && symbolmodifier11 != "H") {
    metadata.echelon = mapping.echelonMobility[12]; //Squad
  }
  if (symbolmodifier12 == "C") metadata.echelon = mapping.echelonMobility[13]; //Section
  if (symbolmodifier12 == "D") metadata.echelon = mapping.echelonMobility[14]; //Platoon/detachment
  if (symbolmodifier12 == "E") metadata.echelon = mapping.echelonMobility[15]; //Company/battery/troop
  if (symbolmodifier12 == "F") metadata.echelon = mapping.echelonMobility[16]; //Battalion/squadron
  if (symbolmodifier12 == "G") metadata.echelon = mapping.echelonMobility[17]; //Regiment/group
  if (symbolmodifier12 == "H") metadata.echelon = mapping.echelonMobility[18]; //Brigade
  if (symbolmodifier12 == "I") metadata.echelon = mapping.echelonMobility[21]; //Division
  if (symbolmodifier12 == "J") metadata.echelon = mapping.echelonMobility[22]; //Corps/MEF
  if (symbolmodifier12 == "K") metadata.echelon = mapping.echelonMobility[23]; //Army
  if (symbolmodifier12 == "L" && symbolmodifier11 != "N") {
    metadata.echelon = mapping.echelonMobility[24]; //Army Group/front
  }
  if (symbolmodifier12 == "M") metadata.echelon = mapping.echelonMobility[25]; //Region/Theater
  if (symbolmodifier12 == "N") metadata.echelon = mapping.echelonMobility[26]; //Command
  if (symbolmodifier11 == "M") {
    switch (symbolmodifier12) {
      case "O":
        metadata.mobility = mapping.echelonMobility[31]; //Wheeled limited cross country
        break;
      case "P":
        metadata.mobility = mapping.echelonMobility[32]; //Wheeled cross country
        break;
      case "Q":
        metadata.mobility = mapping.echelonMobility[33]; //Tracked
        break;
      case "R":
        metadata.mobility = mapping.echelonMobility[34]; //Wheeled and tracked combination
        break;
      case "S":
        metadata.mobility = mapping.echelonMobility[35]; //Towed
        break;
      case "T":
        metadata.mobility = mapping.echelonMobility[36]; //Rail
        break;
      case "U":
        metadata.mobility = mapping.echelonMobility[41]; //Over snow (prime mover)
        break;
      case "V":
        metadata.mobility = mapping.echelonMobility[42]; //Sled
        break;
      case "W":
        metadata.mobility = mapping.echelonMobility[37]; //Pack animals
        break;
      case "X":
        metadata.mobility = mapping.echelonMobility[51]; //Barge
        break;
      case "Y":
        metadata.mobility = mapping.echelonMobility[52]; //Amphibious
        break;
      default:
        metadata.mobility = undefined;
    }
  }
  if (symbolmodifier11 == "N") {
    switch (symbolmodifier12) {
      case "S":
        metadata.mobility = mapping.echelonMobility[61]; //Short towed array
        break;
      case "L":
        metadata.mobility = mapping.echelonMobility[62]; //Long towed Array
        break;
      default:
        metadata.mobility = undefined;
    }
  }
  //This is for 2525
  //Civilian stuff
  if (
    (battledimension == "A" && functionid.charAt(0) == "C") ||
    (battledimension == "G" && functionid.substring(0, 3) == "EVC") ||
    (battledimension == "S" && functionid.charAt(0) == "X")
  ) {
    metadata.civilian = true;
  }
  //Colors will be have to be fixed in symbolColors
  if (battledimension == "Z" || battledimension == "X") {
    if (["P", "U", "F", "N", "H", "A", "S", "G", "W"].indexOf(affiliation) > -1)
      metadata.dimensionUnknown = true;
    //To get the correct geometry for a lot of stuff later we will have to modify the affliationType.
    if (["F", "A"].indexOf(affiliation) > -1) metadata.dimension = "Sea";
    //If battle dimension is unknown and the affiliation is D,L,M,J,K we should not have a symbol
    if (["D", "L", "M", "J", "K"].indexOf(affiliation) > -1)
      metadata.affiliation = "none";
  }
  //Forcing unframing of symbols that shouldn't have a frame.
  if (
    battledimension == "S" &&
    [
      "O-----",
      "ED----",
      "EP----",
      "EV----",
      "ZM----",
      "ZN----",
      "ZI----",
    ].indexOf(functionid) > -1
  ) {
    metadata.frame = false;
  }
  if (
    codingscheme == "E" &&
    battledimension == "N" &&
    [
      "AA----",
      "AB----",
      "AC----",
      "AD----",
      "AE----",
      "AG----",
      "BB----",
      "BC----",
      "BF----",
      "BM----",
      "-C-----",
      "CA----",
      "CB----",
      "CC----",
      "CD----",
      "CE----",
    ].indexOf(functionid) > -1
  ) {
    metadata.frame = false;
  }
  if (
    codingscheme == "W" &&
    battledimension == "S" &&
    [
      "WSVE--",
      "WSD-LI",
      "WSFGSO",
      "WSGRL-",
      "WSR-LI",
      "WSDSLM",
      "WSS-LI",
      "WSTMH-",
      "WST-FC",
      "WSTSS-",
    ].indexOf(functionid) > -1
  ) {
    metadata.frame = false;
  }
  //We have some special symbols that should be unframed but filled, like mines, let us fix them.
  if (
    battledimension == "U" &&
    [
      "WM----",
      "WMD---",
      "WMG---",
      "WMGD--",
      "WMGX--",
      "WMGE--",
      "WMGC--",
      "WMGR--",
      "WMGO--",
      "WMM---",
      "WMMD--",
      "WMMX--",
      "WMME--",
      "WMMC--",
      "WMMR--",
      "WMMO--",
      "WMF---",
      "WMFD--",
      "WMFX--",
      "WMFE--",
      "WMFC--",
      "WMFR--",
      "WMFO--",
      "WMO---",
      "WMOD--",
      "WMX---",
      "WME---",
      "WMA---",
      "WMC---",
      "WMR---",
      "WMB---",
      "WMBD--",
      "WMN---",
      "WMS---",
      "WMSX--",
      "WMSD--",
      "WD----",
      "WDM---",
      "WDMG--",
      "WDMM--",
      "ND----",
      "E-----",
      "V-----",
      "X-----",
      "NBS---",
      "NBR---",
      "NBW---",
      "NM----",
      "NA----",
    ].indexOf(functionid) > -1
  ) {
    if (metadata.STD2525) {
      metadata.fill = false;
      if (functionid == "WD----") {
        metadata.fill = true;
      }
      if (
        ["ND----", "NBS---", "NBR---", "NBW---", "NM----", "NA----"].indexOf(
          functionid
        ) > -1
      ) {
        metadata.fill = true;
        metadata.frame = false;
      }
    } else {
      metadata.frame = false;
      if (["E-----", "V-----", "X-----"].indexOf(functionid) > -1) {
        metadata.fill = false;
        metadata.frame = false;
      }
    }
  }

  //Some symbols in EMS and symbols from tactical graphics
  if (
    this.options.sidc.substr(0, 3) == "WAS" ||
    this.options.sidc.substr(0, 3) == "WOS" ||
    codingscheme == "G"
  ) {
    metadata.frame = false;
  }

  //This is for APP6 tactical points with frames
  if (
    codingscheme == "G" &&
    battledimension == "O" &&
    ["V", "L", "P", "I"].indexOf(functionid.charAt(0)) > -1
  ) {
    metadata.frame = true;
    metadata.dimension = mapping.dimension[1];
  }

  if (metadata.app6a) {
    const standard = isApp6aSidc(this.options.sidc);
    applyProfile(app6aProfile, this.options.sidc, this.options, metadata);
    metadata.validation.details.standard = standard;
    metadata.validation.valid = standard && metadata.validation.valid;
    if (codingscheme == "S")
      applyApp6aWarfighting.call(this, metadata, mapping, {
        affiliation,
        battledimension,
        status,
        functionid
      });
  }

  return metadata;
}

// APP-6A S symbols: identity, status and Table B-II graphics come from the
// profile and replace what the generic letter logic above guessed.
function applyApp6aWarfighting(metadata, mapping, parts) {
  const framed = !!(this.style.frame && metadata.frame);
  const identity = app6aIdentity(
    parts.affiliation,
    parts.battledimension,
    this.options.uncertaintyMarker,
    framed
  );
  const sizeMobility = decodeApp6aSizeMobility(this.options.sidc);
  // Table II: present and planned only; no condition bars from other editions.
  metadata.condition = "";
  // The exercise context belongs to later editions; J and K are field E marks.
  metadata.context = mapping.context[0];
  metadata.dimensionUnknown = false;
  metadata.joker = parts.affiliation == "J";
  metadata.faker = parts.affiliation == "K";
  metadata.affiliationMarker = null;
  if (identity.defined) {
    const geometry = { Hostile: 0, Friend: 1, Neutral: 2, Unknown: 3 };
    metadata.affiliation = mapping.affiliation[geometry[identity.frame]];
    metadata.baseAffilation = metadata.affiliation;
    if (identity.marker)
      metadata.affiliationMarker = {
        text: identity.marker,
        placement: identity.placement
      };
  } else {
    // No frame is defined for this identity: draw none, never Unknown/Friend.
    metadata.affiliation = "none";
    metadata.baseAffilation = "none";
  }
  if (metadata.affiliationMarker && metadata.affiliationMarker.placement == "field")
    metadata.derivedFields = { affiliationMarker: metadata.affiliationMarker.text };
  metadata.headquarters =
    sizeMobility.headquarters ||
    (parts.battledimension == "G" && parts.functionid == "UH----");
  metadata.locationOffset = sizeMobility.staffRole == "locationOffset";
  metadata.taskForce = sizeMobility.taskForce;
  metadata.feintDummy = sizeMobility.feintDummy;
  metadata.installation = sizeMobility.installation;
  metadata.echelon = sizeMobility.echelonKey
    ? mapping.echelonMobility[sizeMobility.echelonKey]
    : "";
  metadata.mobility = sizeMobility.valid
    ? sizeMobility.mobilityKey
      ? mapping.echelonMobility[sizeMobility.mobilityKey]
      : ""
    : undefined;
  if (parts.status == "A" && !framed)
    metadata.validation.details.notes.push(
      "Table II: planned status cannot be shown for an unframed or dot symbol; the SIDC status is kept"
    );
}

// APP-6A edition vocabulary and modifier rules live with letter SIDC metadata.
// APP-6A Annex B point-symbol keys; checked against the independent studio catalog.
export const app6aCodes = new Set(`
S-P------- S-P-S----- S-P-V----- S-P-T----- S-A------- S-A-M----- S-A-MF----
S-A-MFB--- S-A-MFF--- S-A-MFFI-- S-A-MFT--- S-A-MFA--- S-A-MFL--- S-A-MFK---
S-A-MFC--- S-A-MFCL-- S-A-MFCM-- S-A-MFCH-- S-A-MFJ--- S-A-MFO--- S-A-MFR---
S-A-MFRW-- S-A-MFRZ-- S-A-MFRX-- S-A-MFP--- S-A-MFPN-- S-A-MFPM-- S-A-MFU---
S-A-MFUL-- S-A-MFUM-- S-A-MFUH-- S-A-MFY--- S-A-MFH--- S-A-MFD--- S-A-MFQ---
S-A-MFS--- S-A-MFM--- S-A-MH---- S-A-MHA--- S-A-MHS--- S-A-MHU--- S-A-MHUL--
S-A-MHUM-- S-A-MHUH-- S-A-MHI--- S-A-MHH--- S-A-MHR--- S-A-MHQ--- S-A-MHC---
S-A-MHCL-- S-A-MHCM-- S-A-MHCH-- S-A-MHT--- S-A-MHO--- S-A-MHM--- S-A-MHD---
S-A-MHK--- S-A-MHJ--- S-A-ML---- S-A-W----- S-A-WM---- S-A-WMS--- S-A-WMSS--
S-A-WMSA-- S-A-WMA--- S-A-WMAS-- S-A-WMAA-- S-A-WMU--- S-A-WML--- S-A-WD----
S-A-C----- S-A-CF---- S-A-CH---- S-A-CL---- S-G------- S-G-U----- S-G-UC----
S-G-UCD--- S-G-UCDS-- S-G-UCDSC- S-G-UCDSS- S-G-UCDSV- S-G-UCDM-- S-G-UCDML-
S-G-UCDMLA S-G-UCDMM- S-G-UCDMH- S-G-UCDH-- S-G-UCDHH- S-G-UCDHP- S-G-UCDG--
S-G-UCDC-- S-G-UCDT-- S-G-UCDO-- S-G-UCA--- S-G-UCAT-- S-G-UCATA- S-G-UCATW-
S-G-UCATWR S-G-UCATL- S-G-UCATM- S-G-UCATH- S-G-UCATR- S-G-UCAW-- S-G-UCAWS-
S-G-UCAWA- S-G-UCAWW- S-G-UCAWWR S-G-UCAWL- S-G-UCAWM- S-G-UCAWH- S-G-UCAWR-
S-G-UCAA-- S-G-UCAAD- S-G-UCAAL- S-G-UCAAM- S-G-UCAAS- S-G-UCAAU- S-G-UCAAC-
S-G-UCAAA- S-G-UCAAAT S-G-UCAAAW S-G-UCAAAS S-G-UCAAO- S-G-UCAAOS S-G-UCV---
S-G-UCVF-- S-G-UCVFU- S-G-UCVFA- S-G-UCVFR- S-G-UCVR-- S-G-UCVRA- S-G-UCVRS-
S-G-UCVRW- S-G-UCVRU- S-G-UCVRUL S-G-UCVRUM S-G-UCVRUH S-G-UCVRUC S-G-UCVRUE
S-G-UCVRM- S-G-UCVS-- S-G-UCVC-- S-G-UCVV-- S-G-UCVU-- S-G-UCVUF- S-G-UCVUR-
S-G-UCI--- S-G-UCIL-- S-G-UCIM-- S-G-UCIO-- S-G-UCIA-- S-G-UCIS-- S-G-UCIZ--
S-G-UCIN-- S-G-UCII-- S-G-UCIC-- S-G-UCE--- S-G-UCEC-- S-G-UCECS- S-G-UCECA-
S-G-UCECC- S-G-UCECL- S-G-UCECM- S-G-UCECH- S-G-UCECT- S-G-UCECW- S-G-UCECO-
S-G-UCECR- S-G-UCEN-- S-G-UCENN- S-G-UCF--- S-G-UCFH-- S-G-UCFHE- S-G-UCFHS-
S-G-UCFHA- S-G-UCFHC- S-G-UCFHO- S-G-UCFHL- S-G-UCFHM- S-G-UCFHH- S-G-UCFHX-
S-G-UCFR-- S-G-UCFRS- S-G-UCFRSS S-G-UCFRSR S-G-UCFRST S-G-UCFRM- S-G-UCFRMS
S-G-UCFRMR S-G-UCFRMT S-G-UCFT-- S-G-UCFTR- S-G-UCFTS- S-G-UCFTF- S-G-UCFTC-
S-G-UCFTCD S-G-UCFTCM S-G-UCFTA- S-G-UCFM-- S-G-UCFMS- S-G-UCFMSW S-G-UCFMT-
S-G-UCFMTA S-G-UCFMTS S-G-UCFMTC S-G-UCFMTO S-G-UCFML- S-G-UCFS-- S-G-UCFSS-
S-G-UCFSA- S-G-UCFSL- S-G-UCFSO- S-G-UCFO-- S-G-UCFOS- S-G-UCFOA- S-G-UCFOL-
S-G-UCFOO- S-G-UCR--- S-G-UCRH-- S-G-UCRV-- S-G-UCRVA- S-G-UCRVM- S-G-UCRVG-
S-G-UCRVO- S-G-UCRC-- S-G-UCRS-- S-G-UCRA-- S-G-UCRO-- S-G-UCRL-- S-G-UCRR--
S-G-UCRRD- S-G-UCRRF- S-G-UCRRL- S-G-UCRX-- S-G-UCM--- S-G-UCMT-- S-G-UCMS--
S-G-UCS--- S-G-UCSW-- S-G-UCSG-- S-G-UCSGD- S-G-UCSGM- S-G-UCSGA- S-G-UCSM--
S-G-UCSR-- S-G-UCSA-- S-G-UU---- S-G-UUA--- S-G-UUAC-- S-G-UUACC- S-G-UUACCK
S-G-UUACCM S-G-UUACS- S-G-UUACSM S-G-UUACSA S-G-UUACR- S-G-UUACRW S-G-UUACRS
S-G-UUAN-- S-G-UUAB-- S-G-UUABR- S-G-UUAD-- S-G-UUM--- S-G-UUMA-- S-G-UUMS--
S-G-UUMSE- S-G-UUMSEA S-G-UUMSED S-G-UUMSEI S-G-UUMSEJ S-G-UUMSET S-G-UUMSEC
S-G-UUMC-- S-G-UUMR-- S-G-UUMRG- S-G-UUMRS- S-G-UUMRSS S-G-UUMRX- S-G-UUMMO-
S-G-UUMO-- S-G-UUMT-- S-G-UUMQ-- S-G-UUMJ-- S-G-UUL--- S-G-UULS-- S-G-UULM--
S-G-UULC-- S-G-UULF-- S-G-UULD-- S-G-UUS--- S-G-UUSA-- S-G-UUSC-- S-G-UUSCL-
S-G-UUSO-- S-G-UUSF-- S-G-UUSM-- S-G-UUSMS- S-G-UUSML- S-G-UUSMN- S-G-UUSR--
S-G-UUSRS- S-G-UUSRT- S-G-UUSRW- S-G-UUSS-- S-G-UUSW-- S-G-UUSX-- S-G-UUI---
S-G-UUX--- S-G-UUE--- S-G-US---- S-G-USA--- S-G-USAT-- S-G-USAC-- S-G-USAJ--
S-G-USAJT- S-G-USAJC- S-G-USAO-- S-G-USAOT- S-G-USAOC- S-G-USAF-- S-G-USAFT-
S-G-USAFC- S-G-USAS-- S-G-USAST- S-G-USASC- S-G-USAM-- S-G-USAMT- S-G-USAMC-
S-G-USAR-- S-G-USART- S-G-USARC- S-G-USAP-- S-G-USAPT- S-G-USAPC- S-G-USAPB-
S-G-USAPBT S-G-USAPBC S-G-USAPM- S-G-USAPMT S-G-USAPMC S-G-USAX-- S-G-USAXT-
S-G-USAXC- S-G-USAL-- S-G-USALT- S-G-USALC- S-G-USAW-- S-G-USAWT- S-G-USAWC-
S-G-USAQ-- S-G-USAQT- S-G-USAQC- S-G-USM--- S-G-USMT-- S-G-USMC-- S-G-USMM--
S-G-USMMT- S-G-USMMC- S-G-USMV-- S-G-USMVT- S-G-USMVC- S-G-USMD-- S-G-USMDT-
S-G-USMDC- S-G-USMP-- S-G-USMPT- S-G-USMPC- S-G-USS--- S-G-USST-- S-G-USSC--
S-G-USS1-- S-G-USS1T- S-G-USS1C- S-G-USS2-- S-G-USS2T- S-G-USS2C- S-G-USS3--
S-G-USS3T- S-G-USS3C- S-G-USS3A- S-G-USS3AT S-G-USS3AC S-G-USS4-- S-G-USS4T-
S-G-USS4C- S-G-USS5-- S-G-USS5T- S-G-USS5C- S-G-USS6-- S-G-USS6T- S-G-USS6C-
S-G-USS7-- S-G-USS7T- S-G-USS7C- S-G-USS8-- S-G-USS8T- S-G-USS8C- S-G-USS9--
S-G-USS9T- S-G-USS9C-
S-G-USSX-- S-G-USSXT- S-G-USSXC- S-G-USSL-- S-G-USSLT- S-G-USSLC- S-G-USSW--
S-G-USSWT- S-G-USSWC- S-G-USSWP- S-G-USSWPT S-G-USSWPC S-G-UST--- S-G-USTT--
S-G-USTC-- S-G-USTM-- S-G-USTMT- S-G-USTMC- S-G-USTR-- S-G-USTRT- S-G-USTRC-
S-G-USTS-- S-G-USTST- S-G-USTSC- S-G-USTA-- S-G-USTAT- S-G-USTAC- S-G-USTI--
S-G-USTIT- S-G-USTIC- S-G-USX--- S-G-USXT-- S-G-USXC-- S-G-USXH-- S-G-USXHT-
S-G-USXHC- S-G-USXR-- S-G-USXRT- S-G-USXRC- S-G-USXO-- S-G-USXOT- S-G-USXOC-
S-G-USXOM- S-G-USXOMT S-G-USXOMC S-G-USXE-- S-G-USXET- S-G-USXEC- S-G-UH----
S-G-E----- S-G-EW---- S-G-EWM--- S-G-EWMA-- S-G-EWMAT- S-G-EWMAL- S-G-EWMAI-
S-G-EWMAS- S-G-EWMS-- S-G-EWMSL- S-G-EWMSI- S-G-EWMSS- S-G-EWMT-- S-G-EWMTL-
S-G-EWMTM- S-G-EWMTH- S-G-EWS--- S-G-EWSL-- S-G-EWSM-- S-G-EWSH-- S-G-EWX---
S-G-EWXL-- S-G-EWXM-- S-G-EWXH-- S-G-EWT--- S-G-EWTL-- S-G-EWTM-- S-G-EWTH--
S-G-EWR--- S-G-EWRR-- S-G-EWRL-- S-G-EWRH-- S-G-EWZ--- S-G-EWZL-- S-G-EWZM--
S-G-EWZH-- S-G-EWO--- S-G-EWOL-- S-G-EWOM-- S-G-EWOH-- S-G-EWH--- S-G-EWHL--
S-G-EWHLS- S-G-EWHM-- S-G-EWHMS- S-G-EWHH-- S-G-EWHHS- S-G-EWG--- S-G-EWGR--
S-G-EWGL-- S-G-EWGM-- S-G-EWGH-- S-G-EWD--- S-G-EWDL-- S-G-EWDLS- S-G-EWDM--
S-G-EWDMS- S-G-EWDH-- S-G-EWDHS- S-G-EWA--- S-G-EWAL-- S-G-EWAM-- S-G-EWAH--
S-G-EV---- S-G-EVA--- S-G-EVAT-- S-G-EVATL- S-G-EVATW- S-G-EVATM- S-G-EVATX-
S-G-EVATH- S-G-EVATY- S-G-EVAA-- S-G-EVAAR- S-G-EVAI-- S-G-EVAC-- S-G-EVAS--
S-G-EVAL-- S-G-EVU--- S-G-EVUB-- S-G-EVUS-- S-G-EVUL-- S-G-EVUX-- S-G-EVUR--
S-G-EVE--- S-G-EVEB-- S-G-EVEE-- S-G-EVEC-- S-G-EVEM-- S-G-EVEMA- S-G-EVEMT-
S-G-EVEMV- S-G-EVEML- S-G-EVED-- S-G-EVST-- S-G-EVC--- S-G-ES---- S-G-ESR---
S-G-ESE--- S-G-EX---- S-G-EXL--- S-G-EXN--- S-G-EXF--- S-G-EXM--- S-G-EXMC--
S-G-EXML-- S-G-I----- S-G-IR---- S-G-IRM--- S-G-IRP--- S-G-IRN--- S-G-IRNB--
S-G-IRNC-- S-G-IRNN-- S-G-IP---- S-G-IPD--- S-G-IE---- S-G-IU---- S-G-IUR---
S-G-IUT--- S-G-IUE--- S-G-IUP--- S-G-IM---- S-G-IMF--- S-G-IMA--- S-G-IME---
S-G-IMG--- S-G-IMV--- S-G-IMN--- S-G-IMNB-- S-G-IMC--- S-G-IMS--- S-G-IMM---
S-G-IG---- S-G-IB---- S-G-IBA--- S-G-IBN--- S-G-IT---- S-G-IX---- S-G-IXH---
S-S------- S-S-C----- S-S-CL---- S-S-CLCV-- S-S-CLBB-- S-S-CLCC-- S-S-CLDD--
S-S-CLFF-- S-S-CA---- S-S-CALA-- S-S-CALS-- S-S-CALC-- S-S-CM---- S-S-CMML--
S-S-CMMS-- S-S-CMMH-- S-S-CMMA-- S-S-CMMD-- S-S-CP---- S-S-CPSB-- S-S-CPSU--
S-S-CH---- S-S-S----- S-S-SP---- S-S-SA---- S-S-G----- S-S-GT---- S-S-GG----
S-S-GU---- S-S-GC---- S-S-N----- S-S-NR---- S-S-NF---- S-S-NI---- S-S-NS----
S-S-NM---- S-S-NH---- S-S-NN---- S-S-NNR--- S-S-X----- S-S-XM---- S-S-XMC---
S-S-XMR--- S-S-XMO--- S-S-XMTU-- S-S-XMF--- S-S-XMP--- S-S-XMH--- S-S-XMTO--
S-S-XF---- S-S-XFDF-- S-S-XFDR-- S-S-XFTR-- S-S-XR---- S-S-XL---- S-S-XH----
S-S-O----- S-S-E----- S-S-ED---- S-S-EP---- S-S-EV---- S-S-Z----- S-S-ZM----
S-S-ZN---- S-S-ZI---- S-U------- S-U-S----- S-U-SN---- S-U-SC---- S-U-SO----
S-U-SS---- S-U-SSA--- S-U-W----- S-U-WT---- S-U-WM---- S-U-WMD--- S-U-WMG---
S-U-WMGD-- S-U-WMM--- S-U-WMMD-- S-U-WMF--- S-U-WMFD-- S-U-WMO--- S-U-WMOD--
S-U-WD---- S-U-WDM--- S-U-N----- S-U-ND---- S-U-NB---- S-U-NBS--- S-U-NBR---
S-U-NBW--- S-U-NM---- S-U-NA---- S-F------- S-F-A----- S-F-AF---- S-F-AFA---
S-F-AFK--- S-F-AFU--- S-F-AFUL-- S-F-AFUM-- S-F-AFUH-- S-F-AV---- S-F-AH----
S-F-AHH--- S-F-AHA--- S-F-AHU--- S-F-AHUL-- S-F-AHUM-- S-F-AHUH-- S-F-SN----
S-F-SNS--- S-F-SNU--- S-F-SNB--- S-F-SNN--- S-F-G----- S-F-GS---- S-F-GSR---
S-F-GSP--- S-F-GSPA-- S-F-GCA--- S-F-GB---- G-T-GD---- G-T-GI---- G-T-GN----
G-C-MGPI-- G-C-MAAP-- G-C-MAAC-- G-C-MAAU-- G-C-MAAD-- G-C-MDN--- G-C-MMPT--
G-C-MMPO-- G-C-MMPOC- G-C-MMPOR- G-C-MMPOF- G-C-MMPOS- G-C-MMPON- G-C-MOPD--
G-C-BOATD- G-C-BOAB-- G-C-BOAMA- G-C-BOAMT- G-C-BOAMD- G-C-BOAMC- G-C-BOAMU-
G-C-BOAMW- G-C-BOAIP- G-C-BOAIC- G-C-BOAIN- G-C-BOAIS- G-C-BOAIH- G-C-BOAID-
G-C-BOAV-- G-C-BYCG-- G-C-BSE--- G-C-BSF--- G-C-BSH--- G-C-BSU--- G-C-BWN---
G-C-BWE--- G-C-BWI--- G-C-BWF--- G-C-BWP--- G-C-BWDP-- G-C-BWDA-- G-C-BWDT--
G-C-BWDE-- G-C-BWDS-- G-C-BWDO-- G-C-BWDG-- G-C-FSTP-- G-C-FSS--- G-C-FAU---
G-C-SPA--- G-C-SPC--- G-C-SPY--- G-C-SPT--- G-C-SPD--- G-C-SPE--- G-C-SPL---
G-C-SPM--- G-C-SPR--- G-C-SPU--- G-C-SPO--- G-C-SPI--- G-C-SPN--- G-C-SPQT--
G-C-SPQA-- G-C-SPQB-- G-C-SPQC-- G-C-SPQD-- G-C-SPQE-- G-C-SPQF-- G-C-SPQG--
G-C-SPQH-- G-C-SPQI-- G-C-SPQJ-- G-C-SPMA-- G-C-SPMT-- G-C-OX---- G-C-OXRN--
G-C-OXUD-- G-C-OXUB-- G-C-OXUL-- G-C-OXUS-- G-C-OXWA-- G-C-OXWD-- G-C-OXWE--
G-C-OXWG-- G-C-OXWM-- G-C-OXWI-- G-C-OXWP-- G-C-OXY--- G-C-OXYP-- G-C-OXYD--
G-C-OXYL-- G-C-OXYC-- G-C-OXYS-- G-C-OXYB-- G-C-OXYA-- G-C-OXYV-- G-C-OXYT--
G-C-OXYR-- G-C-OXYK-- G-C-OXN--- G-C-OXH--- G-C-OXHQ-- G-C-OXHA-- G-C-OXHY--
G-C-OXHX-- G-C-OXR--- G-C-OXRR-- G-C-OXRW-- G-C-OXRP-- G-C-OXRT-- G-C-OXS---
G-C-OXSA-- G-C-OXSD-- G-C-OXSC-- G-C-OXAC-- G-C-OXAA-- G-C-OXAT-- G-C-OXAK--
G-C-OXAF-- G-C-OXAH-- G-C-OXAO-- G-C-OXAR-- G-C-OXAP-- G-C-OXAM-- G-C-OXAS--
G-C-OXAD-- G-C-OG---- G-C-OGC--- G-C-OGP--- G-C-OGT--- G-C-OGD--- G-C-OGL---
G-C-OGN--- G-C-OGR--- G-C-OGS--- G-C-OGI--- G-C-OGW--- G-O-VA---- G-O-VR----
G-O-VE---- G-O-VB---- G-O-VY---- G-O-VD---- G-O-VI---- G-O-VM---- G-O-VK----
G-O-VS---- G-O-VP---- G-O-VU---- G-O-VC---- G-O-VH---- G-O-VF---- G-O-VO----
G-O-VL---- G-O-VX---- G-O-VZ---- G-O-LB---- G-O-LG---- G-O-LW---- G-O-PR----
G-O-PRB--- G-O-PT---- G-O-PC---- G-O-PCU--- G-O-PD---- G-O-PM---- G-O-PH----
G-O-PHY--- G-O-PHW--- G-O-PHG--- G-O-PHT--- G-O-PG---- G-O-PS---- G-O-PF----
G-O-PI---- G-O-PE---- G-O-PX---- G-O-PJV--- G-O-PJA--- G-O-PJB--- G-O-PK----
G-O-PA---- G-O-PO---- G-O-IR---- G-O-IS---- G-O-IG---- G-O-IV---- G-O-IK----
G-O-ID---- G-O-IF----
`.trim().split(/\s+/));

const prescribed = new Map([["G-C-BWE---",{"affiliation":"H"}],["G-C-BWI---",{"affiliation":"H"}],["G-C-BWF---",{"affiliation":"F"}],["G-O-VA----",{"affiliation":"H"}],["G-O-VR----",{"affiliation":"H"}],["G-O-VE----",{"affiliation":"H"}],["G-O-VY----",{"affiliation":"H"}],["G-O-VD----",{"affiliation":"H"}],["G-O-VI----",{"affiliation":"H"}],["G-O-VM----",{"affiliation":"H"}],["G-O-VK----",{"affiliation":"H"}],["G-O-VS----",{"affiliation":"H"}],["G-O-VP----",{"affiliation":"H"}],["G-O-VU----",{"affiliation":"H"}],["G-O-VC----",{"affiliation":"H"}],["G-O-VH----",{"affiliation":"H"}],["G-O-VF----",{"affiliation":"H"}],["G-O-VO----",{"affiliation":"H"}],["G-O-VL----",{"affiliation":"H"}],["G-O-VX----",{"affiliation":"H"}],["G-O-VZ----",{"affiliation":"H"}],["G-O-LB----",{"affiliation":"H"}],["G-O-LG----",{"affiliation":"H"}],["G-O-LW----",{"affiliation":"H"}],["G-O-PR----",{"affiliation":"H"}],["G-O-PRB---",{"affiliation":"H"}],["G-O-PT----",{"affiliation":"H"}],["G-O-PC----",{"affiliation":"H"}],["G-O-PCU---",{"affiliation":"H"}],["G-O-PM----",{"affiliation":"H"}],["G-O-PH----",{"affiliation":"H"}],["G-O-PHY---",{"affiliation":"H"}],["G-O-PHG---",{"affiliation":"F"}],["G-O-PHT---",{"affiliation":"F"}],["G-O-PG----",{"affiliation":"H"}],["G-O-PS----",{"affiliation":"H"}],["G-O-PF----",{"affiliation":"N"}],["G-O-PI----",{"affiliation":"N"}],["G-O-PE----",{"affiliation":"H"}],["G-O-PX----",{"affiliation":"H"}],["G-O-PJV---",{"affiliation":"H"}],["G-O-PJA---",{"affiliation":"H"}],["G-O-PJB---",{"affiliation":"H"}],["G-O-PK----",{"affiliation":"H"}],["G-O-PA----",{"affiliation":"F"}],["G-O-PO----",{"affiliation":"H"}],["G-O-IG----",{"affiliation":"H"}],["G-O-IV----",{"affiliation":"H"}],["G-O-IK----",{"affiliation":"H"}],["G-O-ID----",{"affiliation":"H"}],["G-O-IF----",{"affiliation":"F"}]]);
// Annex B permits unspecified trailing fields. Keep the library's convenient
// ten-character form, but reject overlong/modern codes and later-edition flags.
export function isApp6aSidc(value) {
  const sidc = String(value)
    .toUpperCase()
    .replace(/\*/g, "-")
    .replace(/ /g, "");
  // Function IDs may contain digits (supply classes, e.g. USS1--).
  if (!/^[SG][PUAFNSHJKO][A-Z][AP][A-Z0-9-]{6}[A-Z0-9-]{0,5}$/.test(sidc))
    return false;
  if (!app6aCodes.has(`${sidc[0]}-${sidc[2]}-${sidc.slice(4, 10)}`))
    return false;
  const entry = prescribed.get(`${sidc[0]}-${sidc[2]}-${sidc.slice(4, 10)}`);
  if (entry?.affiliation && sidc[1] !== entry.affiliation) return false;
  if (entry?.status && sidc[3] !== entry.status) return false;
  // Table B-II size/mobility rules live in the APP-6A profile.
  if (!decodeApp6aSizeMobility(sidc).valid) return false;
  const orderOfBattle = sidc.padEnd(15, "-")[14];
  return "-AECGNSX".includes(orderOfBattle);
}
