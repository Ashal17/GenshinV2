function equip_skills_load_preferences(preferences_data = null) {
    user_preferences.skills = {};

    user_preferences.skills.show_description = utils_object_get_value(preferences_data, "skills.show_description", true);
}

function equip_skills_change_trigger() {

    equip_effects_update_stats(user_objects.user_active_character);
    equip_stats_update_total_all();
    equip_skills_update_effects_dmg(user_objects.user_active_character);
    equip_skills_update_total_active(user_objects.user_active_character);
    equip_skills_display_active_all();
    equip_storage_display_active();
    equip_storage_save_last();
}

function equip_skills_change_hideshow_desc() {
    if (user_preferences.skills.show_description) {
        user_preferences.skills.show_description = false;
    } else {
        user_preferences.skills.show_description = true;
    }
    utils_preferences_change_trigger();
    equip_skills_display_permanent_all();
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
        {
            "attack_type": attack_ids.attack_type,
            "attack_id": attack_ids.attack_id,
            "part_id": attack_ids.part_id,
            "reaction": false,
            "count": 1,
            "effects": []
        }
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
    var part_objects = equip_skills_return_attack_part_objects_simple(user_objects.user_active_character, active_skill);
    var vision = equip_skills_return_part_vision(part_objects.part, user_objects.user_active_character, index);

    if (active_skill.reaction) {
        var reaction_index = utils_array_lookup_index(data_visions[vision].reactions_mod, active_skill.reaction);
        if (reaction_index == data_visions[vision].reactions_mod.length - 1) {
            active_skill.reaction = false;
        } else {
            active_skill.reaction = data_visions[vision].reactions_mod[reaction_index + 1];
        }
    } else {
        active_skill.reaction = data_visions[vision].reactions_mod[0]
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
            var part_objects = equip_skills_return_attack_part_objects_simple(party_id, active_skill);
            var vision = equip_skills_return_part_vision(part_objects.part, party_id, i);

            if (!data_visions[vision] || !data_visions[vision].reactions_mod.includes(active_skill.reaction)) {
                active_skill.reaction = false;
            }
        }
    }
}

function equip_skills_update_all() {
    for (var i = 0; i < const_party_size; i++) {
        equip_skills_update_bonusdmg(i);
        equip_skills_update_reactions(i);        
        equip_skills_update_character(i);
        equip_skills_update_verify_active(i);
        equip_skills_update_verify_reactions(i);
        equip_skills_update_effects_dmg(i);
        equip_skills_update_total_active(i);
    }
}

function equip_skills_update_details_active(party_id) {
    var active_skills = user_objects.user_party[party_id].active_skills;

    output_party[party_id].skills.active.details = [];
    for (var i = 0; i < active_skills.length; i++) {
        if (active_skills[i].effects && active_skills[i].effects.length > 0) {
            output_party[party_id].skills.active.details.push(structuredClone(default_active_skill_detail));
        } else {
            output_party[party_id].skills.active.details.push(null);
        }        
    }
}

function equip_skills_update_effects_dmg(party_id) {
    var active_skills = user_objects.user_party[party_id].active_skills;

    for (var i = 0; i < active_skills.length; i++) {
        var active_skill = active_skills[i];
        if (active_skill.effects && active_skill.effects.length > 0) {

            var avg = 0;
            var ncrt = 0;
            var crt = 0;
            var detail = null;
            
            if (active_skill.attack_type == "reaction") {
                var reaction_values = equip_skills_return_reaction_value(party_id, active_skill.part_id, active_skill.attack_id, i);
                var reaction_dmg = equip_skills_return_reaction_dmg(active_skill.part_id, reaction_values, active_skill.count);
                avg = reaction_dmg.avg;
                ncrt = reaction_dmg.ncrt;
                crt = reaction_dmg.crt;
                detail = reaction_dmg.detail;
            } else {
                var output_stats = output_party[party_id].skills.active.details[i].stats.total;               
                var part_objects = equip_skills_return_attack_part_objects_simple(party_id, active_skill);
                var attack_type = part_objects.attack_type;
                if (attack_type == "other") {
                    var attack_object = const_skills_other;
                } else {
                    if (attack_type != "attacks") {
                        attack_type += ".attacks";
                    }
                    var attack_object = utils_object_get_value(data_characters[user_objects.user_party[party_id].id], attack_type, null);
                }

                
                                
                var level = equip_skills_return_skill_level(party_id, attack_object[part_objects.attack_index].type, i);
                var vision = equip_skills_return_part_vision(part_objects.part, party_id, i);
                
                var output_part = {};
                if (part_objects.part.damage) {
                    output_part.defense = (100 - output_stats["enemyred"]) / 100;;
                } else {
                    output_part.defense = 1;
                }
                output_part.basic = equip_skills_return_basic_damage(party_id, part_objects.part, level, i);
                output_part.modifier = equip_skills_return_dmg_modifier(party_id, part_objects.part, vision, i);
                output_part.resistance = equip_skills_return_resistance(party_id, part_objects.part, vision, i);
                output_part.crit = equip_skills_return_critrate(party_id, part_objects.part, vision, i);
                output_part.critdmg = equip_skills_return_critdmg(party_id, part_objects.part, vision, i);
                output_part.elevate = equip_skills_return_elevate(party_id, part_objects.part, i);

                
                if (active_skill.reaction) {
                    output_part.reactions = {};
                    output_part.reactions[active_skill.reaction] = {};
                    output_part.reactions[active_skill.reaction].type = data_reactions[active_skill.reaction].type;
                    output_part.reactions[active_skill.reaction].value = equip_skills_return_reaction_value(party_id, active_skill.reaction, vision, i);
                }
                var bonusdmg = equip_skills_return_bonusdmg(party_id, i);
                var result_dmg = equip_skills_return_part_dmg(part_objects.part, output_part, bonusdmg, vision, active_skill.reaction, active_skill.count);

                avg = result_dmg.avg;
                ncrt = result_dmg.ncrt;
                crt = result_dmg.crt;
                detail = result_dmg.detail;
            }

            output_party[party_id].skills.active.details[i].avg = avg;
            output_party[party_id].skills.active.details[i].ncrt = ncrt;
            output_party[party_id].skills.active.details[i].crt = crt;
            output_party[party_id].skills.active.details[i].detail = detail;
        } 
    }
}

function equip_skills_update_total_active(party_id) {
    var active_skills = user_objects.user_party[party_id].active_skills;
    var total_avg = 0;
    var total_ncrt = 0;
    var total_crt = 0;

    for (var i = 0; i < active_skills.length; i++) {
        var active_skill = active_skills[i];
        if (active_skill.effects && active_skill.effects.length > 0) {
            total_avg += output_party[party_id].skills.active.details[i].avg;
            total_ncrt += output_party[party_id].skills.active.details[i].ncrt;
            total_crt += output_party[party_id].skills.active.details[i].crt;
        } else {
            if (active_skill.attack_type != "reaction") {
                var part_objects = equip_skills_return_attack_part_objects(party_id, active_skill, i);
                var vision = equip_skills_return_part_vision(part_objects.part, party_id, null);
                var part_dmg = equip_skills_return_part_dmg(part_objects.part, part_objects.output, output_party[party_id].skills.bonusdmg, vision, active_skill.reaction, active_skill.count);
                total_avg += part_dmg.avg;
                total_ncrt += part_dmg.ncrt;
                total_crt += part_dmg.crt;
            } else {
                var output_reaction = output_party[party_id].skills.reactions[active_skill.attack_id][active_skill.part_id];
                var reaction_dmg = equip_skills_return_reaction_dmg(active_skill.part_id, output_reaction, active_skill.count);
                total_avg += reaction_dmg.avg;
                total_ncrt += reaction_dmg.ncrt;
                total_crt += reaction_dmg.crt;
            }
        }        
    }
    output_party[party_id].skills.active.ncrt = total_ncrt;
    output_party[party_id].skills.active.crt = total_crt;
    output_party[party_id].skills.active.avg = total_avg;

}

function equip_skills_update_character(party_id) {
    
    var current_character = data_characters[user_objects.user_party[party_id].id];

    output_party[party_id].skills.attacks = equip_skills_return_character_attacks(current_character.attacks, party_id, "attacks");
    output_party[party_id].skills.passive = equip_skills_return_character_skills(current_character.passive, party_id, "passive");
    output_party[party_id].skills.const = equip_skills_return_character_skills(current_character.const, party_id, "const");
    output_party[party_id].skills.other = equip_skills_return_character_attacks(const_skills_other, party_id, "other")
}


function equip_skills_update_reactions(party_id) {
    var reactions = {};

    var vision = data_characters[user_objects.user_party[party_id].id].vision;   
    if (vision in data_visions) {
        reactions[vision] = {};
        for (var i = 0; i < data_visions[vision].reactions.length; i++) {
            reactions[vision][data_visions[vision].reactions[i]] = equip_skills_return_reaction_value(party_id, data_visions[vision].reactions[i], vision, null);
        }
    }

    var additional_reactions = data_characters[user_objects.user_party[party_id].id].reactions;
    if (additional_reactions) {
        for (var i = 0; i < additional_reactions.length; i++) {
            reactions[additional_reactions[i]] = {};
            for (var ii = 0; ii < data_visions[additional_reactions[i]].reactions.length; ii++) {
                reactions[additional_reactions[i]][data_visions[additional_reactions[i]].reactions[ii]] = equip_skills_return_reaction_value(party_id, data_visions[additional_reactions[i]].reactions[ii], additional_reactions[i], null);
            }
        }
    }
    
    if (output_party[party_id].effects.infusion && output_party[party_id].effects.infusion != vision) {
        var infusion = output_party[party_id].effects.infusion;
        reactions[infusion] = {};
        for (var i = 0; i < data_visions[infusion].reactions.length; i++) {
            reactions[infusion][data_visions[infusion].reactions[i]] = equip_skills_return_reaction_value(party_id, data_visions[infusion].reactions[i], infusion, null);
        }
    }

    output_party[party_id].skills.reactions = reactions;
}

function equip_skills_update_bonusdmg(party_id) {
    output_party[party_id].skills.bonusdmg = equip_skills_return_bonusdmg(party_id, null);
}

function equip_skills_display_header() {
    var hide_desc = document.getElementById("skills_hide_btn").firstChild;
    if (user_preferences.skills.show_description) {
        hide_desc.className = "img_icon svg svg-eye-off-outline";
    } else {
        hide_desc.className = "img_icon svg svg-eye-outline";
    }
}

function equip_skills_display_all() {
    equip_skills_display_permanent_all();
    equip_skills_display_active_all();
    equip_storage_display_active();
}

function equip_skills_display_permanent_all() {
    equip_skills_display_header();

    var parent = document.getElementById("skills_container_permanent");
    utils_delete_children(parent, 0);

    var character = data_characters[user_objects.user_party[user_objects.user_active_character].id];

    for (var i = 0; i < character.attacks.length; i++) {
        parent.appendChild(equip_skills_display_permanent_attack(character.attacks[i], output_party[user_objects.user_active_character].skills.attacks[i], false));
    }

    for (var vision in output_party[user_objects.user_active_character].skills.reactions) {
        parent.appendChild(equip_skills_display_permanent_reactions(vision));
    }

    for (var i = 0; i < const_skills_other.length; i++) {
        var permanent_attack_obj = equip_skills_display_permanent_attack(const_skills_other[i], output_party[user_objects.user_active_character].skills.other[i], true)
        if (permanent_attack_obj) {
            parent.appendChild(permanent_attack_obj);
        }        
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

    obj.appendChild(equip_skills_display_attack_name("Reactions (" + data_visions[vision].name + ")"));

    var att_obj = utils_create_obj("div", "skills_attack");
    for (var reaction in output_party[user_objects.user_active_character].skills.reactions[vision]) {
        att_obj.appendChild(equip_skills_display_permanent_reaction(vision, reaction));
    }
    obj.appendChild(att_obj);

    return obj;
}

function equip_skills_display_permanent_reaction(vision, reaction) {
    if (data_reactions[reaction].skilltype == "elemasterymult") {
        var reaction_vision = vision;
    } else {
        var reaction_vision = data_reactions[reaction].vision;
    }
    var obj = utils_create_obj("div", "skills_part " + reaction_vision);

    obj.appendChild(equip_skills_display_reaction_text(reaction));

    var output_reaction = output_party[user_objects.user_active_character].skills.reactions[vision][reaction];
    var reaction_dmg_objects = equip_skills_display_reaction_value(reaction, output_reaction, 1, false)
    obj.appendChild(reaction_dmg_objects.ncrt);
    obj.appendChild(reaction_dmg_objects.crt);
    obj.appendChild(reaction_dmg_objects.avg);


    if (reaction_dmg_objects.detail) {
        var dmg_detail = reaction_dmg_objects.detail;
        obj.appendChild(dmg_detail);
        obj.onmouseover = function () { utils_update_frame_position_contain(this, dmg_detail, "bottom", false); };
    }

    var active_btn = utils_create_obj("div", "skills_part_btn skills_part_btn_right");
    if (data_reactions[reaction].skilltype == "elemasteryadd") {
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
        name += " (" + const_level_list[passive.level] + ")";
    } else if (passive_type == "const") {
        name += " (C" + (id + 1) + ")";
    }

    obj.appendChild(utils_create_obj("p", "skills_name", null, name));

    
    if (user_preferences.skills.show_description) {
        var desc = utils_create_obj("div", "skills_passive");
        desc.appendChild(utils_create_img("skills_passive_icon", null, "images/icons/character/" + user_objects.user_party[user_objects.user_active_character].id + "/" + passive_type + (id + 1) + ".png"))
        desc.appendChild(utils_create_obj("p", "skills_passive_desc", null, passive.desc))
        obj.appendChild(desc);
    }
    
    if (passive.attacks) {
        var attacks = utils_create_obj("div", "skills_attack");

        for (var i = 0; i < passive.attacks.length; i++) {
            if (passive.attacks[i].parts) {
                for (var ii = 0; ii < passive.attacks[i].parts.length; ii++) {
                    attacks.appendChild(equip_skills_display_permanent_attack_part(passive.attacks[i].parts[ii], output_party[user_objects.user_active_character].skills[passive_type][id][i][ii], active, false));
                }
            }            
        }
        obj.appendChild(attacks);
    }

    return obj
}

function equip_skills_display_permanent_attack(attack, output_attack, hide_empty=false) {
    var att_part_objects = [];
    if (attack.parts) {
        for (var i = 0; i < attack.parts.length; i++) {
            var att_part_obj = equip_skills_display_permanent_attack_part(attack.parts[i], output_attack[i], true, hide_empty);
            if (att_part_obj) {
                att_part_objects.push(att_part_obj);
            }
            
        }
    }

    if (att_part_objects.length > 0 || !hide_empty) {
        var obj = utils_create_obj("div", "skills_row_permanent");
        obj.appendChild(equip_skills_display_attack_name(attack.name, attack.type));

        var att_obj = utils_create_obj("div", "skills_attack");

        for (var i = 0; i < att_part_objects.length; i++) {
            att_obj.appendChild(att_part_objects[i]);
        }

        obj.appendChild(att_obj);
        return obj;
    } else {
        return null;
    }
}

function equip_skills_display_permanent_attack_part(part, output_part, active, hide_empty=false) {
    
    var part_dmg_objects = equip_skills_display_attack_part_value(part, output_part, false, 1, false);

    if (part_dmg_objects.avg.innerHTML == "0.0" && hide_empty) {
        return null;
    }

    if (part.reaction) {
        var vision = data_reactions[part.reaction].vision;
    } else {
        var vision = equip_skills_return_part_vision(part, user_objects.user_active_character);
    }

    var obj = utils_create_obj("div", "skills_part " + vision);

    obj.appendChild(equip_skills_display_attack_part_text(part));

    obj.appendChild(part_dmg_objects.ncrt);
    obj.appendChild(part_dmg_objects.crt);
    obj.appendChild(part_dmg_objects.avg);

    if (part_dmg_objects.detail) {
        var dmg_detail = part_dmg_objects.detail;
        obj.appendChild(dmg_detail);
        obj.onmouseover = function () { utils_update_frame_position_contain(this, dmg_detail, "bottom", false); };
    }
    
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
    name_obj.appendChild(utils_create_obj("div", "skills_part_text_name", null, data_reactions[reaction].name));

    text.appendChild(name_obj);

    return text
}

function equip_skills_display_part_dmg(output_part) {

    if (output_part.detail) {
        var dmg_detail = utils_create_obj("div", "skills_part_val_detail");
        dmg_detail.appendChild(utils_create_stat("crit", output_part.detail.crit * 100));
        dmg_detail.appendChild(utils_create_stat("critdmg", output_part.detail.critdmg * 100));
    } else {
        dmg_detail = null;
    } 

    return {
        "ncrt": equip_skills_display_dmg(output_part, "ncrt"),
        "crt": equip_skills_display_dmg(output_part, "crt"),
        "avg": equip_skills_display_dmg(output_part, "avg"),
        "detail": dmg_detail
    };
}

function equip_skills_display_dmg(output_part, dmg_type) {
    var dmg_obj = utils_create_obj("div", "skills_part_val", null, utils_number_format(output_part[dmg_type].toFixed(1)));
    return dmg_obj;
}

function equip_skills_display_attack_part_value(part, output_part, reaction, count, effects) {
    if (effects) {
        return equip_skills_display_part_dmg(output_part);
    } else {
        var vision = equip_skills_return_part_vision(part, user_objects.user_active_character, null);
        var part_dmg = equip_skills_return_part_dmg(part, output_part, output_party[user_objects.user_active_character].skills.bonusdmg, vision, reaction, count);
        return equip_skills_display_part_dmg(part_dmg);
    } 
}

function equip_skills_display_reaction_value(reaction, output_reaction, count, effects) {

    if (effects) {
        var reaction_val = output_reaction;
    } else {
        var reaction_val = equip_skills_return_reaction_dmg(reaction, output_reaction, count);
    }

    switch (data_reactions[reaction].skilltype) {

        case "elemasteryadd":
            var part_dmg_objects = equip_skills_display_part_dmg(reaction_val);
            break;
        case "elemasterymult":
            var part_dmg_objects = {
                "ncrt": utils_create_obj("div", "skills_part_val", null, ""),
                "crt": utils_create_obj("div", "skills_part_val", null, ""),
                "avg": utils_create_obj("div", "skills_part_val", null, "&times " + utils_number_format(reaction_val.avg.toFixed(2)))
            };
            break;
        case "elemasterybonus":
            var part_dmg_objects = {
                "ncrt": utils_create_obj("div", "skills_part_val", null, ""),
                "crt": utils_create_obj("div", "skills_part_val", null, ""),
                "avg": utils_create_obj("div", "skills_part_val", null, "+ " + utils_number_format(reaction_val.avg.toFixed(1)))
            };
            break;
        default:
            var part_dmg_objects = {
                "ncrt": utils_create_obj("div", "skills_part_val", null, ""),
                "crt": utils_create_obj("div", "skills_part_val", null, ""),
                "avg": utils_create_obj("div", "skills_part_val", null, utils_number_format(reaction_val.avg.toFixed(1)))
            };
    }
    
    return part_dmg_objects;
}


function equip_skills_display_active_all() {
    var parent = document.getElementById("skills_container_active");
    utils_delete_children(parent, 0);

    var active_skills = user_objects.user_party[user_objects.user_active_character].active_skills;

    var active_skills_objects = {
        "attacks": [],
        "passive": [],
        "const": [],
        "reaction": [],
        "other":[]
    };

    for (var i = 0; i < active_skills.length; i++) {
        if (active_skills[i].attack_type == "reaction") {
            active_skills_objects.reaction.push(equip_skills_display_active_reaction(active_skills[i], i));
        } else {
            var active_skill_object = equip_skills_display_active_attack(active_skills[i], i);
            active_skills_objects[active_skill_object.attack_type.split(".")[0]].push(active_skill_object)
        }                     
    }

    for (let active_attack_type in active_skills_objects) {
        if (active_skills_objects[active_attack_type].length > 0) {
            equip_skills_display_active_attack_type(parent, active_skills_objects[active_attack_type]);
        }
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
    var part_objects = equip_skills_return_attack_part_objects(user_objects.user_active_character, active_skill, index);

    if (part_objects) {
        var part = part_objects.part;

        if (part.reaction) {
            var vision = data_reactions[part.reaction].vision;
        } else {
            var vision = equip_skills_return_part_vision(part, user_objects.user_active_character, index);
        }

        var obj = utils_create_obj("div", "skills_part " + vision);

        var count_container = utils_create_obj("div", "container skills_part_count", "skills_part_count_container_" + index);
        var count_val = utils_create_obj("div", "icon_selects skills_part_count_val", "skills_part_count_val_" + index);
        count_val.onclick = function (event) { utils_create_prompt_input(null, count_val.id, equip_skills_change_count_active, index, active_skill.count, count_container); event.preventDefault(); };
        count_container.appendChild(count_val);
        count_val.appendChild(utils_create_obj("div", "icon_selects_text", "skills_part_count_val_text_" + index, active_skill.count));
        obj.appendChild(count_container);

        var effects_svg = "star-plus";
        if (active_skill.effects && active_skill.effects.length > 0) {
            for (var i = 0; i < active_skill.effects.length; i++) {
                if (active_skill.effects[i].selected && active_skill.effects[i].id != 0) {
                    effects_svg = "star-plus img_icon_active";
                    break;
                }
            }
            
        }

        obj.appendChild(utils_create_img_btn(effects_svg, function () { equip_control_create_active_skill_effects(index, "skills_part_effects_" + index) }, "Change Effects", "skills_part_effects_" + index, "skills_part_btn skills_part_btn_left"));
       
        if (part.damage && vision in data_visions && data_visions[vision].reactions_mod.length > 0) {
            var reaction_svg = "elemastery";
            if (active_skill.reaction) {
                reaction_svg = data_reactions[active_skill.reaction].combination[vision];
            }
            obj.appendChild(utils_create_img_btn(reaction_svg, function () { equip_skills_change_reaction_active(index) }, "Change Reaction", null, "skills_part_btn skills_part_btn_left"));
        }
        

        obj.appendChild(equip_skills_display_attack_part_text(part));

        var part_dmg_objects = equip_skills_display_attack_part_value(part, part_objects.output, active_skill.reaction, active_skill.count, part_objects.effects);

        obj.appendChild(part_dmg_objects.ncrt);
        obj.appendChild(part_dmg_objects.crt);
        obj.appendChild(part_dmg_objects.avg);

        if (part_dmg_objects.detail) {
            var dmg_detail = part_dmg_objects.detail;
            obj.appendChild(dmg_detail);
            obj.onmouseover = function () { utils_update_frame_position_contain(this, dmg_detail, "bottom", false); };
        }

        obj.appendChild(utils_create_img_btn("delete-forever", function () { equip_skills_change_delete_active(index) }, "Deactivate", null, "skills_part_btn skills_part_btn_right"));

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

    var obj = utils_create_obj("div", "skills_part " + data_reactions[active_reaction.part_id].vision);

    var count_container = utils_create_obj("div", "container skills_part_count", "skills_part_count_container_" + index);
    var count_val = utils_create_obj("div", "icon_selects skills_part_count_val", "skills_part_count_val_" + index);
    count_val.onclick = function (event) { utils_create_prompt_input(null, count_val.id, equip_skills_change_count_active, index, active_reaction.count, count_container); event.preventDefault(); };
    count_container.appendChild(count_val);
    count_val.appendChild(utils_create_obj("div", "icon_selects_text", "skills_part_count_val_text_" + index, active_reaction.count));
    obj.appendChild(count_container);

    var effects_svg = "star-plus";
    if (active_reaction.effects && active_reaction.effects.length > 0) {
        for (var i = 0; i < active_reaction.effects.length; i++) {
            if (active_reaction.effects[i].selected && active_reaction.effects[i].id != 0) {
                effects_svg = "star-plus img_icon_active";
                break;
            }
        }
    }
    obj.appendChild(utils_create_img_btn(effects_svg, function () { equip_control_create_active_skill_effects(index, "skills_part_effects_" + index) }, "Change Effects", "skills_part_effects_" + index, "skills_part_btn skills_part_btn_left"));


    obj.appendChild(equip_skills_display_reaction_text(active_reaction.part_id));

    if (active_reaction.effects && active_reaction.effects.length > 0) {
        var output_reaction = equip_skills_return_effects_output_dmg(user_objects.user_active_character, index);
        var reaction_dmg_objects = equip_skills_display_reaction_value(active_reaction.part_id, output_reaction, active_reaction.count, true);
    } else {
        var output_reaction = output_party[user_objects.user_active_character].skills.reactions[active_reaction.attack_id][active_reaction.part_id];
        var reaction_dmg_objects = equip_skills_display_reaction_value(active_reaction.part_id, output_reaction, active_reaction.count, false);
    }   
    obj.appendChild(reaction_dmg_objects.ncrt);
    obj.appendChild(reaction_dmg_objects.crt);
    obj.appendChild(reaction_dmg_objects.avg);

    if (reaction_dmg_objects.detail) {
        var dmg_detail = reaction_dmg_objects.detail;
        obj.appendChild(dmg_detail);
        obj.onmouseover = function () { utils_update_frame_position_contain(this, dmg_detail, "bottom", false); };
    }

    var del_btn = utils_create_obj("div", "skills_part_btn skills_part_btn_right");
    del_btn.appendChild(utils_create_img_btn("delete-forever", function () { equip_skills_change_delete_active(index) }, "Deactivate", null));
    obj.appendChild(del_btn);

    return {
        "obj": obj,
        "attack_name": "Reactions (" + data_visions[active_reaction.attack_id].name + ")",
        "attack_type": active_reaction.attack_type,
        "attack_index": active_reaction.attack_id,
        "part_index": active_reaction.part_id
    };
}

function equip_skills_return_attack_part_objects_simple(party_id, active_skill) {

    var character = data_characters[user_objects.user_party[party_id].id];

    if (active_skill.attack_type == "attacks") {
        var character_attacks = utils_object_get_value(character, active_skill.attack_type, null);
    } else if (active_skill.attack_type == "other") {
        var character_attacks = const_skills_other;
    } else {
        var character_attacks = utils_object_get_value(character, active_skill.attack_type + ".attacks", null);
    }

    if (character_attacks) {
        var attack_index = utils_array_lookup_parameter(character_attacks, "id", active_skill.attack_id);
        if (attack_index > -1) {
            var part_index = utils_array_lookup_parameter(character_attacks[attack_index].parts, "id", active_skill.part_id);
            return {
                "part": character_attacks[attack_index].parts[part_index],
                "attack_name": character_attacks[attack_index].name,
                "attack_type": active_skill.attack_type,
                "attack_index": attack_index,
                "part_index": part_index
            };
        } else {
            utils_log_error("No attack found for id: " + active_skill.attack_id);
            return null;
        }
    } else {
        utils_log_error("No attack found for attack_type: " + active_skill.attack_type + ", attack_id: " + active_skill.attack_id);
        return null;
    }
}

function equip_skills_return_attack_part_objects(party_id, active_skill, index) {

    var part_objects = equip_skills_return_attack_part_objects_simple(party_id, active_skill);

    if (active_skill.effects && active_skill.effects.length > 0) {
        part_objects.effects = true;
        part_objects.output = equip_skills_return_effects_output_dmg(party_id, index);
        return part_objects;
    } else {
        var output = output_party[party_id].skills;
        var output_attacks = utils_object_get_value(output, active_skill.attack_type, null);

        if (output_attacks) {
            part_objects.effects = false;
            part_objects.output = output_attacks[part_objects.attack_index][part_objects.part_index];
            return part_objects;
        } else {
            utils_log_error("No attack found for attack_type: " + active_skill.attack_type + ", attack_id: " + active_skill.attack_id);
            return null;
        }
    }  
}

function equip_skills_return_effects_output_dmg(party_id, index) {
    return {
        "avg": output_party[party_id].skills.active.details[index].avg,
        "ncrt": output_party[party_id].skills.active.details[index].ncrt,
        "crt": output_party[party_id].skills.active.details[index].crt,
        "detail": output_party[party_id].skills.active.details[index].detail,
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

    var level = equip_skills_return_skill_level(party_id, attack.type, null);
    var enemy_defense = (100 - output_party[party_id].stats.total["enemyred"]) / 100;

    for (var i = 0; i < attack.parts.length; i++) {
        var part = attack.parts[i];

        var vision = equip_skills_return_part_vision(part, party_id, null);
        var basic_damage = equip_skills_return_basic_damage(party_id, part, level, null);
        var dmg_modifier = equip_skills_return_dmg_modifier(party_id, part, vision, null);
        var resistance = equip_skills_return_resistance(party_id, part, vision, null);
        var crit = equip_skills_return_critrate(party_id, part, vision, null);
        var critdmg = equip_skills_return_critdmg(party_id, part, vision, null);
        var reactions = equip_skills_return_reactions(party_id, part);  
        var elevate = equip_skills_return_elevate(party_id, part, null);
        
        
        if (part.damage && !part.reaction) {
            var defense = enemy_defense;
        } else {
            var defense = 1;
        }
        var id = { "attack_type": attack_type, "attack_id": attack.id, "part_id": part.id };

        result.push(
            {
                "basic": basic_damage,
                "modifier": dmg_modifier,
                "resistance": resistance,
                "defense": defense,
                "crit": crit,
                "critdmg": critdmg,
                "elevate": elevate,
                "id": id,
                "reactions": reactions
            }
        );
    }
    return result;
}

function equip_skills_return_basic_damage(party_id, part, level, skill_index = null) {

    if (skill_index === null) {
        var output_stats = output_party[party_id].stats.total;
    } else {
        var output_stats = output_party[party_id].skills.active.details[skill_index].stats.total;
    }

    if (Array.isArray(part.stat)) {
        if (part.multiplication) {
            var result = 1;
            for (var i = 0; i < part.stat.length; i++) {
                result *= output_stats[part.stat[i]];
            }
            result *= part.scale[level] / 100
        } else {
            var result = 0;
            for (var i = 0; i < part.stat.length; i++) {
                result += part.scale[i][level] / 100 * output_stats[part.stat[i]];
            }
        }
        
    } else {
        var result = part.scale[level] / 100 * output_stats[part.stat];
    }

    if (part.flat) {
        result += part.flat[level];
    }

    if (part.alt) {
        result *= output_stats["alt" + part.alt + "_mult"] / 100;
    } else if (part.type) {
        result *= output_stats[part.type + "_mult"] / 100;
    }

    return result;
    
}

function equip_skills_return_bonusdmg(party_id, skill_index) {
    var bonusdmg = structuredClone(default_bonusdmg);

    var user_effects = user_objects.user_party[party_id].effects;
    if (skill_index !== null) {
        user_effects = user_effects.concat(user_objects.user_party[party_id].active_skills[skill_index].effects);
    } 
    for (var i = 0; i < user_effects.length; i++) {

        if (user_effects[i].selected) {
            var option = equip_effects_return_selected_option(user_effects[i]);

            if (option.bonusdmg) {
                for (var ii = 0; ii < option.bonusdmg.length; ii++) {
                    var source_party_id = party_id;
                    if (option.bonusdmg[ii].character) {
                        source_party_id = user_effects[i].source_party
                    } else if (option.bonusdmg[ii].special) {
                        source_party_id = equip_character_return_party_id_by_special(option.bonusdmg[ii].special);
                    }
                    if (source_party_id == party_id) {
                        bonusdmg[option.bonusdmg[ii].target_vision][option.bonusdmg[ii].target_type] += equip_skills_return_add_damage(source_party_id, option.bonusdmg[ii], skill_index);
                    } else {
                        bonusdmg[option.bonusdmg[ii].target_vision][option.bonusdmg[ii].target_type] += equip_skills_return_add_damage(source_party_id, option.bonusdmg[ii]);
                    }                                   
                }
            }
        }

    }
    return bonusdmg;
}

function equip_skills_return_add_damage(source_party_id, bonusdmg, skill_index = null) {

    if (skill_index === null) {
        var source_value = output_party[source_party_id].stats.total[bonusdmg.source];
    } else {
        var source_value = output_party[source_party_id].skills.active.details[skill_index].stats.total[bonusdmg.source];
    }

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


function equip_skills_return_dmg_modifier(party_id, part, vision, skill_index = null) {
    var damage = part.damage;
    var type = part.type;

    if (skill_index === null) {
        var output_stats = output_party[party_id].stats.total;
    } else {
        var output_stats = output_party[party_id].skills.active.details[skill_index].stats.total;
    }

    var result = 100;

    if (damage) {
        result += output_stats["all"];

        if (vision && type) {
            result += output_stats[type + vision];
        } else if (vision) {
            result += output_stats[vision];
        }
    } else if (type) {
        result += output_stats[type];

        if (type == "healing") {
            result += output_stats["healinginc"];
        }
    }


    if (part.alt) {
        result += output_stats["alt" + part.alt];
    }

    if (part.reaction) {
        result *= data_reactions[part.reaction].direct_multiplier;
        result *= (1 + output_stats[part.reaction + "_base"] / 100);
    } 

    return result / 100;

}

function equip_skills_return_elevate(party_id, part, skill_index = null) {
    var type = part.type;
    var result = 1;

    if (skill_index === null) {
        var output_stats = output_party[party_id].stats.total;
    } else {
        var output_stats = output_party[party_id].skills.active.details[skill_index].stats.total;
    }

    if (type) {
        result += output_stats[type + "_elevate"] / 100;
    }
    return result;
}

function equip_skills_return_resistance(party_id, part, vision, skill_index = null) {
    if (part.damage) {
        return equip_skills_return_resistance_modifier(party_id, vision, skill_index) / 100;
    } else if (part.reaction) {
        return equip_skills_return_resistance_modifier(party_id, data_reactions[part.reaction].vision, skill_index) / 100;
    } else {
        return 1;
    }
}

function equip_skills_return_resistance_modifier(party_id, vision, skill_index = null) {
    if (skill_index === null) {
        var res = output_party[party_id].stats.total["enemy" + vision + "res"];
    } else {
        var res = output_party[party_id].skills.active.details[skill_index].stats.total["enemy" + vision + "res"];
    }

    if (res < 0) {
        return 100 - res / 2;
    } else if (res > 75) {
        return 100 / (4 * res + 100)
    } else {
        return 100 - res;
    }
}

function equip_skills_return_critrate(party_id, part, vision, skill_index = null) {
    if (part.reaction) {
        vision = data_reactions[part.reaction].vision;
    }
    var crit = 0
    if (skill_index === null) {
        var output_stats = output_party[party_id].stats.total;
    } else {
        var output_stats = output_party[party_id].skills.active.details[skill_index].stats.total;
    }
    if (part.crit) {
        crit += output_stats["crit"]/100;
        if (part.type) {
            crit += output_stats["crit" + part.type] / 100;
        }

        if (part.alt) {
            crit += output_stats["critalt" + part.alt] / 100;
        }
        
        if (vision) {
            crit += output_stats["crit" + vision] / 100;
        }

        if (crit < 0) {
            crit = 0;
        } else if (crit > 1) {
            crit = 1;
        }
    } 
    return crit;
}

function equip_skills_return_critdmg(party_id, part, vision, skill_index = null) {
    if (part.reaction) {
        vision = data_reactions[part.reaction].vision;
    }
    var critdmg = 0
    if (skill_index === null) {
        var output_stats = output_party[party_id].stats.total;
    } else {
        var output_stats = output_party[party_id].skills.active.details[skill_index].stats.total;
    }
    if (part.crit) {
        critdmg += output_stats["critdmg"] / 100;
        if (part.type) {
            critdmg += output_stats["critdmg" + part.type] / 100;
        }

        if (part.alt) {
            critdmg += output_stats["critdmgalt" + part.alt] / 100;
        } 
        
        if (vision) {
            critdmg += output_stats["critdmg" + vision] / 100;
        }
    }
    return critdmg;
}

function equip_skills_return_reactions(party_id, part) {
    var vision = equip_skills_return_part_vision(part, party_id);
    var reactions = {};
    if (vision in data_visions) {
        for (var i = 0; i < data_visions[vision].reactions_mod.length; i++) {
            var reaction_name = data_visions[vision].reactions_mod[i];
            reactions[reaction_name] = {
                "type": data_reactions[reaction_name].type,
                "value": output_party[party_id].skills.reactions[vision][reaction_name]
            }
        }
    }
    
    return reactions;
}

function equip_skills_return_reaction_value(party_id, reaction_name, vision, skill_index = null) {

    var reaction = data_reactions[reaction_name];

    if (skill_index === null) {
        var output_stats = output_party[party_id].stats.total;
        var bonusdmg = output_party[party_id].skills.bonusdmg;
    } else {
        var output_stats = output_party[party_id].skills.active.details[skill_index].stats.total;
        var bonusdmg = equip_skills_return_bonusdmg(party_id, skill_index);
    }

    var reaction_mult = (1 + output_stats[reaction_name] / 100) * (output_stats[reaction_name + "_mult"] / 100) * (1 + output_stats[reaction_name + "_base"] / 100);

    if (reaction.skilltype == "elemasterymult") {
        var result = reaction.multiplier[vision] * reaction_mult;
    } else {
        var result_num = const_reaction_damage_values[reaction.type][user_objects.user_party[party_id].level] * reaction.multiplier * reaction_mult;
        if (result_num < 0) {
            result_num = 0;
        }
        if (reaction.skilltype == "elemasteryadd") {
            if (bonusdmg && bonusdmg.reactions) {
                result_num += bonusdmg.reactions[reaction_name];
            }      
            var crit = output_stats["crit" + reaction_name] / 100;
            var critdmg = output_stats["critdmg" + reaction_name] / 100;
            if (reaction.crit) {
                crit += output_stats["crit"] / 100;
                critdmg += output_stats["critdmg"] / 100;
            }
            if (crit > 100) {
                crit = 100;
            }
            var result = {
                "basic": result_num,
                "resistance": equip_skills_return_resistance_modifier(party_id, data_reactions[reaction_name].vision, skill_index) / 100,
                "crit": crit,
                "critdmg": critdmg,
                "elevate": 1 + output_stats[reaction_name + "_elevate"] / 100,
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

function equip_skills_return_skill_level(party_id, attack_type, skill_index = null) {
    var level = 0;
    if (attack_type) {
        level = user_objects.user_party[party_id]["level" + attack_type];
        if (skill_index === null) {
            level += output_party[party_id].stats.total["level" + attack_type];
        } else {
            level += output_party[party_id].skills.active.details[skill_index].stats.total["level" + attack_type];
        }        
    }
    return level;
}

function equip_skills_return_part_vision(part, party_id, skill_index = null) {
    if (equip_skills_return_infusable(part, party_id)) {
        if (skill_index !== null && output_party[party_id].skills.active.details[skill_index] && output_party[party_id].skills.active.details[skill_index].infusion) {
            return output_party[party_id].skills.active.details[skill_index].infusion;
        } else if (output_party[party_id].effects.infusion) {
            return output_party[party_id].effects.infusion;
        } else {
            return part.vision;
        }        
    } else {
        return part.vision;
    }
}

function equip_skills_return_infusable(part, party_id) {
    var infusable = false;
    if (part.vision == "physical") {
        if (part.type == "normal") {
            infusable = true;
        } else if ((part.type == "charged" || part.type == "plunge") && output_party[party_id].weapon_type != "bow") {
            infusable = true;
        }
    }
    return infusable;
}

function equip_skills_return_part_dmg(part, output_part, bonusdmg, vision, reaction_name = false, count = 1) {

    var result = output_part.basic;

    var result_bonusdmg = equip_skills_return_part_bonusdmg(part, bonusdmg, vision);

    if (part.reaction) {
        result += equip_skills_return_part_bonusdmg_reaction_base(part, bonusdmg);
    } else {
        result += result_bonusdmg;
    }

    if (reaction_name) {
        if (output_part.reactions[reaction_name].type == "elemasterymult") {
            result *= output_part.reactions[reaction_name].value;
        } else if (output_part.reactions[reaction_name].type == "elemasterybonus") {
            result += output_part.reactions[reaction_name].value;
        }
    }

    result *= output_part.modifier;

    if (part.reaction) {
        result += result_bonusdmg;
    }

    result *= output_part.resistance;
    result *= output_part.defense;
    result *= output_part.elevate;

    if (count > 1) {
        result *= count;
    }

    if (part.crit) {
        var result_ncrt = result;
        var result_crt = result * (1 + output_part.critdmg);
        var result_avg = result * (1 + output_part.critdmg * output_part.crit);
    } else {
        var result_ncrt = result;
        var result_crt = result;
        var result_avg = result;
    }
    
    var result_obj = {
        "ncrt": result_ncrt,
        "crt": result_crt,
        "avg": result_avg,
        "detail": {
            "crit": output_part.crit,
            "critdmg": output_part.critdmg
        }
    }
    
    return result_obj;
    
}

function equip_skills_return_part_bonusdmg(part, bonusdmg, vision) {
    var result = 0;
    if (part.damage || part.reaction) {
        result += bonusdmg.all.all;
    }
    if (part.reaction) {
        vision = data_reactions[part.reaction].vision;
        result += bonusdmg.reactions[part.reaction];
        result += bonusdmg.all[part.reaction];
    } else if (part.type) {
        result += bonusdmg.all[part.type];
    }

    if (part.alt) {
        result += bonusdmg.alt["alt" + part.alt];
    } 

    if (vision) {
        result += bonusdmg[vision].all;

        if (part.type && !part.reaction) {
            result += bonusdmg[vision][part.type];
        }        
    }
    
    return result;

}

function equip_skills_return_part_bonusdmg_reaction_base(part, bonusdmg) {
    var result = 0;
    if (part.reaction) {
        result += bonusdmg.reactions[part.reaction + "base"];
        result += bonusdmg.all[part.reaction + "base"];
        if (part.alt) {
            result += bonusdmg.alt["alt" + part.alt +"base"];
        }
    }
    return result;
}

function equip_skills_return_reaction_dmg(reaction, output_reaction, count) {

    if (data_reactions[reaction].skilltype == "elemasteryadd") {
        var result = output_reaction.basic;
        result *= output_reaction.resistance;
        result *= output_reaction.elevate;

        if (count > 1) {
            result *= count;
        }

        var result_ncrt = result;
        var result_crt = result * (1 + output_reaction.critdmg);
        var result_avg = result * (1 + output_reaction.critdmg * output_reaction.crit);
        
    }
    else {
        var result_ncrt = 0;
        var result_crt = 0;
        var result_avg = output_reaction;
    }

    var result_obj = {
        "ncrt": result_ncrt,
        "crt": result_crt,
        "avg": result_avg,
        "detail": {
            "crit": output_reaction.crit,
            "critdmg": output_reaction.critdmg
        }
    }

    return result_obj;
}

function equip_skills_return_party_total_active() {
    var total_ncrt = 0;
    var total_crt = 0;
    var total_avg = 0;

    for (var i = 0; i < const_party_size; i++) {
        total_ncrt += output_party[i].skills.active.ncrt;
        total_crt += output_party[i].skills.active.crt;
        total_avg += output_party[i].skills.active.avg;
    }

    var result_obj = {
        "ncrt": total_ncrt,
        "crt": total_crt,
        "avg": total_avg
    };

    return result_obj;
}

