const reaction_damage_values = {
    "elemasteryadd": [17.17, 80.58, 80.58, 207.38, 207.38, 323.6, 323.6, 492.88, 492.88, 765.64, 765.64, 1110.0, 1110.0, 1446.85],
    "elemasterybonus": [17.17, 80.58, 80.58, 207.38, 207.38, 323.6, 323.6, 492.88, 492.88, 765.64, 765.64, 1110.0, 1110.0, 1446.85],
    "elemasterycrystalize": [91.18, 303.83, 303.83, 585.00, 585.00, 786.79, 786.79, 1030.08, 1030.08, 1314.75, 1314.75, 1596.81, 1596.81, 1851.06]
}

const bonusdmg_visions = ["all", "anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro", "physical"];
const bonusdmg_types = ["all", "normal", "charged", "plunge", "skill", "burst"];

function equip_skills_change_trigger() {

    equip_skills_display_active_all();
    equip_storage_save_last();
}

function equip_skills_change_add_active(attack_ids) {

    user_objects.user_party[user_objects.user_active_character].active_skills.push(
        { "attack_type": attack_ids.attack_type, "attack_id": attack_ids.attack_id, "part_id": attack_ids.part_id, "reaction": false, "count": 1 }
    );

    equip_skills_change_trigger();
}

function equip_skills_change_count_active(index, count) {
    count = utils_number_verify(count, 0, 1, 99);
    if (count != null) {
        user_objects.user_party[user_objects.user_active_character].active_skills[index].count = count;
        equip_skills_change_trigger();
    }    
}

function equip_skills_change_reaction_active(index) {

    equip_skills_change_trigger();
}

function equip_skills_change_delete_active(index) {
    user_objects.user_party[user_objects.user_active_character].active_skills.splice(index, 1);
    equip_skills_change_trigger();
}

function equip_skills_update_reset_active(party_id) {
    user_objects.user_party[party_id].active_skills = [];
}

function equip_skills_update_verify_active(party_id) {
    var active_skills = user_objects.user_party[party_id].active_skills;
    for (var i = active_skills.length - 1; i >= 0; i--) {
        if (active_skills[i].attack_type != "attacks") {
            var split_attack_type = active_skills[i].attack_type.split(".");
            var skill_type = split_attack_type[0];
            var skill_id = parseInt(split_attack_type[1]);
            var active = false;
            if (skill_type == "passive" && user_objects.user_party[party_id].level >= character.passive[skill_id].level) {
                active = true;
            } else if (skill_type == "const" && user_objects.user_party[party_id].constel > skill_id) {
                active = true;
            }  

            if (!active) {
                utils_log_debug("Removing active skill: " + active_skills[i].attack_type)
                active_skills.splice(i, 1);
            }
        }
    }
}

function equip_skills_update_all() {
    for (var i = 0; i < party_size; i++) {
        equip_skills_update_reactions(i);
        equip_skills_update_bonusdmg(i);
        equip_skills_update_character(i);
        equip_skills_update_verify_active(i);
    }
}



function equip_skills_update_character(party_id) {
    
    var current_character = data_characters[user_objects.user_party[party_id].id];

    output_party[party_id].skills.attacks = equip_skills_return_character_attacks(current_character.attacks, party_id, "attacks", true);
    output_party[party_id].skills.passive = equip_skills_return_character_skills(current_character.passive, party_id, "passive");
    output_party[party_id].skills.const = equip_skills_return_character_skills(current_character.const, party_id, "const");
}


function equip_skills_update_reactions(party_id) {
    var reactions = {};

    var vision = data_characters[user_objects.user_party[party_id].id].vision;
    reactions[vision] = {};
    for (var i = 0; i < visions_variables[vision].reactions.length; i++) {
        reactions[vision][visions_variables[vision].reactions[i]] = equip_skills_return_reaction(party_id, visions_variables[vision].reactions[i], vision);
    }
    if (output_party[party_id].effects.infusion && output_party[party_id].effects.infusion != vision) {
        var infusion = output_party[party_id].effects.infusion;
        reactions[infusion] = {};
        for (var i = 0; i < visions_variables[infusion].reactions.length; i++) {
            reactions[infusion][visions_variables[infusion].reactions[i]] = equip_skills_return_reaction(party_id, visions_variables[infusion].reactions[i], infusion);
        }
    }
    

    output_party[party_id].skills.reactions = reactions;
}

function equip_skills_update_bonusdmg(party_id) {
    var bonusdmg = structuredClone(default_bonusdmg);

    var user_effects = user_objects.user_party[party_id].effects;
    for (var i = 0; i < user_effects.length; i++) {

        var effect = utils_array_get_by_lookup(data_effects, "id", user_effects[i].id);
        var option = effect.options[user_effects[i].option];

        if (option.bonusdmg) {
            for (var ii = 0; ii < option.bonusdmg.length; ii++) {
                var source_party_id = party_id;
                if (option.bonusdmg[ii].character) {
                    source_party_id = user_effects[i].source_party
                } else if (option.bonusdmg[ii].special) {
                    source_party_id = equip_character_return_party_id_by_special(option.bonusdmg[ii].special);
                }

                bonusdmg[option.bonusdmg[ii].target_vision][option.bonusdmg[ii].target_type] += equip_skills_return_add_damage(source_party_id, option.bonusdmg[ii]);
            }
        }
    }


    output_party[party_id].skills.bonusdmg = bonusdmg;
}

function equip_skills_display_all() {
    equip_skills_display_permanent_all();
    equip_skills_display_active_all();
}

function equip_skills_display_permanent_all() {

    var parent = document.getElementById("skills_container_permanent");
    utils_delete_children(parent, 0);

    var character = data_characters[user_objects.user_party[user_objects.user_active_character].id];

    for (var i = 0; i < character.attacks.length; i++) {
        parent.appendChild(equip_skills_display_permanent_attack(character.attacks[i], output_party[user_objects.user_active_character].skills.attacks[i]));
    }

    for (var i = 0; i < character.passive.length; i++) {
        var active = false;
        if (user_objects.user_party[user_objects.user_active_character].level >= character.passive[i].level) {
            active = true;
        }

        parent.appendChild(equip_skills_display_permanent(character.passive[i], "passive", i, active));
    }

    for (var i = 0; i < character.const.length; i++) {
        var active = false;
        if (user_objects.user_party[user_objects.user_active_character].constel > i) {
            active = true;
        }
        parent.appendChild(equip_skills_display_permanent(character.const[i], "const", i, active));
    }

}

function equip_skills_display_permanent(passive, passive_type, id, active) {
    if (active) {
        var active_class = "enabled"
    } else {
        var active_class = "disabled"
    }

    var obj = utils_create_obj("div", "skills_row_permanent " + active_class);

    var name = utils_capitalize(passive.name);
    if (passive_type == "passive" && passive.level) {
        name += " (" + level_list[passive.level] + ")";
    } else if (passive_type == "const") {
        name += " (C" + (id+1) + ")";
    }

    obj.appendChild(utils_create_obj("p", "skills_name", null, name));

    var desc = utils_create_obj("div", "skills_passive");
    desc.appendChild(utils_create_img("skills_passive_icon", null, "images/icons/character/" + user_objects.user_party[user_objects.user_active_character].id + "/" + passive_type + (id + 1) + ".png"))
    desc.appendChild(utils_create_obj("p", "skills_passive_desc", null, passive.desc))
    obj.appendChild(desc);

    if (passive.attacks) {
        var attacks = utils_create_obj("div", "skills_attack");

        for (var i = 0; i < passive.attacks.length; i++) {
            if (passive.attacks[i].parts) {
                for (var ii = 0; ii < passive.attacks[i].parts.length; ii++) {
                    attacks.appendChild(equip_skills_display_permanent_attack_part(passive.attacks[i].parts[ii], output_party[user_objects.user_active_character].skills[passive_type][id][i][ii], active));
                }
            }            
        }
        obj.appendChild(attacks);
    }

    return obj
}

function equip_skills_display_permanent_attack(attack, output_attack) {
    var obj = utils_create_obj("div", "skills_row_permanent");

    obj.appendChild(equip_skills_display_attack_name(attack.name));
    var att_obj = utils_create_obj("div", "skills_attack");
    if (attack.parts) {
        for (var i = 0; i < attack.parts.length; i++) {
            att_obj.appendChild(equip_skills_display_permanent_attack_part(attack.parts[i], output_attack[i], true));
        }
    }

    obj.appendChild(att_obj);
    return obj;
}

function equip_skills_display_permanent_attack_part(part, output_part, active) {
    var vision = equip_skills_return_part_vision(part, user_objects.user_active_character);

    var obj = utils_create_obj("div", "skills_part " + vision);

    obj.appendChild(equip_skills_display_attack_part_text(part));

    obj.appendChild(utils_create_obj("div", "skills_part_val", null, utils_number_format(equip_skills_return_part_dmg(part, output_part, "ncrt", false, 1))));
    obj.appendChild(utils_create_obj("div", "skills_part_val", null, utils_number_format(equip_skills_return_part_dmg(part, output_part, "crt", false, 1))));
    obj.appendChild(utils_create_obj("div", "skills_part_val", null, utils_number_format(equip_skills_return_part_dmg(part, output_part, "avg", false, 1))));
    
    var active_btn = utils_create_obj("div", "skills_part_btn");
    if (active) {
        active_btn.appendChild(utils_create_img_btn("arrow-right-thin-circle-outline", function () { equip_skills_change_add_active(output_part.id) }, "Activate", null));
    }
    obj.appendChild(active_btn);

    return obj;
}

function equip_skills_display_attack_name(attack_name) {
    var name_row = utils_create_obj("div", "skills_row_name");

    name_row.appendChild(utils_create_obj("div", "skills_part_text", null, utils_capitalize(attack_name)));
    name_row.appendChild(utils_create_obj("div", "skills_part_val", null, "Non-Crit"));
    name_row.appendChild(utils_create_obj("div", "skills_part_val", null, "Crit"));
    name_row.appendChild(utils_create_obj("div", "skills_part_val", null, "Average"));
    name_row.appendChild(utils_create_obj("div", "skills_part_btn"));

    return name_row
}

function equip_skills_display_attack_part_text(part) {
    var text = utils_create_obj("div", "skills_part_text");

    if (part.type) {
        text.appendChild(utils_create_obj("div", "skills_part_text_type svg svg-" + part.type))
    }
    var name_obj = utils_create_obj("div", "skills_part_text_name_obj");
    name_obj.appendChild(utils_create_obj("div", "skills_part_text_name", null, part.name));

    text.appendChild(name_obj);

    return text
}


function equip_skills_display_active_all() {
    var parent = document.getElementById("skills_container_active");
    utils_delete_children(parent, 0);

    var active_skills = user_objects.user_party[user_objects.user_active_character].active_skills;

    var active_skills_objects = {
        "attacks": [],
        "passive": [],
        "const":[]
    };

    for (var i = 0; i < active_skills.length; i++) {
        var active_skill_object = equip_skills_display_active_attack(active_skills[i], i);
        if (active_skill_object.attack_type == "attacks") {
            active_skills_objects.attacks.push(active_skill_object);
        } else if (active_skill_object.attack_type.startsWith("passive")) {
            active_skills_objects.passive.push(active_skill_object);
        } else if (active_skill_object.attack_type.startsWith("const")) {
            active_skills_objects.const.push(active_skill_object);
        }
        
    }

    if (active_skills_objects.attacks.length > 0) {
        equip_skills_display_active_attack_type(parent, active_skills_objects.attacks);
    }
    
    if (active_skills_objects.passive.length > 0) {
        equip_skills_display_active_attack_type(parent, active_skills_objects.passive);
    }

    if (active_skills_objects.const.length > 0) {
        equip_skills_display_active_attack_type(parent, active_skills_objects.const);
    }       
}

function equip_skills_display_active_attack_type(parent, active_skills_objects) {
    

    active_skills_objects = utils_array_sort(active_skills_objects, ["part_index", "attack_index", "attack_type"]);

    var current_type = null;
    var current_attack = null;

    for (var i = 0; i < active_skills_objects.length; i++) {
        if (current_type != active_skills_objects[i].attack_type || current_attack != active_skills_objects[i].attack_index) {
            var obj = utils_create_obj("div", "skills_row_active");
            parent.appendChild(obj);
            obj.appendChild(equip_skills_display_attack_name(active_skills_objects[i].attack_name));
            var attacks_obj = utils_create_obj("div", "skills_attack");
            obj.appendChild(attacks_obj);
            current_type = active_skills_objects[i].attack_type;
            current_attack = active_skills_objects[i].attack_index;
        }

        attacks_obj.appendChild(active_skills_objects[i].obj);
    }
}

function equip_skills_display_active_attack(active_skill, index) {
    var part_objects = equip_skills_return_attack_part_objects(active_skill.attack_type, active_skill.attack_id, active_skill.part_id);

    if (part_objects) {
        var part = part_objects.part;
        var output_part = part_objects.output;

        var vision = equip_skills_return_part_vision(part, user_objects.user_active_character);

        var obj = utils_create_obj("div", "skills_part " + vision);

        obj.appendChild(equip_skills_display_attack_part_text(part));

        obj.appendChild(utils_create_obj("div", "skills_part_val", null, utils_number_format(equip_skills_return_part_dmg(part, output_part, "ncrt", active_skill.reaction, active_skill.count))));
        obj.appendChild(utils_create_obj("div", "skills_part_val", null, utils_number_format(equip_skills_return_part_dmg(part, output_part, "crt", active_skill.reaction, active_skill.count))));
        obj.appendChild(utils_create_obj("div", "skills_part_val", null, utils_number_format(equip_skills_return_part_dmg(part, output_part, "avg", active_skill.reaction, active_skill.count))));
        var del_btn = utils_create_obj("div", "skills_part_btn");
        del_btn.appendChild(utils_create_img_btn("delete-forever", function () { equip_skills_change_delete_active(index) }, "Deactivate", null));
        obj.appendChild(del_btn);


        return {
            "obj": obj,
            "attack_name": part_objects.attack_name,
            "attack_type": part_objects.attack_type,
            "attack_index": part_objects.attack_index,
            "part_index": part_objects.part_index
        };
    } else {
        return null;
    }    
}

function equip_skills_return_attack_part_objects(attack_type, attack_id, part_id) {
    var character = data_characters[user_objects.user_party[user_objects.user_active_character].id];
    var output = output_party[user_objects.user_active_character].skills;

    if (attack_type == "attacks") {        
        var character_attacks = utils_object_get_value(character, attack_type, null);       
    } else {
        var character_attacks = utils_object_get_value(character, attack_type + ".attacks", null);
    }

    var output_attacks = utils_object_get_value(output, attack_type, null);

    if (character_attacks && output_attacks) {
        var attack_index = utils_array_lookup_parameter(character_attacks, "id", attack_id);
        if (attack_index > -1) {
            var part_index = utils_array_lookup_parameter(character_attacks[attack_index].parts, "id", part_id);
            return {
                "part": character_attacks[attack_index].parts[part_index],
                "output": output_attacks[attack_index][part_index],
                "attack_name": character_attacks[attack_index].name,
                "attack_type": attack_type,
                "attack_index": attack_index,
                "part_index": part_index
            };
        } else {
            return null;
        }
    } else {
        return null;
    }
   
}

function equip_skills_return_character_skills(skills, party_id, skill_type) {
    var result_skills = [];

    for (var i = 0; i < skills.length; i++) {
        var skill = skills[i];
        if (skill.attacks) {
            var attack_type = skill_type + "." + i;
            var skill_attacks = equip_skills_return_character_attacks(skill.attacks, party_id, attack_type);
            result_skills.push(skill_attacks);
        } else {
            result_skills.push(null);
        }
    }
    return result_skills;
}
function equip_skills_return_character_attacks(attacks, party_id, attack_type) {
    var result_attacks = [];

    for (var i = 0; i < attacks.length; i++) {
        result_attacks.push(equip_skills_return_damage(party_id, attacks[i], attack_type));
    }
    return result_attacks;
}

function equip_skills_return_damage(party_id, attack, attack_type) {

    var result = [];

    var level = equip_skills_return_skill_level(party_id, attack);
    var enemy_defense = (100 - output_party[party_id].stats.total["enemyred"]) / 100;

    for (var i = 0; i < attack.parts.length; i++) {
        var part = attack.parts[i];

        var basic_damage = equip_skills_return_basic_damage(party_id, part, level);
        var dmg_modifier = equip_skills_return_dmg_modifier(party_id, part);
        var resistance = equip_skills_return_resistance(party_id, part);
        var crit = equip_skills_return_critrate(party_id, part);
        var critdmg = equip_skills_return_critdmg(party_id, part);
        var reactions = equip_skills_return_reactions(party_id, part);
        if (part.damage) {
            var defense = enemy_defense;
        } else {
            var defense = 1;
        }
        var id = { "attack_type": attack_type, "attack_id": attack.id, "part_id": part.id };

        result.push(
            { "basic": basic_damage, "modifier": dmg_modifier, "resistance": resistance, "defense": defense, "crit": crit, "critdmg": critdmg, "id": id, "reactions": reactions }
        );
    }
    return result;
}

function equip_skills_return_basic_damage(party_id, part, level) {

    if (Array.isArray(part.stat)) {
        if (part.multiplication) {
            var result = 1;
            for (var i = 0; i < part.stat.length; i++) {
                result *= output_party[party_id].stats.total[part.stat[i]];
            }
            result *= part.scale[level] / 100
        } else {
            var result = 0;
            for (var i = 0; i < part.stat.length; i++) {
                result += part.scale[i][level] / 100 * output_party[party_id].stats.total[part.stat[i]];
            }
        }
        
    } else {
        var result = part.scale[level] / 100 * output_party[party_id].stats.total[part.stat];
    }

    if (part.alt) {
        var mult_stat = part.type + "alt_mult";
    } else {
        var mult_stat = part.type + "_mult";
    }

    result *= output_party[party_id].stats.total[mult_stat]/100;

    if (part.flat) {
        result += part.flat[level];
    }


    return result;
    
}

function equip_skills_return_add_damage(source_party_id, bonusdmg) {

    var source_value = output_party[source_party_id].stats.total[bonusdmg.source];
    if (bonusdmg.min) {
        source_value = source_value - bonusdmg.min;
        if (source_value < 0) {
            source_value = 0;
        }
    }
    var target_value = source_value * bonusdmg.ratio / 100;
    if (bonusdmg.max) {
        if (target_value > bonusdmg.max) {
            target_value = bonusdmg.max;
        }
    }

    return target_value;
}


function equip_skills_return_dmg_modifier(party_id, part) {
    var damage = part.damage;
    var type = part.type;
    var vision = equip_skills_return_part_vision(part, party_id);

    var result = 100;

    if (vision && damage && type) {
        result += output_party[party_id].stats.total[type + vision] + output_party[party_id].stats.total["all"];
    } else if (vision && damage) {
        result += output_party[party_id].stats.total[vision] + output_party[party_id].stats.total["all"];
    } else if (damage) {
        result += output_party[party_id].stats.total["all"];
    } else if (type) {
        result += output_party[party_id].stats.total[type];

        if (type == "healing") {
            result += output_party[party_id].stats.total["healinginc"];
        }
    }

    if (part.alt) {
        result += output_party[party_id].stats.total[type+"alt"];
    }

    return result / 100;

}

function equip_skills_return_resistance(party_id, part) {

    var result = 100;
    if (part.damage) {
        var vision = equip_skills_return_part_vision(part, party_id);
        var res = output_party[party_id].stats.total["enemy" + vision + "res"]

        if (res < 0) {
            result = 100 - res / 2;
        } else if (res > 75) {
            result = 100 / (4 * res + 100)
        } else {
            result = 100 - res;
        }
    } 

    return result / 100;
}

function equip_skills_return_critrate(party_id, part) {
    var crit = 0
    var vision = equip_skills_return_part_vision(part, party_id);
    if (part.crit) {
        crit += output_party[party_id].stats.total["crit"]/100;
        if (part.type) {
            crit += output_party[party_id].stats.total["crit" + part.type]/100;
        }
        if (part.alt) {
            crit += output_party[party_id].stats.total["crit" + part.type + "alt"] / 100;
        }
        if (vision) {
            crit += output_party[party_id].stats.total["crit" + vision] / 100;
        }

        if (crit < 0) {
            crit = 0;
        } else if (crit > 1) {
            crit = 1;
        }
    } 
    return crit;
}

function equip_skills_return_critdmg(party_id, part) {
    var critdmg = 0
    var vision = equip_skills_return_part_vision(part, party_id);
    if (part.crit) {
        critdmg += output_party[party_id].stats.total["critdmg"] / 100;
        if (part.type) {
            critdmg += output_party[party_id].stats.total["critdmg" + part.type] / 100;
        }
        if (part.alt) {
            critdmg += output_party[party_id].stats.total["critdmg" + part.type + "alt"] / 100;
        }
        if (vision) {
            critdmg += output_party[party_id].stats.total["critdmg" + vision] / 100;
        }
    }
    return critdmg;
}

function equip_skills_return_reactions(party_id, part) {
    var vision = equip_skills_return_part_vision(part, party_id);
    var reactions = {};

    for (var i = 0; i < visions_variables[vision].reactions_mod.length; i++) {
        var reaction_name = visions_variables[vision].reactions_mod[i];
        reactions[reaction_name] = {
            "type": reactions_variables[reaction_name].type,
            "value": output_party[party_id].skills.reactions[vision][reaction_name]
        }
    }

    return reactions;
}

function equip_skills_return_reaction(party_id, reaction_name, vision) {

    var reaction = reactions_variables[reaction_name];

    var reaction_mult = 1 + output_party[party_id].stats.total[reaction_name] / 100;

    if (reaction.type == "elemasterymult") {
        var result = reaction.multiplier[vision] * reaction_mult;
    } else {
        var result = reaction_damage_values[reaction.type][user_objects.user_party[party_id].level] * reaction.multiplier * reaction_mult;
        if (result < 0) {
            result = 0;
        }
    }

    return result;
}

function equip_skills_return_skill_level(party_id, attack) {
    var level = 0;
    if (attack.type) {
        level = output_party[party_id].stats.total["level" + attack.type];
    }
    return level;
}

function equip_skills_return_part_vision(part, party_id) {
    if ((part.type == "normal" || part.type == "charged" || part.type == "plunge") && part.vision == "physical" && output_party[party_id].effects.infusion) {
        return output_party[party_id].effects.infusion;
    } else {
        return part.vision;
    }
}

function equip_skills_return_part_dmg(part, output_part, crit, reaction_name=false, count=1) {

    if (part.crit == false && crit != "avg") {
        return "";
    }

    var result = output_part.basic;

    if (part.damage) {
        result += equip_skills_return_part_bonusdmg(part);
    }

    if (reaction_name) {
        if (output_part.reactions[reaction_name].type == "elemasterymult") {
            result *= output_part.reactions[reaction_name].value;
        } else if (output_part.reactions[reaction_name].type == "elemasterybonus") {
            result += output_part.reactions[reaction_name].value;
        }
    }

    result *= output_part.modifier;
    result *= output_part.resistance;
    result *= output_part.defense;

    if (crit == "crt") {
        result += result * output_part.critdmg;
    } else if (crit == "avg") {
        result += result * output_part.critdmg * output_part.crit;
    }

    if (count > 1) {
        result *= count;
    }
    
    return result.toFixed(1);
    
}

function equip_skills_return_part_bonusdmg(part) {
    var result = 0;

    var vision = equip_skills_return_part_vision(part, user_objects.user_active_character);

    result += output_party[user_objects.user_active_character].skills.bonusdmg.all.all;
    if (vision) {
        result += output_party[user_objects.user_active_character].skills.bonusdmg[vision].all;

        if (part.type) {
            result += output_party[user_objects.user_active_character].skills.bonusdmg[vision][part.type];
        }
    }
    if (part.type) {
        result += output_party[user_objects.user_active_character].skills.bonusdmg.all[part.type];
    }

    return result;

}


