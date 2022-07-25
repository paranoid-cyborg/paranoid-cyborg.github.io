/*
 * Mocha tests for the FO76 Abbreviation Translator. 
 * Designed to be as modular as possible, hence the arrays.
 * 
 * TODO: More tests, particularly for melee and armor. 
 * All effects are now tests somewhere, but all abbreviatons are not. That should be rectified ASAP.
 */


const chai = require('chai')
const expect = chai.expect

const translator = require('./translator')

describe('Translator', () => {
	describe('Translate', () => {

		// 26 effects, listed 7x3(+5)
		let primary_wep = ['Anti-Armor ', 'Aristocrat\'s ', 'Assassin\'s ', 'Berserker\'s ', 'Bloodied ', 'Double ', 'Executioner\'s ',
		'Exterminator\'s ', 'Furious ', 'Ghoul Slayer\'s ', 'Gourmand\'s ', 'Hunter\'s ', 'Instigating ', 'Juggernaut\'s ',
		 'Junkie\'s ', 'Medic\'s ', 'Mutant Slayer\'s ', 'Mutant\'s ', 'Nocturnal ', 'Quad ', 'Stalker\'s ',
		'Suppressor\'s ', 'Troubleshooter\'s ', 'Two Shot ', 'Vampire\'s ', 'Zealot\'s '];

		// 25 effects, listed 5x5
		let primary_armor = ['Aristocrat\'s ','Assassin\'s ','Auto-Stim ', 'Bolstering ' , 'Chameleon ',
		'Cloaking ','Exterminator\'s ','Ghoul Slayer\'s ','Hunter\'s ','Life Saving ',
		'Mutant Slayer\'s ', 'Mutant\'s ','Nocturnal ','Overeater\'s ','Regenerating ',
		'Troubleshooter\'s ','Unyielding ','Vanguard\'s ','Weightless ','Zealot\'s '];

		
		// 9 effects, listed 3x3
		let sec_r_wep = ['25% damage while aiming ' , '25% faster fire rate ' , '50% bashing damage ', 
		'50% V.A.T.S Critical damage ', '50% V.A.T.S hit chance ','50% limb damage ',
		'Explosive ', 'Last Shot ', 'Replenish 15 AP per kill '];

		// 5 effects, listed 1x5
		let sec_melee_weapon = ['50% limb damage ', '40% faster swing speed ', '40% more Power Attack damage ','Reflect 50% of damage while blocking ', '+25% damage when standing still ','50% V.A.T.S Critical damage ', 'Replenish 15 AP per kill ']

		// 15 effects, listed 5x3
		let sec_armor = ['+1 Strength ', '+1 Perception ', '+1 Endurance ', '+1 Charisma ', '+1 Intelligence ', 
		'+1 Agility ', '+1 Luck ','Increased AP refresh ', '25 Environmental Disease Resistance ', '25 Radiation Resistance ',
		'25 Poison Resistance ','Hunger and Thirst grow 10% slower ','+25 Fire Resistance ','+25 Cryo Resistance ','Receive 7% less explosion damage ']
		
		// 11 effects, listed 4x2(+3)
		let ter_r_wep = ['15% faster critical meter fill', '15% faster reload', '25% less V.A.T.S AP cost', '250 Damage Resistance while reloading', 
		'50 Damage Resistance while aiming', '90% reduced weight','+1 Agility', 'Breaks 50% slower', 
		'Hits can generate a Stealth Field','Faster movement speed while aiming', '+1 Perception']

		// 6 effects, listed 3x2
		let ter_melee_weapon = ['+1 Agility', '+1 Endurance', '+1 Strength',
		'Take 15% less damage while blocking','Take 40% less damage while Power Attacking',"90% reduced weight"]

		// 18 effects, listed 3x6
		let ter_armor = ['Ammo weight reduced by 20%','Weapon weight reduced by 20%','Food, drink, and chem weight reduced by 20%', 
		'Junk weight reduced by 20%','Harder to detect while sneaking','50% more durability',
		'15% less limb damage','75% chance to reduce damage by 15% while standing still',
		'75% chance to reduce damage by 15% while sprinting','Reduce damage by 15% while blocking','Falling damage reduced by 50%',
		'Increased size of sweet spot while picking locks','Stimpaks, RadAway, and Rad-X are 5% more effective','5% chance to deal 100 Fire DMG to melee attackers',
		'5% chance to deal 100 Energy DMG to melee attackers','5% chance to deal 100 Frost DMG to melee attackers','5% chance to deal 100 Poison DMG to melee attackers']

		it('H: A/25/A Fixer W: J/E/* Handmade', () => {
			expect(translator.translate("H: A/25/A Fixer W: J/E/* Handmade")).to.equal("Have: [AMBIGUOUS: Aristocrat's or Assassin's]/25% faster fire rate/+1 Agility Fixer Want: Junkie's/Explosive/[any 3rd star effect] Handmade Rifle")
		})
		it('H: AA25dwa15c, AA50c25 Fixers', () => {
			expect(translator.translate("AA25dwa15c, AA50c25 Fixers")).to.equal(primary_wep[0] + sec_r_wep[0] + ter_r_wep[0] + ", Anti-Armor 50% V.A.T.S Critical damage 25% less V.A.T.S AP cost Fixers")
		})
		it('H: AA2525 Fixer W: AASSS Bear Arm', () => {
			expect(translator.translate("H: AA2525 Fixer W: AASSS Bear Arm")).to.equal("Have: " + primary_wep[0] + sec_r_wep[1] + ter_r_wep[2]+ " Fixer Want: Anti-Armor 40% faster swing speed +1 Strength Bear Arm")
		})
		it('H: AA2515c Fixer W: Caps' , () => {
			expect(translator.translate("H: AA2515c Fixer W: Caps")).to.equal("Have: " +primary_wep[0] + sec_r_wep[1] + ter_r_wep[0]+ " Fixer Want: Caps")
		})
		it('AA 25ads 15crit Fixer W: AA 50c 15r Combat Rifle', () => {
			expect(translator.translate("AA 25ads 15c Fixer W: AA 50c 15r Combat Rifle")).to.equal(primary_wep[0] + sec_r_wep[0] + ter_r_wep[0]+ " Fixer Want: Anti-Armor 50% V.A.T.S Critical damage 15% faster reload Combat Rifle")
		})
		it('H: AA/DWA/15cf Fixer W:Ar/dwa/15r Fixer', () => {
			expect(translator.translate("H: AA/DWA/15cf Fixer W: Ar/dwa/15r Fixer")).to.equal("Have: Anti-Armor/25% damage while aiming/15% faster critical meter fill Fixer Want: Aristocrat's/25% damage while aiming/15% faster reload Fixer")
		})
		it('[price check] Ar2515r Fixer', () => {
			expect(translator.translate("[price check] Ari2515r Fixer")).to.equal("[price check] Aristocrat's 25% faster fire rate 15% faster reload Fixer")
		})
		it('H: Ar25ffr15fr Fixer W: Flux', () => {
			expect(translator.translate("H: Ar25ffr15fr Fixer W: Flux")).to.equal("Have: Aristocrat's 25% faster fire rate 15% faster reload Fixer Want: Flux")
		})
		it('Ar 25 15r Fixer', () => {
			expect(translator.translate("Ari 25 15r Fixer")).to.equal("Aristocrat's 25% faster fire rate 15% faster reload Fixer")
		})
		it('Ari 25ffr 15fr Fixer', () => {
			expect(translator.translate("Ari ffr 15fr Fixer")).to.equal("Aristocrat's 25% faster fire rate 15% faster reload Fixer")
		})
		it('Ari/FFR/15r Fixer', () => {
			expect(translator.translate("Ar/FFR/15r Fixer")).to.equal("Aristocrat's/25% faster fire rate/15% faster reload Fixer")
		})
		it('B2525 Fixer', () => {
			expect(translator.translate("B2525 Fixer")).to.equal("Bloodied 25% faster fire rate 25% less V.A.T.S AP cost Fixer")
		})
		it('H: B2525 Fixer W: B50c15 Fixer', () => {
			expect(translator.translate("H: B2525 Fixer W: B50c15 Fixer")).to.equal("Have: Bloodied 25% faster fire rate 25% less V.A.T.S AP cost Fixer Want: Bloodied 50% V.A.T.S Critical damage 15% faster critical meter fill Fixer")
		})
		it('B 25 25 Fixer', () => {
			expect(translator.translate("B 25 25 Fixer")).to.equal("Bloodied 25% faster fire rate 25% less V.A.T.S AP cost Fixer")
		})
		it('B/25/25 Fixer', () => {
			expect(translator.translate("B/25/25 Fixer")).to.equal("Bloodied/25% faster fire rate/25% less V.A.T.S AP cost Fixer")
		})
		it('BE250 Fixer', () => {
			expect(translator.translate("BE250 Fixer")).to.equal(primary_wep[4] + sec_r_wep[6] + ter_r_wep[3]+ " Fixer")
		})
		it('B E 250 Fixer', () => {
			expect(translator.translate("B E 250 Fixer")).to.equal(primary_wep[4] + sec_r_wep[6] + ter_r_wep[3]+ " Fixer")
		})
		it('B/E/250 Fixer', () => {
			expect(translator.translate("B/E/250 Fixer")).to.equal("Bloodied/Explosive/250 Damage Resistance while reloading Fixer")
		})
		it('B50c250', () => {
			expect(translator.translate("B50c250")).to.equal(primary_wep[4] + sec_r_wep[3] + ter_r_wep[3])
		})
		it('H: BEA Fixer W: BSSA Bear Arm', () => {
			expect(translator.translate("H: BEA Fixer W: BSSA Bear Arm")).to.equal("Have: " + primary_wep[4] + sec_r_wep[6] + ter_r_wep[6] + " Fixer Want: Bloodied 40% faster swing speed +1 Agility Bear Arm");
		})
		it('Ex50c25 Railway', () => {
			expect(translator.translate("Q50c25 Railway")).to.equal(primary_wep[19] + sec_r_wep[3] + ter_r_wep[2]+ " Railway Rifle")
		})
		it('AA2525 AGL', () => {
			expect(translator.translate("AA2525 AGL")).to.equal(primary_wep[0] + sec_r_wep[1] + ter_r_wep[2] + " Automatic Grenade Launcher")
		})
		it('Q/50c/25 Railway', () => {
			expect(translator.translate("Q/50c/25 Railway")).to.equal("Quad/50% V.A.T.S Critical damage/25% less V.A.T.S AP cost Railway Rifle")
		})
		it('Q50c25 Railway', () => {
			expect(translator.translate("Q50c25 Railway")).to.equal(primary_wep[19] + sec_r_wep[3] + ter_r_wep[2]+ " Railway Rifle")
		})
		it('B50c Railway', () => {
			expect(translator.translate("B50c Railway")).to.equal(primary_wep[4] + sec_r_wep[3] + "Railway Rifle")
		})
		it('H: BE Railway', () => {
			expect(translator.translate("H: BE Railway")).to.equal("Have: " + primary_wep[4] + sec_r_wep[6] + "Railway Rifle")
		})
		it('B/25 Railway', () => {
			expect(translator.translate("B/25 Railway")).to.equal("Bloodied/25% faster fire rate Railway Rifle")
		})
		it('Ari50h25 Railway', () => {
			expect(translator.translate("Ari50h15r Railway")).to.equal(primary_wep[1] + sec_r_wep[4] + ter_r_wep[1]+ " Railway Rifle")
		})
		it('As50b25 LMG', () => {
			expect(translator.translate("As50b90rw LMG")).to.equal("Assassin's 50% bashing damage 90% reduced weight LMG")
		})
		it('H: Asn50b25 LMG', () => {
			expect(translator.translate("H: Asn50b90rw LMG")).to.equal("Have: Assassin's 50% bashing damage 90% reduced weight LMG")
		})
		it('Ber50c250 Railway', () => {
			expect(translator.translate("Ber50c250 Railway")).to.equal(primary_wep[3] + sec_r_wep[3] + ter_r_wep[3]+ " Railway Rifle")
		})
		it('B 50h 50 Railway', () => {
			expect(translator.translate("B 50h 50 Railway")).to.equal(primary_wep[4] + sec_r_wep[4] + ter_r_wep[4]+ " Railway Rifle")
		})
		it('B/50h/50 Railway', () => {
			expect(translator.translate("B/50h/50 Railway")).to.equal("Bloodied/50% V.A.T.S hit chance/50 Damage Resistance while aiming Railway Rifle")
		})
		it('B50h50 Railway', () => {
			expect(translator.translate("B50h50 Railway")).to.equal("Bloodied 50% V.A.T.S hit chance 50 Damage Resistance while aiming Railway Rifle")
		})
		it('E/E/25 LMG', () => {
			expect(translator.translate("E/E/25 LMG")).to.equal("[AMBIGUOUS: Executioner's or Exterminator's]/Explosive/"+ ter_r_wep[2]+ " LMG")
		})
		it('Exe25 LMG', () => {
			expect(translator.translate("Exe25 LMG")).to.equal("Executioner's "+ sec_r_wep[1]+ "LMG")
		})
		it('DE90 NU Laser Rifle', () => {
			expect(translator.translate("DE90 NU Laser Rifle")).to.equal(primary_wep[5] + sec_r_wep[6] + ter_r_wep[5]+ " Non-Ultracite Laser Rifle")
		})
		it('H: DE90 NU Laser Rifle W: Rare Apparel', () => {
			expect(translator.translate("H: DE90 NU Laser Rifle W: Rare Apparel")).to.equal("Have: " + primary_wep[5] + sec_r_wep[6] + ter_r_wep[5]+ " Non-Ultracite Laser Rifle Want: Rare Apparel")
		})
		it('Exec50limb1A NU Laser Rifle', () => {
			expect(translator.translate("Exec50limb1A NU Laser Rifle")).to.equal(primary_wep[6] + sec_r_wep[5] + ter_r_wep[6]+ " Non-Ultracite Laser Rifle")
		})
		it('ExtLSb50s Pipe Rifle', () => {
			expect(translator.translate("ExtLSb50s Pipe Rifle")).to.equal(primary_wep[7] + sec_r_wep[7] + ter_r_wep[7]+ " Pipe Rifle")
		})
		it('Ext LS DUR Pipe Rifle', () => {
			expect(translator.translate("Ext LS DUR Pipe Rifle")).to.equal(primary_wep[7] + sec_r_wep[7] + ter_r_wep[7]+ " Pipe Rifle")
		})
		it('FAPStealth Pipe Rifle', () => { // lol
			expect(translator.translate("FAPStealth Pipe Rifle")).to.equal(primary_wep[8] + sec_r_wep[8] + ter_r_wep[8]+ " Pipe Rifle")
		})
		it('F AP Stealth Pipe Rifle', () => { 
			expect(translator.translate("F AP Stealth Pipe Rifle")).to.equal(primary_wep[8] + sec_r_wep[8] + ter_r_wep[8]+ " Pipe Rifle")
		})
		it('F/AP/Stlth Pipe Rifle', () => { 
			expect(translator.translate("F/AP/Stealth Pipe Rifle")).to.equal("Furious/Replenish 15 AP per kill/Hits can generate a Stealth Field Pipe Rifle")
		})
		it('GSDWAFMS Shotgun', () => { 
			expect(translator.translate("GSDWAFMS Shotgun")).to.equal(primary_wep[9] + sec_r_wep[0] + ter_r_wep[9]+ " Shotgun")
		})
		it('GS ADS DMG FMSWA Shotgun', () => { 
			expect(translator.translate("GS ADS DMG FMSWA Shotgun")).to.equal(primary_wep[9] + sec_r_wep[0] + ter_r_wep[9]+ " Shotgun")
		})
		it('GS/25DWA/FMSWA Shotgun', () => { 
			expect(translator.translate("GS/25DWA/FMSWA Shotgun")).to.equal("Ghoul Slayer's/25% damage while aiming/Faster movement speed while aiming Shotgun")
		})
		it('Gou25P GP', () => { 
			expect(translator.translate("Gou25P GP")).to.equal(primary_wep[10] + sec_r_wep[1] + ter_r_wep[10]+ " Gatling Plasma")
		})
		it('Gour FFR +1P Gat Plasma', () => { 
			expect(translator.translate("Gour FFR +1P Gat Plasma")).to.equal(primary_wep[10] + sec_r_wep[1] + ter_r_wep[10]+ " Gatling Plasma")
		})
		it('Grmd/25FFR/1P Gat Plasma', () => { 
			expect(translator.translate("Grmd/25FFR/1P Gat Plasma")).to.equal("Gourmand's/25% faster fire rate/+1 Perception Gatling Plasma")
		})
		it('H50b15c Gat Plasma', () => { 
			expect(translator.translate("H50b15c Gat Plasma")).to.equal(primary_wep[11] + sec_r_wep[2] + ter_r_wep[0]+ " Gatling Plasma")
		})
		it('H: 50b 15cf Gat Plasma', () => { 
			expect(translator.translate("H: H 50b 15cf Gat Plasma")).to.equal("Have: " + primary_wep[11] + sec_r_wep[2] + ter_r_wep[0]+ " Gatling Plasma")
		})
		it('H/Bash/15c GP', () => { 
			expect(translator.translate("H/bash/15cf GP")).to.equal("Hunter's/50% bashing damage/15% faster critical meter fill Gatling Plasma")
		})
		it('I50c15r Hunting Rifle', () => { 
			expect(translator.translate("I50c15r Hunting Rifle")).to.equal(primary_wep[12] + sec_r_wep[3] + ter_r_wep[1]+ " Hunting Rifle")
		})
		it('I 50c 15r Hunting Rifle', () => { 
			expect(translator.translate("I 50c 15r Hunting Rifle")).to.equal(primary_wep[12] + sec_r_wep[3] + ter_r_wep[1]+ " Hunting Rifle")
		})
		it('H: I/50c/15r Hunting Rifle W: A nice piece of fish', () => { 
			expect(translator.translate("H: I/50c/15r Hunting Rifle W: A nice piece of fish")).to.equal("Have: Instigating/50% V.A.T.S Critical damage/15% faster reload Hunting Rifle Want: A nice piece of fish")
		})
		it('In 50crit 15fr Hunting Rifle', () => { 
			expect(translator.translate("In 50c 15fr Hunting Rifle")).to.equal("Instigating 50% V.A.T.S Critical damage 15% faster reload Hunting Rifle")
		})
		it('Ins50c15r Hunting Rifle', () => { 
			expect(translator.translate("Ins50c15r Hunting Rifle")).to.equal("Instigating 50% V.A.T.S Critical damage 15% faster reload Hunting Rifle")
		})
		it('Inst50c15fr Hunting Rifle', () => { 
			expect(translator.translate("Inst50c15fr Hunting Rifle")).to.equal("Instigating 50% V.A.T.S Critical damage 15% faster reload Hunting Rifle")
		})
		it('Jug50vh25 Combat Rifle', () => { 
			expect(translator.translate("Jug50vh25 Combat Rifle")).to.equal(primary_wep[13] + sec_r_wep[4] + ter_r_wep[2]+ " Combat Rifle")
		})
		it('Jug 50vhc 25lvc Combat Rifle', () => { 
			expect(translator.translate("Jug 50vhc 25 Combat Rifle")).to.equal(primary_wep[13] + sec_r_wep[4] + ter_r_wep[2]+ " Combat Rifle")
		})
		it('Jg/50h/25 Combat Rifle', () => { 
			expect(translator.translate("Jg/50h/25 Combat Rifle")).to.equal("Juggernaut's/50% V.A.T.S hit chance/25% less V.A.T.S AP cost Combat Rifle")
		})
		it('J50L250 Combat Shotgun', () => { 
			expect(translator.translate("J50L250 Combat Shotgun")).to.equal(primary_wep[14] + sec_r_wep[5] + ter_r_wep[3]+ " Combat Shotgun")
		})
		it('MED E DUR Combat Shotgun', () => { 
			expect(translator.translate("MED E DUR Combat Shotgun")).to.equal(primary_wep[15] + sec_r_wep[6] + ter_r_wep[7]+ " Combat Shotgun")
		})
		it('MedE50d Combat Shotgun', () => { 
			expect(translator.translate("MedE50d Combat Shotgun")).to.equal(primary_wep[15] + sec_r_wep[6] + ter_r_wep[7]+ " Combat Shotgun")
		})
		it('MD/Ex/b50s Combat Shotgun', () => { 
			expect(translator.translate("MD/Ex/b50s Combat Shotgun")).to.equal("Medic's/Explosive/Breaks 50% slower Combat Shotgun")
		})
		it('MSLS50dr Gatling Gun', () => { 
			expect(translator.translate("MSLS50dr Gatling Gun")).to.equal(primary_wep[16] + sec_r_wep[7] + ter_r_wep[4]+ " Gatling Gun")
		})
		it('MS/LS/50drwa Gatling Gun', () => { 
			expect(translator.translate("MS/LS/50drwa Gatling Gun")).to.equal("Mutant Slayer's/Last Shot/50 Damage Resistance while aiming Gatling Gun")
		})
		it('MS LS 50 Gatling Gun', () => { 
			expect(translator.translate("MS LS 50 Gatling Gun")).to.equal(primary_wep[16] + sec_r_wep[7] + ter_r_wep[4]+ " Gatling Gun")
		})
		it('MuAP90 Gatling Gun', () => { 
			expect(translator.translate("MuAP90 Gatling Gun")).to.equal(primary_wep[17] + sec_r_wep[8] + ter_r_wep[5]+ " Gatling Gun")
		})
		it('Mu/rAP/90rw Gatling Gun', () => { 
			expect(translator.translate("Mu/rAP/90 Gatling Gun")).to.equal("Mutant's/Replenish 15 AP per kill/90% reduced weight Gatling Gun")
		})
		it('Mut AP 90w Gatling Gun', () => { 
			expect(translator.translate("Mut AP 90w Gatling Gun")).to.equal(primary_wep[17] + sec_r_wep[8] + ter_r_wep[5]+ " Gatling Gun")
		})
		it('NAP+1A Gatling Gun', () => { 
			expect(translator.translate("NAP+1A Gatling Gun")).to.equal(primary_wep[18] + sec_r_wep[8] + ter_r_wep[6]+ " Gatling Gun")
		})
		it('N rAP AGI Gatling Gun', () => { 
			expect(translator.translate("N rAP AGI Gatling Gun")).to.equal(primary_wep[18] + sec_r_wep[8] + ter_r_wep[6]+ " Gatling Gun")
		})
		it('N/15AP/A Gatling Gun', () => { 
			expect(translator.translate("N/15AP/A Gatling Gun")).to.equal("Nocturnal/Replenish 15 AP per kill/+1 Agility Gatling Gun")
		})
		it('Q25dwa50dur Railway Rifle', () => { 
			expect(translator.translate("Q25dwa50dur Railway Rifle")).to.equal(primary_wep[19] + sec_r_wep[0] + ter_r_wep[7]+ " Railway Rifle")
		})
		it('Q 25dwa b50s Railway Rifle', () => { 
			expect(translator.translate("Q 25dwa b50s Railway Rifle")).to.equal(primary_wep[19] + sec_r_wep[0] + ter_r_wep[7]+ " Railway Rifle")
		})
		it('Q/25dwa/dura Railway Rifle', () => { 
			expect(translator.translate("Q/25dwa/dura Railway Rifle")).to.equal("Quad/25% damage while aiming/Breaks 50% slower Railway Rifle")
		})
		it('Q/25/25 Railway Rifle', () => { 
			expect(translator.translate("Q/25/25 Railway Rifle")).to.equal("Quad/25% faster fire rate/25% less V.A.T.S AP cost Railway Rifle")
		})
		it('St25SF Handmade', () => { 
			expect(translator.translate("St25SF Handmade")).to.equal(primary_wep[20] + sec_r_wep[1] + ter_r_wep[8] + " Handmade Rifle")
		})
		it('Stlk/FFR/Stlth Handmade', () => { 
			expect(translator.translate("Stlk/FFR/Stlth Handmade")).to.equal("Stalker's/25% faster fire rate/Hits can generate a Stealth Field Handmade Rifle")
		})
		it('Stk 25FFR Stl Handmade', () => { 
			expect(translator.translate("Stlk 25FFR Stl Handmade")).to.equal(primary_wep[20] + sec_r_wep[1] + ter_r_wep[8] + " Handmade Rifle")
		})
		it('Sup50b50dur Handmade', () => { 
			expect(translator.translate("Sup50b50dur Handmade")).to.equal(primary_wep[21] + sec_r_wep[2] + ter_r_wep[7] + " Handmade Rifle")
		})
		it('Supr 50bash b50s Handmade', () => { 
			expect(translator.translate("Supr 50bash b50s Handmade")).to.equal(primary_wep[21] + sec_r_wep[2] + ter_r_wep[7] + " Handmade Rifle")
		})
		it('Tro50b25 Handmade', () => { 
			expect(translator.translate("Tro50b25 Handmade")).to.equal(primary_wep[22] + sec_r_wep[2] + ter_r_wep[2] + " Handmade Rifle")
		})
		it('TRO BASH AP COST Handmade', () => { 
			expect(translator.translate("TRO BASH AP COST Handmade")).to.equal(primary_wep[22] + sec_r_wep[2] + ter_r_wep[2] + " Handmade Rifle")
		})
		it('H: TS 50h +1A Handmade', () => { 
			expect(translator.translate("H: TS 50h +1A Handmade")).to.equal("Have: " + primary_wep[23] + sec_r_wep[4] + ter_r_wep[6] + " Handmade Rifle")
		})
		it('H: TSE25 Fixer', () => { 
			expect(translator.translate("H: TSE25 Fixer")).to.equal("Have: " + primary_wep[23] + sec_r_wep[6] + ter_r_wep[2] + " Fixer")
		})
		it('H: TS/E/25 Fixer', () => { 
			expect(translator.translate("H: TS/E/25 Fixer")).to.equal("Have: Two Shot/Explosive/25% less V.A.T.S AP cost Fixer")
		})
		it('H: VE25 Fixer', () => { 
			expect(translator.translate("H: VE25 Fixer")).to.equal("Have: " + primary_wep[24] + sec_r_wep[6] + ter_r_wep[2] + " Fixer")
		})
		it('H: V E 25 Fixer', () => { 
			expect(translator.translate("H: V E 25 Fixer")).to.equal("Have: " + primary_wep[24] + sec_r_wep[6] + ter_r_wep[2] + " Fixer")
		})
		it('H: V/E/25 Fixer', () => { 
			expect(translator.translate("H: V/E/25 Fixer")).to.equal("Have: Vampire's/Explosive/25% less V.A.T.S AP cost Fixer")
		})
		it('H: ZE250 GP W: 50 of each flux ', () => { 
			expect(translator.translate("H: ZE250 GP")).to.equal("Have: " + primary_wep[25] + sec_r_wep[6] + ter_r_wep[3] + " Gatling Plasma")
		})

		// Melee weapon tests
		it('H: AA50l1A Power Fist W: 250 caps ', () => { 
			expect(translator.translate("H: AA50l1A Power Fist W: 250 caps")).to.equal("Have: " + primary_wep[0] + sec_melee_weapon[0] + ter_melee_weapon[0] + " Power Fist Want: 250 caps")
		})
		it('H: AA/50l/+1E Power Fist W: AA/50l/+1A Deathclaw Gauntlet (or 250 caps)', () => { 
			expect(translator.translate("H: AA/50l/+1E Power Fist W: AA/50l/+1A Deathclaw Gauntlet (or 250 caps)")).to.equal("Have: Anti-Armor/50% limb damage/+1 Endurance Power Fist Want: Anti-Armor/50% limb damage/+1 Agility Deathclaw Gauntlet (or 250 caps)")
		})
		it('H: Ari SS 1E Power Fist W: J SS * Power Fist', () => { 
			expect(translator.translate("H: Ari SS 1E Power Fist W: J SS * Power Fist")).to.equal("Have: " + primary_wep[1] + sec_melee_weapon[1] + ter_melee_weapon[1] + " Power Fist Want: Junkie's 40% faster swing speed[any 3rd star effect] Power Fist")
		})
		it('W: As40PA1S Power Fist H: Caps, flux, weapons', () => { 
			expect(translator.translate("W: As40PA1S Power Fist H: Caps, flux, weapons")).to.equal("Want: " + primary_wep[2] + sec_melee_weapon[2] + ter_melee_weapon[2] + " Power Fist Have: Caps, flux, weapons")
		})
		it('W: Ber50b1S Revolutionary Sword', () => { 
			expect(translator.translate("W: Ber50b15b Revolutionary Sword")).to.equal("Want: " + primary_wep[3] + sec_melee_weapon[3] + ter_melee_weapon[3] + " Revolutionary Sword")
		})

		it('W: Ber50b1S Revolutionary Sword', () => { 
			expect(translator.translate("W: B sent 40PA Chinese Officer's Sword")).to.equal("Want: " + primary_wep[4] + sec_melee_weapon[4] + ter_melee_weapon[4] + " Chinese Officer's Sword")
		})
		it('W: Exe50c90rw Assaultron Blade', () => { 
			expect(translator.translate("W: Exe50c90rw Assaultron Blade")).to.equal("Want: " + primary_wep[6] + sec_melee_weapon[5] + ter_melee_weapon[5] + " Assaultron Blade")
		})
		it('W: ExtAP1A Assaultron Blade', () => { 
			expect(translator.translate("W: ExtAP1A Assaultron Blade")).to.equal("Want: " + primary_wep[7] + sec_melee_weapon[6] + ter_melee_weapon[0] + " Assaultron Blade")
		})
		it('W: FAP1E Assaultron Blade', () => { //oh lord
			expect(translator.translate("W: FAP1E Assaultron Blade")).to.equal("Want: " + primary_wep[8] + sec_melee_weapon[6] + ter_melee_weapon[1] + " Assaultron Blade")
		})
		it('W: GS limb S Assaultron Blade', () => {
			expect(translator.translate("W: GS limb S Assaultron Blade")).to.equal("Want: " + primary_wep[9] + sec_melee_weapon[0] + ter_melee_weapon[2] + " Assaultron Blade")
		})
		it('W: G/SS/S Power Fist', () => {
			expect(translator.translate("W: G/SS/S Power Fist")).to.equal("Want: [AMBIGUOUS: Gourmand's or Ghoul Slayer's]/40% faster swing speed/+1 Strength Power Fist")
		})
		it('W: GmSSS Bear Arm', () => {
			expect(translator.translate("W: GmSSS Bear Arm")).to.equal("Want: " + primary_wep[10] + sec_melee_weapon[1] + ter_melee_weapon[2] + " Bear Arm")
		})
		it('W: HSS15 Bear Arm', () => {
			expect(translator.translate("W: HSS15 Bear Arm")).to.equal("Want: " + primary_wep[11] + sec_melee_weapon[1] + ter_melee_weapon[3] + " Bear Arm")
		})
		it('W: I4040 Bear Arm', () => {
			expect(translator.translate("W: I4040 Bear Arm")).to.equal("Want: " + primary_wep[12] + sec_melee_weapon[1] + ter_melee_weapon[4] + " Bear Arm")
		})
		it('W: Jg 40 90 Bear Arm', () => {
			expect(translator.translate("W: Jg 40 90 Bear Arm")).to.equal("Want: " + primary_wep[13] + sec_melee_weapon[1] + ter_melee_weapon[5] + " Bear Arm")
		})
		it('W: JSSA Baseball Bat', () => {
			expect(translator.translate("W: JSSA Baseball Bat")).to.equal("Want: " + primary_wep[14] + sec_melee_weapon[1] + ter_melee_weapon[0] + " Baseball Bat")
		})
		it('W: MSSSS Baseball Bat', () => {
			expect(translator.translate("W: MSSSS Baseball Bat")).to.equal("Want: " + primary_wep[16] + sec_melee_weapon[1] + ter_melee_weapon[2] + " Baseball Bat")
		})
		it('W: MuSSS Baseball Bat', () => {
			expect(translator.translate("W: MuSSS Baseball Bat")).to.equal("Want: " + primary_wep[17] + sec_melee_weapon[1] + ter_melee_weapon[2] + " Baseball Bat")
		})
		it('W: NSSS Baseball Bat', () => {
			expect(translator.translate("W: NSSS Baseball Bat")).to.equal("Want: " + primary_wep[18] + sec_melee_weapon[1] + ter_melee_weapon[2] + " Baseball Bat")
		})
		it('W: SSSS Baseball Bat', () => {
			expect(translator.translate("W: SSSS Baseball Bat")).to.equal("Want: " + primary_wep[20] + sec_melee_weapon[1] + ter_melee_weapon[2] + " Baseball Bat")
		})
		it('W: Tr40SSS Baseball Bat', () => {
			expect(translator.translate("W: Tr40SSS Baseball Bat")).to.equal("Want: " + primary_wep[22] + sec_melee_weapon[1] + ter_melee_weapon[2] + " Baseball Bat")
		})
		it('W: V/SS/S Super Sledge', () => {
			expect(translator.translate("W: V/SS/S Super Sledge")).to.equal("Want: Vampire's/40% faster swing speed/+1 Strength Super Sledge")
		})
		it('W: Z/SS/90 War Drum', () => {
			expect(translator.translate("W: Z/SS/90 War Drum")).to.equal("Want: Zealot's/40% faster swing speed/90% reduced weight War Drum")
		})
		//Armor tests 
		it('W: Ar +1S AWR Combat Armor Chest Piece', () => {
			expect(translator.translate("W: Ar +1S AWR Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[0] + sec_armor[0] + ter_armor [0] + " Combat Armor Chest Piece")
		})
		it('W: Ass +1P WWR Combat Armor Chest Piece', () => {
			expect(translator.translate("W: Ass +1P WWR Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[1] + sec_armor[1] + ter_armor [1] + " Combat Armor Chest Piece")
		})
		it('W: AS1EFDCWR Combat Armor Chest Piece', () => {
			expect(translator.translate("W: AS1EFDCWR Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[2] + sec_armor[2] + ter_armor [2] + " Combat Armor Chest Piece")
		})
		it('W: B 1C JWR Combat Armor Chest Piece', () => {
			expect(translator.translate("W: B 1C JWR Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[3] + sec_armor[3] + ter_armor [3] + " Combat Armor Chest Piece")
		})
		it('W: Ch Int Sneak Combat Armor Chest Piece', () => {
			expect(translator.translate("W: Ch Int Sneak Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[4] + sec_armor[4] + ter_armor [4] + " Combat Armor Chest Piece")
		})
		it('W: Cloak +1A Dura Combat Armor Chest Piece', () => {
			expect(translator.translate("W: Cloak +1A Dura Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[5] + sec_armor[5] + ter_armor [5] + " Combat Armor Chest Piece")
		})
		it('W: Ext +1 Lck Limb Combat Armor Chest Piece', () => {
			expect(translator.translate("W: Ext +1 Lck Limb DR Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[6] + sec_armor[6] + ter_armor [6] + " Combat Armor Chest Piece")
		})
		it('W: GS AP Still Combat Armor Chest Piece', () => {
			expect(translator.translate("W: GS AP Still Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[7] + sec_armor[7] + ter_armor [7] + " Combat Armor Chest Piece")
		})
		it('W: H Disease Cav Combat Armor Chest Piece', () => {
			expect(translator.translate("W: H Disease Cav Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[8] + sec_armor[8] + ter_armor [8] + " Combat Armor Chest Piece")
		})
		it('W: GS AP Still Combat Armor Chest Piece', () => {
			expect(translator.translate("W: LS Rad DWB Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[9] + sec_armor[9] + ter_armor [9] + " Combat Armor Chest Piece")
		})
		it('W: MS Poison Acro Combat Armor Chest Piece', () => {
			expect(translator.translate("W: MS Poison Acro Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[10] + sec_armor[10] + ter_armor [10] + " Combat Armor Chest Piece")
		})
		it('W: Mu Glut Lock Combat Armor Chest Piece', () => {
			expect(translator.translate("W: Mu Glut Lock Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[11] + sec_armor[11] + ter_armor [11] + " Combat Armor Chest Piece")
		})
		it('W: GS AP Still Combat Armor Chest Piece', () => {
			expect(translator.translate("W: N FP Med Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[12] + sec_armor[12] + ter_armor [12] + " Combat Armor Chest Piece")
		})
		it('W: O Cryo Fire Combat Armor Chest Piece', () => {
			expect(translator.translate("W: O Cryo Fire Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[13] + sec_armor[13] + ter_armor [13] + " Combat Armor Chest Piece")
		})
		it('W: R Hardy Energy Combat Armor Chest Piece', () => {
			expect(translator.translate("W: R Hardy Energy Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[14] + sec_armor[14] + ter_armor [14] + " Combat Armor Chest Piece")
		})
		it('W: Tr S Frost Combat Armor Chest Piece', () => {
			expect(translator.translate("W: Tr 1S Frost Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[15] + sec_armor[0] + ter_armor [15] + " Combat Armor Chest Piece")
		})
		it('W: Uny +1P Poison Combat Armor Chest Piece', () => {
			expect(translator.translate("W: Uny +1P Poison Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[16] + sec_armor[1] + ter_armor [16] + " Combat Armor Chest Piece")
		})
		it('W: V +1E Ammo Combat Armor Chest Piece', () => {
			expect(translator.translate("W: V +1E Ammo Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[17] + sec_armor[2] + ter_armor [0] + " Combat Armor Chest Piece")
		})
		it('W: W +1C WW Combat Armor Chest Piece', () => {
			expect(translator.translate("W: W +1C WW Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[18] + sec_armor[3] + ter_armor [1] + " Combat Armor Chest Piece")
		})
		it('W: Z 1I FWR Combat Armor Chest Piece', () => {
			expect(translator.translate("W: Z 1I FWR Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[19] + sec_armor[4] + ter_armor [2] + " Combat Armor Chest Piece")
		})
		it('W: Z S FWR Combat Armor Chest Piece', () => {
			expect(translator.translate("W: Z S FWR Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[19] + sec_armor[0] + ter_armor [2] + " Combat Armor Chest Piece")
		})
		it('W: Z P FWR Combat Armor Chest Piece', () => {
			expect(translator.translate("W: Z P FWR Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[19] + sec_armor[1] + ter_armor [2] + " Combat Armor Chest Piece")
		})
		it('W: Z E FWR Combat Armor Chest Piece', () => {
			expect(translator.translate("W: Z E FWR Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[19] + sec_armor[2] + ter_armor [2] + " Combat Armor Chest Piece")
		})
		it('W: Z C FWR Combat Armor Chest Piece', () => {
			expect(translator.translate("W: Z C FWR Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[19] + sec_armor[3] + ter_armor [2] + " Combat Armor Chest Piece")
		})
		it('W: Z I FWR Combat Armor Chest Piece', () => {
			expect(translator.translate("W: Z I FWR Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[19] + sec_armor[4] + ter_armor [2] + " Combat Armor Chest Piece")
		})
		it('W: Z A FWR Combat Armor Chest Piece', () => {
			expect(translator.translate("W: Z A FWR Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[19] + sec_armor[5] + ter_armor [2] + " Combat Armor Chest Piece")
		})
		it('W: Z L FWR Combat Armor Chest Piece', () => {
			expect(translator.translate("W: Z L FWR Combat Armor Chest Piece")).to.equal("Want: " + primary_armor[19] + sec_armor[6] + ter_armor [2] + " Combat Armor Chest Piece")
		})
		// Some real post titles from the Market76 Subreddit
		it('[Reddit title #1]', () => { 
			expect(translator.translate("H: A question: Did you f**k around and not get ready for double XP weekend? I got you covered. W: At least an AAE50 laser? Or some downvotes if you think this is unreasonable.")).to.equal("Have: A question: Did you f**k around and not get ready for double XP weekend? I got you covered. Want: At least an Anti-Armor Explosive 50 Damage Resistance while aiming laser? Or some downvotes if you think this is unreasonable.")
		})
		it('[Reddit title #2]', () => { 
			expect(translator.translate("H: QE15r Double Barrel, TSE90 50cal, BE90 50cal, QFFR90 Tesla, More W: Wishlist Armors")).to.equal("Have: Quad Explosive 15% faster reload Double Barrel, Two Shot Explosive 90% reduced weight 50cal, Bloodied Explosive 90% reduced weight 50cal, Quad 25% faster fire rate 90% reduced weight Tesla, More Want: Wishlist Armors")
		})

	})
})