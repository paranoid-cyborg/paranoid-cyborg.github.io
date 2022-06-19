/*
Input: A string presumably containing some Fallout 76-related abbreviation(s)
Output: The same string, with said abbreviation(s) translated.

Design notes:

Translates the most obvious abbreviations via direct replacement.

For the more ambiguous ones, lookaheads and lookbehinds (sorry, non-V8 browser users) are used in an attempt to contextually translate only what needs translated.

When considering possible combinations of legendary effect abbreviations, this function supports spaces, tabs, or no delimiters at all.
I.e. B 25 25, B/25/25, and B2525 will all be translated correctly. 
Also translatable: B/25ffr/25lvc, as multiple abbreviations for the same effect are supported.

This is optimized for thoroughness and accuracy, not speed.

TODO: Refactor, inprove performance, increase amount of accepted abbreviations for armor SPECIAL stats
*/

function translate(input) {
    
    // utility regexes
    const firstCharRegex = "(?<=(^| ))"
    const lastCharRegex = "(?=( |$))"
    const delims = "(/| |)"

    const ranged_weapons = "(.|)50 cal|Machine Gun|10mm|Assault rifle|Auto grenade launcher|Combat (rifle|shotgun)|Enclave|(The |)Fixer|Flamer|Napalmer|Gatling|Gauss|HM|Handmade|NU|Laser|Legacy|Mini|Pipe|Plasma|Radium|Railway|SMG|Tesla rifle|Ultracite (|Gatling )Laser|UGL"
    const ranged_weapon_lookahed = "(?=" + delims + "(" + ranged_weapons + "))"

    // regexes for confirming a secondary legendary effect abbreviation by checking that the following characters match a tertiary abbreviation.
    // Since the third effect isn't always there or specified, we only use this for disambiguation when necessary.
    // Tertiary effects listed first to allow secondary regexes to reference them. Y'know, for disambiguation purposes.
    
    const tertiary_weapon_effects_ranged_only = "((\\+|)(1|)(| )P(|ER))|Reload|FR|15FR|15r|Reload DR|250|Aim DR|50drwa|50dr|50|Ghost|Stealth|Stlth|SF|FMSWA|FMS|Move speed|Move faster|faster|FMS|Stl|Ste|SF"
    const tertiary_weapon_effects_melee_only = "((\\+|)(1|)(| )(E(|ND)|S(|TR)))|Block(|ing)|Block|15bw|Power Attack|40PADR|40PA|40"
    const tertiary_weapon_effects_shared = "((\\+|)(1|)(| )A(|GI))|15(|c(|f))|15cf|25(|lvc)|(VATS|AP) Cost|Durability|dur|50d|50dur|b50s|90rw|90w|RW|90|\\*"
    const tertiary_armor_effects = "Ammo|AWR|AW|Weapon|WWR|WW|Food|FWR|FDCWR|FW|Aid|Junk|Jnk|JWR|JW|Underwater|Aqua|Sneak|Detect|Durability|50D|Limb|15L|Sentinel's|SENT|Stand|Cavalier's|Cav|Sprint|Blocking|15b|DWB|Acrobat's|50F|Safecracker's|SAFE|lock|Doctor's|Doc|Burning|BURN|FIRE|Frozen|Frz|Frost|Toxic|Tox|Poision"
   
    const tertiary_weapon_effects_ranged = "(" + tertiary_weapon_effects_ranged_only + "|" + tertiary_weapon_effects_shared + ")"
    const tertiary_weapon_effects_melee = "((" + tertiary_weapon_effects_melee_only + ")|(" + tertiary_weapon_effects_shared + "))"
   

    // If a third effect is ambiguous, we can follow it up with a check for a legendary item matching that description
    // There are times this won't work (e.g., very specific multiple effects listed for one weapon)
    // However, it'll catch a lot of them, and more importantly, avoid mistranslations.
    
    const tertiary_lookahead_ranged_weapon = "(?="+ delims + "(" + tertiary_weapon_effects_ranged_only +"|" + tertiary_weapon_effects_shared + ")( |$))"
    const tertiary_lookahead_melee_weapon = "(?=" + delims + "(" + tertiary_weapon_effects_melee_only + "|" + tertiary_weapon_effects_shared + ")( |$))"
    const tertiary_lookahead_weapon = "(?="+ delims + "("+ tertiary_weapon_effects_ranged_only + "|" + tertiary_weapon_effects_melee_only + "|" + tertiary_weapon_effects_shared + ")( |$))"
    const tertiary_lookahead_armor = "(?=" + delims + "(" + tertiary_armor_effects + "))"

    // melee and ranged effects separated both for disambiguation purposes, and because the strings would be even more gross and long otherwise.
    const secondary_weapon_effects_melee_only = "SS|Swing|40((|SS|S)|(PA|P))|Blocking|Reflect|50B|Steady|Stdy|sent|25D|Still"
    const secondary_weapon_effects_ranged_only = "25(?!0)|25(ffr|dwa)|DWA|50(H|V|B(|ash))|Bash|Aim|ADS|ffr|Exp|Hit Chance|VATS Hit|hit|Last Shot|LS|Ex|E"
    const secondary_weapon_effects_shared = "Limb|50L|50limb|rAP|AP|Replenish|15AP|r15ap|50c|50crit|Crit Damage|VATS Crit"
    
    const secondary_weapon_effects_melee =   secondary_weapon_effects_melee_only + "|"+ secondary_weapon_effects_shared
    const secondary_weapon_effects_ranged =  secondary_weapon_effects_ranged_only +"|"+ secondary_weapon_effects_shared 

    const secondary_armor_effects  = "\\+1|((1| )(S|P|E|C|I|A|L))|Str|Per|End|Cha|Int|Agi|Lck|Power|Pwr|APRefresh|AP(" + delims + tertiary_lookahead_armor + ")|Dis|Disease|Rad|(D|R|P)R|25(D|R|P)|Poi|Glut|Fire|FP|Warm|Cryo|Hardy|7|Exp|EDR";

    // Already-translated regexes are used when looking backwards, as we're translating legendary abbreviations sequentially.
    const secondary_ranged_weapon_effects_translated ="(bashing|limb|Critical) damage|by 40%|while aiming|explosive|fire rate|hit chance|last shot|per kill"
    const secondary_melee_weapon_effects_translated = "(limb|Power Attack) damage|swing speed|while blocking|standing still"
    const secondary_armor_effects_translated = "\\+1 (Strength|Perception|Endurance|Agility|Charisma|Intelligence|Agility|Luck)|AP Refresh|(Disease|Radiation|Poison|Fire|Cryo) Resistance|10% slower|explosion damage"

    const secondary_lookahead_melee_weapon = "(?=" + delims + "(" + secondary_weapon_effects_melee + ")($| |/|(" + tertiary_weapon_effects_melee + ")( |$)))";
    const secondary_lookahead_ranged_weapon = "(?=" + delims + "(" + secondary_weapon_effects_ranged +")($| |/|((" + tertiary_weapon_effects_ranged +")( |$))))";
    const secondary_lookahead_armor = "(?=" + delims  + "(" + secondary_armor_effects + "))";
    //const secondary_lookahead = "(?=" + delims + "(" + secondary_weapon_effects_melee + "|" + secondary_weapon_effects_ranged + "|" + secondary_armor_effects + "))";
    const secondary_lookahead = "(" + secondary_lookahead_melee_weapon + "|" + secondary_lookahead_ranged_weapon + "|" + secondary_lookahead_armor + ")"
    const secondary_lookahead_weapon = "(" + secondary_lookahead_melee_weapon + "|" + secondary_lookahead_ranged_weapon + ")"

    const secondaryLookbehind_melee ="(?<=(" + secondary_melee_weapon_effects_translated +")" + delims + ")"
    const secondaryLookbehind_ranged = "(?<=(" + secondary_ranged_weapon_effects_translated +")" + delims + ")"
    const secondaryLookbehind_weapon = "(?<=(" + secondary_ranged_weapon_effects_translated + "|" + secondary_melee_weapon_effects_translated + ")" + delims + ")";
    const secondaryLookbehind_armor = "(?<=(" + secondary_armor_effects_translated + ")" + delims + ")"

    const primary_weapon_effects = "AA|Ber|B|D|F|Gou|Gour|Grnmd|Grmd|Gmnd|G|Gm|Inst|Ins|I|Jug|Jnk|J|Med|Md|M|Q|St|Sup|S|SS|TS|2S|Vamp|V|Z"
    const primary_shared_effects = "Ar|Ari|A|Ext|Exec|Exe|E|GS|H|MS|Mut|M|Noct|Nct|N|Tro|Tr"
    const primary_armor_effects = "AS|AUTO|Bol|B|Cha|Ch|Cloak|Cl|Life|L|Regen|R|Uny|U|Van|V|W|Z"
    
    const primary_weapon_effects_translated = "]|Anti-Armor|Berzerker's|Bloodied|Double|Executioner's|Furious|Gourmand's|Instigating|Juggernaut's|Junkie's|Medic's|Quad|Stalker's|Suppressor's|Two Shot|Vampire's|Zealot's";
    const primary_shared_effects_translated = "Aristocrat's|Assassin's|Exterminator's|Ghoul Slayer's|Hunter's|Mutant Slayer's|Mutant's|Nocturnal|Troubleshooter's|Zealot's"
    const primary_armor_effects_translated = "Auto-Stim|Bolstering|Chameleon|Cloaking|Life Saving|Overeater's|Regenatierng|Troubleshooter's|Unyielding|Vanguard's|Weightless"

    const primary_lookbehind_weapon = "(?<=(" + primary_weapon_effects_translated + "|" + primary_shared_effects_translated + ")" + delims + ")"
    const primary_lookbehind_weapon_negative = "(?<=(" + primary_weapon_effects_translated + "|" + primary_shared_effects_translated + ")" + delims + ")"
    const primary_lookbehind_armor = "(?<=(" + primary_armor_effects_translated + "|" + primary_shared_effects_translated + ")" + delims + ")"

   
    var output = input;
    
    // ----- Part 1a: Primary Weapon-only Legendary Effects ---------

    const a_or_a_regex = new RegExp(firstCharRegex + "A" + secondary_lookahead_ranged_weapon, "gi");
    const bloodiedRegex = new RegExp(firstCharRegex + "B" + secondary_lookahead_weapon,"gi");
    const doubleRegex = new RegExp(firstCharRegex + "D" + secondary_lookahead_ranged_weapon,"gi");
    const executionersRegex = new RegExp("Exc|Exec(?!u)|Exe" + secondary_lookahead_weapon, "gi");
    const e_or_e_regex = new RegExp("((?<=^)|" + primary_lookbehind_weapon_negative + ")E" + secondary_lookahead_weapon, "gi");
    const furiousRegex = new RegExp(firstCharRegex + "F" + secondary_lookahead_weapon, "gi");
    const gourmandsRegex = new RegExp("Gour(?!ma)|Gou|Grmd|Gmnd|Gmd|Gm|Gd|Gr" + secondary_lookahead_weapon, "gi");
    const grmd_or_GS_regex = new RegExp(firstCharRegex+ "G" + secondary_lookahead_weapon, "gi");
    const instigatingRegex = new RegExp(firstCharRegex + "(Inst(?!ig)|(I|In|Ins))" + secondary_lookahead_weapon,  "gi");
    const junkiesRegex = new RegExp("Jn(?!k)|Jnk|J" + secondary_lookahead_weapon, "gi");
    const medicsRegex = new RegExp(firstCharRegex + "(Md|Mdc|Med)" + secondary_lookahead_ranged_weapon,"gi");
    const m_m_or_ms_regex = new RegExp(firstCharRegex + "M" + secondary_lookahead_weapon);
    const quadRegex = new RegExp(firstCharRegex + "Q" + secondary_lookahead_ranged_weapon, "gi");
    const stalkersRegex = new RegExp("Stlk|Stalk(?!er)|" + firstCharRegex + "(S|St)" + secondary_lookahead_weapon, "gi");
    const suppressorsRegex = new RegExp(firstCharRegex + "(Supr|Sup(?!pres)|Sprs|Sppr|Spr|(SS|Sp))" + secondary_lookahead_weapon, "gi");
    const twoShotRegex = new RegExp("2Shot|2S|TS" + secondary_lookahead_ranged_weapon, "gi");
    const vampiresRegex = new RegExp("Vamp(?!ire)|V" + secondary_lookahead_weapon, "gi");

    output = output.replace(a_or_a_regex, "[AMBIGUOUS: Aristocrat's or Assassin's]");
    output = output.replace(/(?<=^| )AA/gi, "Anti-Armor");
    output = output.replace(/Ber|Br|Bs(?!s)/gi, "Berserker's" );
    output = output.replace(bloodiedRegex, "Bloodied");
    output = output.replace(doubleRegex, "Double");
    output = output.replace(e_or_e_regex, "[AMBIGUOUS: Executioner's or Exterminator's]")
    output = output.replace(executionersRegex, "Executioner's");
    output = output.replace(furiousRegex, "Furious");
    output = output.replace(gourmandsRegex, "Gourmand's");
    output = output.replace(grmd_or_GS_regex, "[AMBIGUOUS: Gourmand's or Ghoul Slayer's]");
    output = output.replace(instigatingRegex, "Instigating");
    output = output.replace(/Jug(?!g)|Jg/gi, "Juggernaut's");
    output = output.replace(junkiesRegex, "Junkie's");
    output = output.replace(m_m_or_ms_regex, "[AMBIGUOUS: Mutant's, Medic's, or Mutant Slayer's]");
    output = output.replace(medicsRegex, "Medic's");
    output = output.replace(quadRegex, "Quad");
    output = output.replace(stalkersRegex, "Stalker's");
    output = output.replace(suppressorsRegex, "Suppressor's");
    output = output.replace(twoShotRegex, "Two Shot");
    output = output.replace(vampiresRegex, "Vampire's");


    // ----- Part 1b: Primary Armor-only Legendary Effects -----

    const autoStimRegex = new RegExp(firstCharRegex + "AS" + secondary_lookahead_armor, "gi");
    const bolsteringRegex = new RegExp (firstCharRegex + "(B|Bol)" + secondary_lookahead_armor,"gi");
    const chameleonRegex = new RegExp("(Ch|Cha)" + secondary_lookahead_armor, "gi");
    const cloakingRegex = new RegExp ("(Cl|Cloak)" + secondary_lookahead_armor, "gi");
    const lifeSavingRegex = new RegExp("Life(?!(| )Saving)|" + firstCharRegex + "LS" + secondary_lookahead_armor, "gi");
    const m_or_m_regex = new RegExp(firstCharRegex + "M" + secondary_lookahead_armor);
    const overeatersRegex = new RegExp(firstCharRegex + "(OE|Over|O)" + secondary_lookahead_armor, "gi");
    const unyieldingRegex = new RegExp("Uny(?!ie)|" + firstCharRegex + "U" + secondary_lookahead_armor, "gi");
    const vanguardsRegex = new RegExp("Van(?!gua)|Vgd|Vngd|" + firstCharRegex + "V" + secondary_lookahead_armor, "gi");
    const weightlessRegex = new RegExp(firstCharRegex + "(W|WL)" + secondary_lookahead_armor, "gi");
    const regeneratingRegex = new RegExp(firstCharRegex + "R" + secondary_lookahead_armor + "|Regen(?!era)", "gi")

    output = output.replace(autoStimRegex, "Auto-Stim")
    output = output.replace(bolsteringRegex, "Bolstering")
    output = output.replace(chameleonRegex, "Chameleon")
    output = output.replace(cloakingRegex, "Cloaking")
    output = output.replace(lifeSavingRegex, "Life Saving")
    output = output.replace(m_or_m_regex, "[AMBIGUOUS: Mutant's or Mutant Slayer's]");
    output = output.replace(overeatersRegex, "Overeater's")
    output = output.replace(regeneratingRegex, "Regenerating");
    output = output.replace(unyieldingRegex, "Unyielding")
    output = output.replace(vanguardsRegex, "Vanguard's")
    output = output.replace(weightlessRegex, "Weightless")
    

    // ---- Part 1c: Primary Shared Legendary Effects -----

    const aristocratsRegex = new RegExp(firstCharRegex + "(Ari|Ar)" + secondary_lookahead, "gi");
    const assassinsRegex = new RegExp(firstCharRegex + "(As|Ass|Asn)" + secondary_lookahead, "gi")
    const ghoulSlayersRegex = new RegExp(firstCharRegex + "GS" + secondary_lookahead,"gi");
    const huntersRegex = new RegExp(firstCharRegex + "H" + secondary_lookahead, "gi");
    const mutantsRegex = new RegExp(firstCharRegex + "(Mut(?!ant)|Mu)" + secondary_lookahead, "gi");
    const mutantSlayersRegex = new RegExp(firstCharRegex + "MS" + secondary_lookahead, "gi");
    const nocturnalRegex = new RegExp(firstCharRegex + "N" + secondary_lookahead, "gi")
    const troubleshootersRegex = new RegExp(firstCharRegex + "(Tro(?!uble)|Tr)" + secondary_lookahead, "gi")
    const zealotsRegex = new RegExp(firstCharRegex + "Z" + secondary_lookahead,"gi");

    output = output.replace(aristocratsRegex, "Aristocrat's");
    output = output.replace(assassinsRegex, "Assassin's")
    output = output.replace(/(?<=(^| ))Ext(?!erm)/, "Exterminator's")
    output = output.replace(ghoulSlayersRegex, "Ghoul Slayer's")
    output = output.replace(mutantSlayersRegex, "Mutant Slayer's")
    output = output.replace(mutantsRegex, "Mutant's")
    output = output.replace(nocturnalRegex, "Nocturnal")
    output = output.replace(troubleshootersRegex, "Troubleshooter's")
    output = output.replace(huntersRegex, "Hunter's")
    output = output.replace(zealotsRegex, "Zealot's")


    // ----- Part 2a: Secondary Weapon Legendary Effects -------
    
    // regexes for ranged,
    const bashingRegex = new RegExp("(| )(50bash|bash(?!i)|(50b" + tertiary_lookahead_ranged_weapon +"))","gi")
    const explosiveRegex = new RegExp("(| )(" + primary_lookbehind_weapon + "(Exp|Ex|E)(?=($|" + tertiary_lookahead_ranged_weapon + "|" + ranged_weapon_lookahed + ")))", "gi");
    const ffrRegex = new RegExp("(| )(25ffr|25 ffr|ffr|(" + primary_lookbehind_weapon + "25(" + lastCharRegex + "|" + tertiary_lookahead_ranged_weapon + ")))", "gi");
    const last_shot_regex = new RegExp("(| )" + primary_lookbehind_weapon + "LS((?=$| )|" + tertiary_lookahead_ranged_weapon + ")", "gi");
    // melee,
    const swingspeedRegex = new RegExp("(| )" + primary_lookbehind_weapon + "(SS|40|40SS)" + tertiary_lookahead_melee_weapon, "gi")
    const powerAttackRegex = new RegExp("(| )"+ primary_lookbehind_weapon + "(Power Attack(?! damage)|Attack dmg|40PA|40P|PA" + tertiary_lookahead_weapon + ")", "gi")
    const reflectingRegex = new RegExp("(| )(Reflect(?!( 50%))|50b|(?<!(50% of damage while ))blocking" + tertiary_lookahead_melee_weapon + ")","gi")
    const steady_regex = new RegExp("(| )(25d|25ss|(" + primary_lookbehind_weapon + "(steady|ste|sent|still)" + lastCharRegex + "))", "gi")
    // and shared.
    const regen_ap_regex = new RegExp("(| )(rAP|r15AP|15ap|" + primary_lookbehind_weapon + "(| )(rAP|15|AP)" + tertiary_lookahead_weapon + ")", "gi")
    const limb_dmg_regex = new RegExp("(| )(" + primary_lookbehind_weapon + "(50limb|50l|limb(?!( damage)))" + tertiary_lookahead_weapon + ")", "gi")

    // replace ranged,
    output = output.replace(ffrRegex, " 25% faster fire rate");
    output = output.replace(/(| )(25dwa|dwa|ads dmg|25ads|ads)/gi, " 25% damage while aiming");
    output = output.replace(bashingRegex, " 50% bashing damage")
    output = output.replace(/(| )(50hit|50vhc|50vh|50hc|50h)/gi, " 50% V.A.T.S hit chance");
    output = output.replace(last_shot_regex, " Last Shot");
    output = output.replace(explosiveRegex, " Explosive");
    // melee,
    output = output.replace(reflectingRegex," Reflect 50% of damage while blocking")
    output = output.replace(powerAttackRegex, " 40% more Power Attack damage")
    output = output.replace(swingspeedRegex, " 40% faster swing speed")
    output = output.replace(steady_regex, " +25% damage when standing still")
    output = output.replace(reflectingRegex," Reflect 50% of damage while blocking")
    output = output.replace(powerAttackRegex, " 40% more Power Attack damage")
    output = output.replace(swingspeedRegex, " 40% faster swing speed")
    // and shared.
    output = output.replace(limb_dmg_regex, " 50% limb damage");
    output = output.replace(/(| )(50c|50crit)/gi, " 50% V.A.T.S Critical damage")
    output = output.replace(regen_ap_regex, " Replenish 15 AP per kill")


    // ----- Part 2d: Secondary Armor Effects

    const strength_regex_armor =   new RegExp("(| )" + primary_lookbehind_armor + "((\\+|)1(| )| )S(|TR)(?=(/| |("+ tertiary_lookahead_armor + ")))", "gi")
    const perception_regex_armor = new RegExp("(| )" + primary_lookbehind_armor + "((\\+|)1(| )| )P(|ER)(?=(/| |("+ tertiary_lookahead_armor + ")))", "gi")
    const endurance_regex_armor =  new RegExp("(| )" + primary_lookbehind_armor + "((\\+|)1(| )| )E(|ND)(?=(/| |("+ tertiary_lookahead_armor + ")))", "gi")
    const charisma_regex =         new RegExp("(| )" + primary_lookbehind_armor + "((\\+|)1(| )| )C(|HA)(?=(/| |("+ tertiary_lookahead_armor + ")))", "gi")
    const intelligence_regex =     new RegExp("(| )" + primary_lookbehind_armor + "((\\+|)1(| )| )I(|NT)(?=(/| |("+ tertiary_lookahead_armor + ")))", "gi")
    const agility_regex_armor =    new RegExp("(| )" + primary_lookbehind_armor + "((\\+|)1(| )| )A(|GI)(?=(/| |("+ tertiary_lookahead_armor + ")))", "gi")
    const luck_regex =             new RegExp("(| )" + primary_lookbehind_armor + "((\\+|)1(| )| )L(|CK)(?=(/| |("+ tertiary_lookahead_armor + ")))", "gi")
    const disease_regex = new RegExp("(| )(Disease(?!( Resistance))|Dis|25D|(" + primary_lookbehind_armor + "DR" + lastCharRegex + "))","gi")
    const fireproof_regex = new RegExp("(| )(" + primary_lookbehind_armor + "(F(|ire|P))" + lastCharRegex + ")", "gi")
    const poisoners_regex = new RegExp("(| )(" + primary_lookbehind_armor + "(| )(Poison(?!(er's| Resistance))|poi|25P)" + lastCharRegex + ")", "gi")
    const gluttons_regex = new RegExp("(| )(Glut|(" + primary_lookbehind_armor + "G" + lastCharRegex + "))","gi")
    // hardy = 7% less explosion damage
    const hardy_regex = new RegExp("(| )(Hardy|Hard|(" + primary_lookbehind_armor + "(H|7|Expl|Exp|Ex)" + lastCharRegex + "))","gi")
    const powered_regex = new RegExp("(| )(Powered|AP Refresh|(" + primary_lookbehind_armor + "(PWR|AP)" + lastCharRegex + "))","gi")
    const rad_resist_regex = new RegExp("(| )(Rad resist|Rad|25R|(" + primary_lookbehind_armor + "RR" + lastCharRegex + "))", "gi")

    output = output.replace(strength_regex_armor," +1 Strength")
    output = output.replace(perception_regex_armor, " +1 Perception")
    output = output.replace(endurance_regex_armor, " +1 Endurance")
    output = output.replace(charisma_regex, " +1 Charisma")
    output = output.replace(intelligence_regex, " +1 Intelligence")
    output = output.replace(agility_regex_armor, " +1 Agility")
    output = output.replace(luck_regex, " +1 Luck")
    output = output.replace(disease_regex, " 25 Environmental Disease Resistance")
    output = output.replace(fireproof_regex, " +25 Fire Resistance")
    output = output.replace(hardy_regex, " Receive 7% less explosion damage")
    output = output.replace(gluttons_regex, " Hunger and Thirst grow 10% slower")
    output = output.replace(poisoners_regex," 25 Poison Resistance")
    output = output.replace(powered_regex, " Increased AP refresh")
    output = output.replace(rad_resist_regex, " 25 Radiation Resistance")
    output = output.replace(/(| )(Warming|WARM|CRYO(?!lator| resist(|ance)))/gi," +25 Cryo Resistance")

    // ----- Part 3a: Tertiary Weapon Effects --------      
    
    const break_slower_regex = new RegExp("(| )((b50s|50dur|50d|(" + secondaryLookbehind_weapon + "(dura|dur)))" + lastCharRegex + ")", "gi")
    const drwaRegex = new RegExp("(| )(50drwa|50dr|50ads|(" + secondaryLookbehind_weapon + "50)" + lastCharRegex + ")","gi")
    const drwr_regex = new RegExp("(| )(250drwr|250dr|" + secondaryLookbehind_weapon + "250"+ lastCharRegex + ")","gi")
    const reload_regex = new RegExp("(| )(15r|15fr|" + secondaryLookbehind_weapon + "(FR|Reload)"+ lastCharRegex + ")","gi")
    const stealthRegex = new RegExp("(| )(Stealth(?! Field)|Stl|Stlth|SF)(?=($| ))")
    // Only check for single-character (i.e., contextual) abbrviations for SPECIAL stats from here on out.
    // We already translated the all common ones (e.g. 1S, +1P, 1 END, +1 CHA, etc) in the armor secondary effects section.
    const strengthRegex = new RegExp("(| )((\\+|)1S(|TR)(?= )|("+ secondaryLookbehind_melee + "S" + lastCharRegex +"))","gi");
    const perceptionRegex = new RegExp("(| )("+ secondaryLookbehind_weapon + "((\\+|)1(| )|)P(|ER)(?=(/| |(" + lastCharRegex +"))))","gi");
    const enduranceRegex = new RegExp("(| )((\\+|)1E(|ND)(?= )|("+ secondaryLookbehind_melee + "E" + lastCharRegex +"))","gi");
   

    output = output.replace(break_slower_regex, " Breaks 50% slower")
    output = output.replace(/(| )(15vcf|15vc|15cf|15c|VATS Crit|15 Crit Fill|Crit Fill|Crit Meter|(?<=critical damage)15(?=( |$)))/gi, " 15% faster critical meter fill")
    output = output.replace(drwr_regex, " 250 Damage Resistance while reloading")
    output = output.replace(drwaRegex, " 50 Damage Resistance while aiming")
    output = output.replace(/(| )(fmswa|fms)/gi, " Faster movement speed while aiming")
    output = output.replace(reload_regex, " 15% faster reload")
    output = output.replace(perceptionRegex, " +1 Perception")
    output = output.replace(stealthRegex, " Hits can generate a Stealth Field")
    
    
    // ----- Part 3b: Tertiary melee Weapon Effects
    const blocking_regex = new RegExp("(| )(15b|(" + secondaryLookbehind_melee + "(15|Blocking)" + lastCharRegex + "))", "gi")
    const padr_regex = new RegExp("(| )(40PAdr|(" + secondaryLookbehind_melee + "(40(|pa|ld(|wpa)))" + lastCharRegex + "))", "gi")

    output = output.replace(strengthRegex, " +1 Strength")
    output = output.replace(enduranceRegex, " +1 Endurance")
    output = output.replace(blocking_regex, " Take 15% less damage while blocking")
    output = output.replace(padr_regex, " Take 40% less damage while Power Attacking")

    // ----- Part 3c: Tertiary Shared Weapon Effects --------

    const agilityRegex = new RegExp("(| )(\\+1 AGI(?!L)|\\+1A|1A|AGI(?!L)|("+ secondaryLookbehind_weapon + "A" + lastCharRegex +"))","gi");
    const vatsCostRegex = new RegExp("(| )(25lvc|25 lvc|AP COST|(" + secondaryLookbehind_ranged + "25"+ lastCharRegex + "))","gi");
    
    output = output.replace(agilityRegex, " +1 Agility")
    output = output.replace(vatsCostRegex, " 25% less V.A.T.S AP cost")
    output = output.replace(/(| )(90rw|90r|90w|90)/gi, " 90% reduced weight")

    // ----- Part 3d: Tertiary Armor Effects --------

    const ammo_weight_regex = new RegExp("(| )(AWR|(" + secondaryLookbehind_armor + "(Ammo(?!( weight reduced)))" + lastCharRegex+"))", "gi")
    const weapon_weight_regex = new RegExp("(| )(WWR|WW|(" + secondaryLookbehind_armor + "(Weapon(?!( weight reduced)))" + lastCharRegex+"))", "gi")
    const aid_weight_regex = new RegExp("(| )(FWR|FW|FDCWR|(" + secondaryLookbehind_armor + "AID" + lastCharRegex+"))")
    const junk_weight_regex = new RegExp("(| )(JWR|(" + secondaryLookbehind_armor + "(Junk(?!( weight reduced)))" + lastCharRegex+"))", "gi")
    const sneaky_regex = new RegExp("(| )("+ secondaryLookbehind_armor +"(Sneak(?!(ing)))"+ lastCharRegex +")", "gi")
    const durability_regex = new RegExp("(| )(" + secondaryLookbehind_armor + "(Durability|Dura|Dur|50d|50)" + lastCharRegex+")", "gi")
    const limb_regex = new RegExp("(| )(15L|Limb DR|(" + secondaryLookbehind_armor + "(limb(?!( damage)))" + lastCharRegex + "))", "gi")
    const sentinels_regex = new RegExp("(| )(" + secondaryLookbehind_armor + "(SENT|Stand|Still)" + lastCharRegex+")", "gi")
    const cavaliers_regex = new RegExp("(| )(" + secondaryLookbehind_armor + "(CAV|Sprint)" + lastCharRegex+")", "gi")
    const blocking_regex_armor = new RegExp("(| )(DWB|15B(|lock(|ing))|(" + secondaryLookbehind_armor + "(blocking(?!( by 15%)))" + lastCharRegex + "))", "gi")
    const safecrackers_regex = new RegExp("(| )(" + secondaryLookbehind_armor + "(safe(?! crack)|SC|lock)" + lastCharRegex + ")","gi")
    const doctors_regex = new RegExp("(| )(" + secondaryLookbehind_armor + "(Med|Doc)" + lastCharRegex + ")","gi")
    const burning_regex = new RegExp("(| )(" + secondaryLookbehind_armor + "(BURN(|ing)|FIRE)" + lastCharRegex + ")","gi")
    const electrified_regex = new RegExp("(| )(" + secondaryLookbehind_armor + "(ELEC(|trified)|ENERGY)" + lastCharRegex + ")","gi")
    const frozen_regex = new RegExp("(| )(" + secondaryLookbehind_armor + "(Frozen|Frost(?! D)|FRZ|CRYO)" + lastCharRegex + ")","gi")
    const toxic_regex = new RegExp("(| )(" + secondaryLookbehind_armor + "(TOX(|ic)|POISON)" + lastCharRegex + ")","gi")

    output = output.replace(ammo_weight_regex, " Ammo weight reduced by 20%")
    output = output.replace(weapon_weight_regex, " Weapon weight reduced by 20%")
    output = output.replace(aid_weight_regex, " Food, drink, and chem weight reduced by 20%")
    output = output.replace(junk_weight_regex, " Junk weight reduced by 20%")
    output = output.replace(sneaky_regex, " Harder to detect while sneaking")
    output = output.replace(/(?<!breathe )underater|aqua/gi, " Ability to breathe underwater")
    output = output.replace(durability_regex, " 50% more durability")
    output = output.replace(limb_regex, " 15% less limb damage")
    output = output.replace(sentinels_regex, " 75% chance to reduce damage by 15% while standing still")
    output = output.replace(cavaliers_regex, " 75% chance to reduce damage by 15% while sprinting")
    output = output.replace(blocking_regex_armor, " Reduce damage by 15% while blocking")
    output = output.replace(/(| )(Acro(?!b)|50f(|all))/gi, " Falling damage reduced by 50%")
    output = output.replace(safecrackers_regex, " Increased size of sweet spot while picking locks")
    output = output.replace(doctors_regex, " Stimpaks, RadAway, and Rad-X are 5% more effective")
    output = output.replace(burning_regex, " 5% chance to deal 100 Fire DMG to melee attackers")
    output = output.replace(electrified_regex, " 5% chance to deal 100 Energy DMG to melee attackers")
    output = output.replace(frozen_regex, " 5% chance to deal 100 Frost DMG to melee attackers")
    output = output.replace(toxic_regex, " 5% chance to deal 100 Poison DMG to melee attackers")

    const any_regex = new RegExp("(| )((" + secondaryLookbehind_armor + "|" + secondaryLookbehind_weapon +")\\*)", "gi")
    output = output.replace(any_regex, "[any 3rd star effect]")
    

    // ----- Part 4: Other Abbreviations --------

    const slashes = new RegExp("/ ","g");

    output = output.replace(/Nu /gi, "Non-Ultracite ");
    output = output.replace(/H:/gi, "Have:");
    output = output.replace(/W:/gi, "Want:");
    output = output.replace(/AGL/gi, "Automatic Grenade Launcher");
    output = output.replace(/GP|Gat Plasma/gi, "Gatling Plasma");
    output = output.replace(/Handmade(?! ri)/gi, "Handmade Rifle");
    output = output.replace(/Railway(?! rifle)/gi, "Railway Rifle");

    output = output.replace(slashes, "/"); // clean up output if slash was used as a delimiter. 

    return output; 
}
// export statement below is for mocha/chai testing
//exports.translate = translate;
