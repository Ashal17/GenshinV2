const reaction_damage_values = {
    "elemasteryadd": [17.17, 80.58, 80.58, 207.38, 207.38, 323.6, 323.6, 492.88, 492.88, 765.64, 765.64, 1110.0, 1110.0, 1446.85],
    "elemasterybonus": [17.17, 80.58, 80.58, 207.38, 207.38, 323.6, 323.6, 492.88, 492.88, 765.64, 765.64, 1110.0, 1110.0, 1446.85],
    "elemasterycrystalize": [91.18, 303.83, 303.83, 585.00, 585.00, 786.79, 786.79, 1030.08, 1030.08, 1314.75, 1314.75, 1596.81, 1596.81, 1851.06]
}

const bonusdmg_visions = ["all", "anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro", "physical"];
const bonusdmg_types = ["all", "normal", "charged", "plunge", "skill", "burst"];

function equip_skills_change_trigger() {

    equip_skills_update_total_active(user_objects.user_active_character);
    equip_skills_display_active_all();
    equip_storage_save_last();
}

function equip_skills_change_attack_level(attack_type, change) {
    var current_level = user_objects.user_party[user_objects.user_active_character]["level" + attack_type];

    if (0 <= (current_level + change) && (current_level + change) <= 9) {
        user_objects.user_party[user_objects.user_active_character]["level" + attack_type] += change;
    }

    equip_effects_change_trigger();
}

function equip_skills_change_add_active(attack_ids) {

    user_objects.user_party[user_objects.user_active_character].active_skills.push(
        { "attack_type": attack_ids.attack_type, "attack_id": attack_ids.attack_id, "part_id": attack_ids.part_id, "reaction": false, "count": 1 }
    );

    equip_skills_change_trigger();
}

function equip_skills_change_count_active(count, index) {

    count = utils_number_verify(count, 0, 1, 99);
    if (count != null) {
        user_objects.user_party[user_objects.user_active_character].active_skills[index].count = count;
        equip_skills_change_trigger();
    }    
}

function equip_skills_change_reaction_active(index) {

    var active_skill = user_objects.user_party[user_objects.user_active_character].active_skills[index];
    var part_objects = equip_skills_return_attack_part_objects(user_objects.user_active_character, active_skill.attack_type, active_skill.attack_id, active_skill.part_id);
    var vision = equip_skills_return_part_vision(part_objects.part, user_objects.user_active_character);

    if (active_skill.reaction) {
        var reaction_index = utils_array_lookup_index(visions_variables[vision].reactions_mod, active_skill.reaction);
        if (reaction_index == visions_variables[vision].reactions_mod.length - 1) {
            active_skill.reaction = false;
        } else {
            active_skill.reaction = visions_variables[vision].reactions_mod[reaction_index + 1];
        }
    } else {
        active_skill.reaction = visions_variables[vision].reactions_mod[0]
    }

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
        if (active_skills[i].attack_type == "passive" || active_skills[i].attack_type == "const") {
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
        } else if (active_skills[i].attack_type == "reaction") {
            if (!output_party[party_id].skills.reactions.hasOwnProperty(active_skills[i].attack_id)) {
                active_skills.splice(i, 1);
            }
        }
    }
}

function equip_skills_update_verify_reactions(party_id) {
    var active_skills = user_objects.user_party[party_id].active_skills;
    for (var i = 0; i < active_skills.length; i++) {
        var active_skill = active_skills[i];
        if (active_skill.reaction) {
            var part_objects = equip_skills_return_attack_part_objects(active_skill.attack_type, active_skill.attack_id, active_skill.part_id);
            var vision = equip_skills_return_part_vision(part_objects.part, party_id);

            if (!visions_variables[vision].reactions_mod.includes(active_skill.reaction)) {
                active_skill.reaction = false;
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
        equip_skills_update_verify_reactions(i);
        equip_skills_update_total_active(i);
    }
}

function equip_skills_update_total_active(party_id) {
    var active_skills = user_objects.user_party[party_id].active_skills;
    var total = 0;

    for (var i = 0; i < active_skills.length; i++) {
        var active_skill = active_skills[i];
        if (active_skill.attack_type != "reaction") {
            var part_objects = equip_skills_return_attack_part_objects(party_id, active_skill.attack_type, active_skill.attack_id, active_skill.part_id);
            total += equip_skills_return_part_dmg(part_objects.part, part_objects.output, "avg", active_skill.reaction, active_skill.count);
        } else {
            var output_reaction = output_party[party_id].skills.reactions[active_skill.attack_id][active_skill.part_id];
            total += equip_skills_return_reaction_dmg(active_skill.part_id, output_reaction, "avg", active_skill.count)
        }
    }
    output_party[party_id].skills.active = total;
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
        reactions[vision][visions_variables[vision].reactions[i]] = equip_skills_return_reaction_value(party_id, visions_variables[vision].reactions[i], vision);
    }
    if (output_party[party_id].effects.infusion && output_party[party_id].effects.infusion != vision) {
        var infusion = output_party[party_id].effects.infusion;
        reactions[infusion] = {};
        for (var i = 0; i < visions_variables[infusion].reactions.length; i++) {
            reactions[infusion][visions_variables[infusion].reactions[i]] = equip_skills_return_reaction_value(party_id, visions_variables[infusion].reactions[i], infusion);
        }
    }
    

    output_party[party_id].skills.reactions = reactions;
}

function equip_skills_update_bonusdmg(party_id) {
    var bonusdmg = structuredClone(default_bonusdmg);

    var user_effects = user_objects.user_party[party_id].effects;
    for (var i = 0; i < user_effects.length; i++) {

        if (user_effects[i].selected) {
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

    for (var vision in output_party[user_objects.user_active_character].skills.reactions) {
        parent.appendChild(equip_skills_display_permanent_reactions(vision));
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

function equip_skills_display_permanent_reactions(vision) {
    var obj = utils_create_obj("div", "skills_row_permanent");

    obj.appendChild(equip_skills_display_attack_name("Reactions (" + visions_variables[vision].name + ")"));

    var att_obj = utils_create_obj("div", "skills_attack");
    for (var reaction in output_party[user_objects.user_active_character].skills.reactions[vision]) {
        att_obj.appendChild(equip_skills_display_permanent_reaction(vision, reaction));
    }
    obj.appendChild(att_obj);

    return obj;
}

function equip_skills_display_permanent_reaction(vision, reaction) {
    if (reactions_variables[reaction].type == "elemasterymult") {
        var reaction_vision = vision;
    } else {
        var reaction_vision = reactions_variables[reaction].vision;
    }
    var obj = utils_create_obj("div", "skills_part " + reaction_vision);

    obj.appendChild(equip_skills_display_reaction_text(reaction));

    var output_reaction = output_party[user_objects.user_active_character].skills.reactions[vision][reaction];
    obj.appendChild(equip_skills_display_reaction_value(reaction, output_reaction, "ncrt", 1));
    obj.appendChild(equip_skills_display_reaction_value(reaction, output_reaction, "crt", 1));
    obj.appendChild(equip_skills_display_reaction_value(reaction, output_reaction, "avg", 1));

    var active_btn = utils_create_obj("div", "skills_part_btn skills_part_btn_right");
    if (reactions_variables[reaction].type == "elemasteryadd") {
        var output_id = {
            "attack_type": "reaction",
            "attack_id": vision,
            "part_id": reaction
        }
        active_btn.appendChild(utils_create_img_btn("arrow-right-thin-circle-outline", function () { equip_skills_change_add_active(output_id) }, "Activate", null));
    }
    obj.appendChild(active_btn);

    return obj;
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

    obj.appendChild(equip_skills_display_attack_name(attack.name, attack.type));
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

    obj.appendChild(equip_skills_display_attack_part_value(part, output_part, "ncrt", false, 1));
    obj.appendChild(equip_skills_display_attack_part_value(part, output_part, "crt", false, 1));
    obj.appendChild(equip_skills_display_attack_part_value(part, output_part, "avg", false, 1));
    
    var active_btn = utils_create_obj("div", "skills_part_btn skills_part_btn_right");
    if (active) {
        active_btn.appendChild(utils_create_img_btn("arrow-right-thin-circle-outline", function () { equip_skills_change_add_active(output_part.id) }, "Activate", null));
    }
    obj.appendChild(active_btn);

    return obj;
}

function equip_skills_display_attack_name(attack_name, attack_type_level=null) {
    var name_row = utils_create_obj("div", "skills_row_name");

    if (attack_type_level) {
        var base_level = user_objects.user_party[user_objects.user_active_character]["level" + attack_type_level];
        var bonus_level = output_party[user_objects.user_active_character].stats.total["level" + attack_type_level];
        var actual_level = 1 + base_level + bonus_level;

        var minus_level_class = "";
        var plus_level_class = "";
        var level_class = ""
        if (base_level == 0) {
            minus_level_class = " disabled";
        } else if (base_level == 9) {
            plus_level_class = " disabled";
        } 

        if (bonus_level) {
            level_class = " highlight";
        }


        var minus_btn = utils_create_obj("div", "skills_part_btn");
        minus_btn.appendChild(utils_create_img_btn("minus-circle-outline" + minus_level_class, function () { equip_skills_change_attack_level(attack_type_level, -1) }, null, null));
        name_row.appendChild(minus_btn);

        name_row.appendChild(utils_create_obj("div", "skills_part_level" + level_class, null, actual_level));

        var plus_btn = utils_create_obj("div", "skills_part_btn");
        plus_btn.appendChild(utils_create_img_btn("plus-circle-outline" + plus_level_class, function () { equip_skills_change_attack_level(attack_type_level, 1) }, null, null));
        name_row.appendChild(plus_btn);
    }

    name_row.appendChild(utils_create_obj("div", "skills_part_text", null, utils_capitalize(attack_name)));
    name_row.appendChild(utils_create_obj("div", "skills_part_val", null, "Non-Crit"));
    name_row.appendChild(utils_create_obj("div", "skills_part_val", null, "Crit"));
    name_row.appendChild(utils_create_obj("div", "skills_part_val", null, "Average"));
    name_row.appendChild(utils_create_obj("div", "skills_part_btn skills_part_btn_right"));

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

function equip_skills_display_reaction_text(reaction) {
    var text = utils_create_obj("div", "skills_part_text");

    var name_obj = utils_create_obj("div", "skills_part_text_name_obj");
    name_obj.appendChild(utils_create_obj("div", "skills_part_text_name", null, reactions_variables[reaction].name));

    text.appendChild(name_obj);

    return text
}

function equip_skills_display_attack_part_value(part, output_part, crit_type, reaction, count) {
    var part_dmg = equip_skills_return_part_dmg(part, output_part, crit_type, reaction, count);
    if (part_dmg) {
        var part_dmg_text = utils_number_format(part_dmg.toFixed(1));
    } else {
        var part_dmg_text = "";
    }

    return utils_create_obj("div", "skills_part_val", null, part_dmg_text);
}

function equip_skills_display_reaction_value(reaction, output_reaction, crit_type, count) {

    var reaction_val = equip_skills_return_reaction_dmg(reaction, output_reaction, crit_type, count);

    if (reaction_val) {
        if (reactions_variables[reaction].type == "elemasterymult") {
            var reaction_text = "&times " + utils_number_format(reaction_val.toFixed(2));
        } else if (reactions_variables[reaction].type == "elemasterybonus") {
            var reaction_text = "+ " + utils_number_format(reaction_val.toFixed(1));
        } else {
            var reaction_text = utils_number_format(reaction_val.toFixed(1));
        }
    } else {
        var reaction_text = "";
    }
    
    return utils_create_obj("div", "skills_part_val", null, reaction_text);
}


function equip_skills_display_active_all() {
    var parent = document.getElementById("skills_container_active");
    utils_delete_children(parent, 0);

    var active_skills = user_objects.user_party[user_objects.user_active_character].active_skills;

    var active_skills_objects = {
        "attacks": [],
        "passive": [],
        "const": [],
        "reaction":[]
    };

    for (var i = 0; i < active_skills.length; i++) {
        if (active_skills[i].attack_type == "reaction") {
            active_skills_objects.reaction.push(equip_skills_display_active_reaction(active_skills[i], i));
        } else {
            var active_skill_object = equip_skills_display_active_attack(active_skills[i], i);
            if (active_skill_object.attack_type == "attacks") {
                active_skills_objects.attacks.push(active_skill_object);
            } else if (active_skill_object.attack_type.startsWith("passive")) {
                active_skills_objects.passive.push(active_skill_object);
            } else if (active_skill_object.attack_type.startsWith("const")) {
                active_skills_objects.const.push(active_skill_object);
            }
        }      
        
        
    }

    if (active_skills_objects.attacks.length > 0) {
        equip_skills_display_active_attack_type(parent, active_skills_objects.attacks);
    }

    if (active_skills_objects.reaction.length > 0) {
        equip_skills_display_active_attack_type(parent, active_skills_objects.reaction);
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
    var part_objects = equip_skills_return_attack_part_objects(user_objects.user_active_character, active_skill.attack_type, active_skill.attack_id, active_skill.part_id);

    if (part_objects) {
        var part = part_objects.part;
        var output_part = part_objects.output;

        var vision = equip_skills_return_part_vision(part, user_objects.user_active_character);

        var obj = utils_create_obj("div", "skills_part " + vision);

        var count_container = utils_create_obj("div", "container skills_part_count", "skills_part_count_container_" + index);
        var count_val = utils_create_obj("div", "icon_selects skills_part_count_val", "skills_part_count_val_" + index);
        count_val.onclick = function (event) { utils_create_prompt_input(null, count_val.id, equip_skills_change_count_active, index, active_skill.count, count_container); event.preventDefault(); };
        count_container.appendChild(count_val);
        count_val.appendChild(utils_create_obj("div", "icon_selects_text", "skills_part_count_val_text_" + index, active_skill.count));
        obj.appendChild(count_container);
        
        if (part.damage && visions_variables[vision].reactions_mod.length > 0) {
            var reaction_btn = utils_create_obj("div", "skills_part_btn skills_part_btn_left");
            var reaction_svg = "elemastery";
            if (active_skill.reaction) {
                reaction_svg = reactions_variables[active_skill.reaction].combination[vision];
            }
            reaction_btn.appendChild(utils_create_img_btn(reaction_svg, function () { equip_skills_change_reaction_active(index) }, "Change Reaction", null));
            obj.appendChild(reaction_btn);
        }
        

        obj.appendChild(equip_skills_display_attack_part_text(part));
        obj.appendChild(equip_skills_display_attack_part_value(part, output_part, "ncrt", active_skill.reaction, active_skill.count));
        obj.appendChild(equip_skills_display_attack_part_value(part, output_part, "crt", active_skill.reaction, active_skill.count));
        obj.appendChild(equip_skills_display_attack_part_value(part, output_part, "avg", active_skill.reaction, active_skill.count));

        var del_btn = utils_create_obj("div", "skills_part_btn skills_part_btn_right");
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

function equip_skills_display_active_reaction(active_reaction, index) {

    var obj = utils_create_obj("div", "skills_part " + reactions_variables[active_reaction.part_id].vision);

    var count_container = utils_create_obj("div", "container skills_part_count", "skills_part_count_container_" + index);
    var count_val = utils_create_obj("div", "icon_selects skills_part_count_val", "skills_part_count_val_" + index);
    count_val.onclick = function (event) { utils_create_prompt_input(null, count_val.id, equip_skills_change_count_active, index, active_reaction.count, count_container); event.preventDefault(); };
    count_container.appendChild(count_val);
    count_val.appendChild(utils_create_obj("div", "icon_selects_text", "skills_part_count_val_text_" + index, active_reaction.count));
    obj.appendChild(count_container);

    obj.appendChild(equip_skills_display_reaction_text(active_reaction.part_id));

    var output_reaction = output_party[user_objects.user_active_character].skills.reactions[active_reaction.attack_id][active_reaction.part_id];
    obj.appendChild(equip_skills_display_reaction_value(active_reaction.part_id, output_reaction, "ncrt", active_reaction.count));
    obj.appendChild(equip_skills_display_reaction_value(active_reaction.part_id, output_reaction, "crt", active_reaction.count));
    obj.appendChild(equip_skills_display_reaction_value(active_reaction.part_id, output_reaction, "avg", active_reaction.count));

    var del_btn = utils_create_obj("div", "skills_part_btn skills_part_btn_right");
    del_btn.appendChild(utils_create_img_btn("delete-forever", function () { equip_skills_change_delete_active(index) }, "Deactivate", null));
    obj.appendChild(del_btn);

    return {
        "obj": obj,
        "attack_name": "Reactions (" + visions_variables[active_reaction.attack_id].name + ")",
        "attack_type": active_reaction.attack_type,
        "attack_index": active_reaction.attack_id,
        "part_index": active_reaction.part_id
    };
}

function equip_skills_return_attack_part_objects(party_id, attack_type, attack_id, part_id) {
    var character = data_characters[user_objects.user_party[party_id].id];
    var output = output_party[party_id].skills;

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
            utils_log_error("No attack found for id: " + attack_id);
            return null;
        }
    } else {
        utils_log_error("No attack found for attack_type: " + attack_type + ", attack_id: " + attack_id);
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

    var level = equip_skills_return_skill_level(party_id, attack.type);
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

    if (part.type) {
        if (part.alt) {
            var mult_stat = part.type + "alt_mult";
        } else {
            var mult_stat = part.type + "_mult";
        }

        result *= output_party[party_id].stats.total[mult_stat] / 100;
    }
    

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
    if (part.damage) {
        var vision = equip_skills_return_part_vision(part, party_id);
        return equip_skills_return_resistance_modifier(party_id, vision) / 100;
    } else {
        return 1;
    }
}

function equip_skills_return_resistance_modifier(party_id, vision) {
    var res = output_party[party_id].stats.total["enemy" + vision + "res"]

    if (res < 0) {
        return 100 - res / 2;
    } else if (res > 75) {
        return 100 / (4 * res + 100)
    } else {
        return 100 - res;
    }
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

function equip_skills_return_reaction_value(party_id, reaction_name, vision) {

    var reaction = reactions_variables[reaction_name];

    var reaction_mult = 1 + output_party[party_id].stats.total[reaction_name] / 100;

    if (reaction.type == "elemasterymult") {
        var result = reaction.multiplier[vision] * reaction_mult;
    } else {
        var result_num = reaction_damage_values[reaction.type][user_objects.user_party[party_id].level] * reaction.multiplier * reaction_mult;
        if (result_num < 0) {
            result_num = 0;
        }
        if (reaction.type == "elemasteryadd") {
            var result = {
                "basic": result_num,
                "resistance": equip_skills_return_resistance_modifier(party_id, reactions_variables[reaction_name].vision) / 100,
                "crit": output_party[party_id].stats.total["crit" + reaction_name] / 100,
                "critdmg": output_party[party_id].stats.total["critdmg" + reaction_name] / 100,
                "id": {
                    "attack_type":"reaction", "vision":vision, "reaction":reaction_name
                }
            }

        } else {
            var result = result_num;
        }
    }

    return result;
}

function equip_skills_return_skill_level(party_id, attack_type) {
    var level = 0;
    if (attack_type) {
        level = user_objects.user_party[party_id]["level" + attack_type] + output_party[party_id].stats.total["level" + attack_type];
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

function equip_skills_return_part_dmg(part, output_part, crit, reaction_name = false, count = 1) {

    if (part.crit == false && crit != "avg") {
        return 0;
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
    
    return result;
    
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

function equip_skills_return_reaction_dmg(reaction, output_reaction, crit_type, count) {
    if (reactions_variables[reaction].type == "elemasteryadd" || crit_type == "avg") {
        if (reactions_variables[reaction].type == "elemasteryadd") {
            var result = output_reaction.basic;
            result *= output_reaction.resistance;

            if (crit_type == "crt") {
                result += result * output_reaction.critdmg;
            } else if (crit_type == "avg") {
                result += result * output_reaction.critdmg * output_reaction.crit;
            }

            if (count > 1) {
                result *= count;
            }
        }
        else {
            var result = output_reaction;
        }
    } else {
        var result = 0;
    }
    return result;
}
