function equip_effects_change_trigger() {

    equip_effects_update_stats_all();

    equip_stats_update_total_all();
    equip_effects_update_options_all();
    equip_effects_update_stats_all();
    equip_stats_update_total_all();
    equip_skills_update_all();

    equip_effects_display_all();
    equip_skills_display_all();
    equip_stats_display();
    equip_storage_save_last();
}

function equip_effects_change_skill_trigger(skill_index) {
    equip_effects_display_all(skill_index);
}

function equip_effects_change_new_manual(skill_index) {
    if (skill_index === null) {
        user_objects.user_party[user_objects.user_active_character].effects.push(
            { "id": 0, "option": 0, "selected": true, "manual": true, "skill_index": skill_index }
        );
    } else {
        user_objects.user_party[user_objects.user_active_character].active_skills[skill_index].effects.push(
            { "id": 0, "option": 0, "selected": true, "manual": true, "skill_index": skill_index }
        );
        equip_effects_change_skill_trigger(skill_index);
    }
    
    equip_effects_change_trigger();
}

function equip_effects_change_delete_manual(delete_index, skill_index) {
    if (skill_index === null) {
        var user_effects = user_objects.user_party[user_objects.user_active_character].effects;
    } else {
        var user_effects = user_objects.user_party[user_objects.user_active_character].active_skills[skill_index].effects;
    }

    var index = 0;
    for (var i = 0; i < user_effects.length; i++) {
        if (user_effects[i].manual) {
            if (index == delete_index) {
                user_effects.splice(i, 1);
                break;
            } else {
                index += 1;
            }
        }
    }
    if (skill_index !== null) {
        equip_effects_change_skill_trigger(skill_index);
    }

    equip_effects_change_trigger();
}

function equip_effects_change_manual(selected_id, manual_index) {

    var skill_index = null;
    if (typeof manual_index === "string") {
        var manual_index_split = manual_index.split("_");
        manual_index = parseInt(manual_index_split[1]);
        skill_index = parseInt(manual_index_split[0])
        var user_effects = user_objects.user_party[user_objects.user_active_character].active_skills[skill_index].effects;
    } else { 
        var user_effects = user_objects.user_party[user_objects.user_active_character].effects;
    }

    var index = 0;
    for (var i = 0; i < user_effects.length; i++) {
        if (user_effects[i].manual) {
            if (index == manual_index) {
                user_effects[i].id = selected_id;
                user_effects[i].option = 0;
                break;
            } else {
                index += 1;
            }
        }
    }
    if (skill_index !== null) {
        equip_effects_change_skill_trigger(skill_index);
    }

    equip_effects_change_trigger();
}

function equip_effects_change_manual_option(option, manual_index) {

    var skill_index = null;
    if (typeof manual_index === "string") {
        var manual_index_split = manual_index.split("_");
        manual_index = parseInt(manual_index_split[1]);
        skill_index = parseInt(manual_index_split[0])
        var user_effects = user_objects.user_party[user_objects.user_active_character].active_skills[skill_index].effects;
    } else {
        var user_effects = user_objects.user_party[user_objects.user_active_character].effects;
    }

    var index = 0;
    for (var i = 0; i < user_effects.length; i++) {
        if (user_effects[i].manual) {
            if (index == manual_index) {
                user_effects[i].option = option;
                break;
            } else {
                index += 1;
            }
        }
    }
    if (skill_index !== null) {
        equip_effects_change_skill_trigger(skill_index);
    }

    equip_effects_change_trigger();
}

function equip_effects_change_option(option, possible_eff) {
    var effect_id = possible_eff.id;
    var source_party = possible_eff.source_party;
    var skill_index = possible_eff.skill_index;

    if (skill_index === null) {
        var user_effects = user_objects.user_party[user_objects.user_active_character].effects;
    } else {
        var user_effects = user_objects.user_party[user_objects.user_active_character].active_skills[skill_index].effects;
    }

    var index = -1
    for (var i = 0; i < user_effects.length; i++) {
        if (user_effects[i].id == effect_id && user_effects[i].source_party == source_party) {
            index = i;
            break;
        }
    }

    if (index >= 0) {
        user_effects[index].option = option;        
    } else {
        user_effects.push(
            { "id": effect_id, "option": option, "selected": false, "manual": false, "source_party": source_party, "skill_index": skill_index, "auto": false }
        );        
    }
    if (skill_index !== null) {
        equip_effects_change_skill_trigger(skill_index);
    }
    equip_effects_change_trigger();
}

function equip_effects_change_input(input, possible_eff) {
    var effect_id = possible_eff.id;
    var source_party = possible_eff.source_party;
    var skill_index = possible_eff.skill_index;

    var effect = utils_array_get_by_lookup(data_effects, "id", effect_id);
    var option = utils_number_verify(input, effect.input.decimal, effect.input.min, effect.input.max);
    if (option !== null) {
        if (skill_index === null) {
            var user_effects = user_objects.user_party[user_objects.user_active_character].effects;
        } else {
            var user_effects = user_objects.user_party[user_objects.user_active_character].active_skills[skill_index].effects;
        }

        var index = -1
        for (var i = 0; i < user_effects.length; i++) {
            if (user_effects[i].id == effect_id && user_effects[i].source_party == source_party) {
                index = i;
                break;
            }
        }


        if (index >= 0) {
            user_effects[index].option = option;
        } else {
            user_effects.push(
                { "id": effect_id, "option": option, "selected": false, "manual": false, "source_party": source_party, "skill_index": skill_index, "auto": false }
            );
        }
        if (skill_index !== null) {
            equip_effects_change_skill_trigger(skill_index);
        }
        equip_effects_change_trigger();
    }
    
}

function equip_effects_change_selected(possible_eff, skill_index) {

    if (skill_index === null) {
        var user_effects = user_objects.user_party[user_objects.user_active_character].effects;
    } else {
        var user_effects = user_objects.user_party[user_objects.user_active_character].active_skills[skill_index].effects;
    }

    var effect_id = possible_eff.id;
    var source_party = possible_eff.source_party;

    var index = -1
    for (var i = 0; i < user_effects.length; i++) {
        if (possible_eff.multi) {
            if (user_effects[i].id == effect_id && user_effects[i].source_party == source_party) {
                index = i;
                break;
            }
        } else {
            if (user_effects[i].id == effect_id && user_effects[i].source_party == source_party) {
                index = i;
                if (user_effects[i].selected) {
                    break;
                }
                
            }
            if (user_effects[i].id >= possible_eff.base_id && user_effects[i].id <= possible_eff.max_id && user_effects[i].selected) {
                user_effects[i].selected = false;                
                break;
            }
        }
        
    }
    
    if (index >= 0) {
        user_effects[index].selected = !user_effects[index].selected;      
    } else {
        user_effects.push(
            { "id": effect_id, "option": possible_eff.option, "selected": true, "manual": false, "source_party": source_party, "skill_index": skill_index, "auto": false }
        );
    }
    if (skill_index !== null) {
        equip_effects_change_skill_trigger(skill_index);
    }
    equip_effects_change_trigger();
}

function equip_effects_update_stats_all() {
    for (var i = 0; i < const_party_size; i++) {
        equip_effects_update_stats(i);
    }
}

function equip_effects_update_stats(party_id) {
    equip_skills_update_details_active(party_id);

    var global_stats = [];
    global_stats = equip_effects_return_stats(global_stats, user_objects.user_party[party_id].effects);

    output_party[party_id].stats.initial.effects = structuredClone(global_stats);

    for (var i = 0; i < user_objects.user_party[party_id].active_skills.length; i++) {
        var skill_effects = user_objects.user_party[party_id].active_skills[i].effects;
        if (skill_effects && skill_effects.length > 0) {
            var skill_stats = equip_effects_return_stats(global_stats, skill_effects);
            output_party[party_id].skills.active.details[i].stats.initial.effects = structuredClone(skill_stats);
        }
    }
    equip_effects_update_infusion(party_id);
}

function equip_effects_update_stats_optimize(party_id, output_stats, global_stats) {
    for (var i = 0; i < output_party[party_id].artifacts.optimize_stats.length; i++) {
        var optimize_char = output_party[party_id].artifacts.optimize_stats[i];
        for (var ii = 0; ii < optimize_char.length; ii++) {
            if (output_stats.optimize[i].hasOwnProperty(optimize_char[ii])) {
                output_stats.optimize[i][optimize_char[ii]].effects = global_stats;
            }
            
        }
    }
}

function equip_effects_return_stats(stats, user_effects) {
    var result_stats = structuredClone(stats);
    for (var i = 0; i < user_effects.length; i++) {
        if (user_effects[i].selected) {
            var option = equip_effects_return_selected_option(user_effects[i]);
            if (option.stats) {
                for (var ii = 0; ii < option.stats.length; ii++) {
                    if (option.stats[ii].multiplier) {
                        var value = option.value * option.stats[ii].multiplier;
                        if (option.stats[ii].add) {
                            value += option.stats[ii].add;
                        }
                    } else {
                        var value = option.stats[ii].value;                        
                    } 
                    result_stats.push(
                        { "id": option.stats[ii].stat, "value": value }
                    );
                }
            }
        }
    }
    return result_stats;
}

function equip_effects_return_selected_option(user_effect) {
    var effect = utils_array_get_by_lookup(data_effects, "id", user_effect.id);
    if (effect.input) {
        var option = structuredClone(effect.input);
        option.value = user_effect.option;
    } else {
        var option = utils_array_get_by_lookup(effect.options, "id", user_effect.option);
    }
    return option;
}

function equip_effects_return_optimize_stats(party_id) {
    var optimize_stats = [];

    optimize_stats = optimize_stats.concat(equip_effects_return_optimize_stats_single(party_id, user_objects.user_party[party_id].effects, null))

    for (var i = 0; i < user_objects.user_party[party_id].active_skills.length; i++) {
        var skill_effects = user_objects.user_party[party_id].active_skills[i].effects;
        if (skill_effects && skill_effects.length > 0) {
            optimize_stats = optimize_stats.concat(equip_effects_return_optimize_stats_single(party_id, skill_effects, i))
        }
    }

    return optimize_stats;
}

function equip_effects_return_optimize_stats_single(party_id, user_effects, skill_index = null) {
    var optimize_stats = [];

    for (var i = 0; i < user_effects.length; i++) {
        if (user_effects[i].selected) {
            var option = equip_effects_return_selected_option(user_effects[i]);
            var source_party_id = user_effects[i].source_party;
            if (option.transform) {
                for (var ii = 0; ii < option.transform.length; ii++) {
                    if (option.transform[ii].character) {
                        var source_party_id = user_effects[i].source_party;
                    } else if (option.transform[ii].special) {
                        var source_party_id = equip_character_return_party_id_by_special(option.transform[ii].special, party_id, skill_index, null, null);
                    } else {
                        var source_party_id = party_id;
                    }
                    optimize_stats.push({ "party_id": source_party_id, "stat": option.transform[ii].source })
                }
            }
            if (option.bonusdmg) {
                for (var ii = 0; ii < option.bonusdmg.length; ii++) {
                    if (option.bonusdmg[ii].character) {
                        var source_party_id = user_effects[i].source_party;
                    } else {
                        var source_party_id = party_id;
                    }
                    optimize_stats.push({ "party_id": source_party_id, "stat": option.bonusdmg[ii].source })
                }
            }
        }
    }
    return optimize_stats;
}


function equip_effects_update_stats_transform_other_all() {
    for (var i = 0; i < const_party_size; i++) {
        equip_effects_update_stats_transform_other(i, null, null, null);
        equip_effects_update_stats_transform_other_optimize(i, null)

        for (var ii = 0; ii < user_objects.user_party[i].active_skills.length; ii++) {
            var skill_effects = user_objects.user_party[i].active_skills[ii].effects;
            if (skill_effects && skill_effects.length > 0) {
                equip_effects_update_stats_transform_other(i, ii, null, null);
                equip_effects_update_stats_transform_other_optimize(i, ii);
            }
        }
    }
}

function equip_effects_update_stats_transform_other_optimize(party_id, skill_index) {
    for (var i = 0; i < output_party[party_id].artifacts.optimize_stats.length; i++) {
        var optimize_char = output_party[party_id].artifacts.optimize_stats[i];
        for (var ii = 0; ii < optimize_char.length; ii++) {
            equip_effects_update_stats_transform_other(party_id, skill_index, optimize_char[ii], i);
        }
    }
}

function equip_effects_update_stats_transform_other(party_id, skill_index = null, artifact_stat = null, artifact_stat_party = null) {
    var stats = [];

    var user_effects = user_objects.user_party[party_id].effects;
    if (skill_index !== null) {
        user_effects = user_effects.concat(user_objects.user_party[party_id].active_skills[skill_index].effects);
    } 
   
    for (var i = 0; i < user_effects.length; i++) {
        if (user_effects[i].selected) {
            var option = equip_effects_return_selected_option(user_effects[i]);
            if (option.transform) {
                for (var ii = 0; ii < option.transform.length; ii++) {
                    var party_effect = false;
                    var source_party_id = user_effects[i].source_party;
                    var source_skill_index = null;
                    var source_artifact_stat = null;
                    if (option.transform[ii].character) {
                        party_effect = true;                        
                    } else if (option.transform[ii].special) {
                        party_effect = true;
                        source_party_id = equip_character_return_party_id_by_special(option.transform[ii].special, party_id, skill_index, null, null);                        
                    }   
                    if (party_effect) {
                        if (source_party_id == party_id) {
                            source_skill_index = skill_index;
                        }
                        if (source_party_id == artifact_stat_party) {
                            source_artifact_stat = artifact_stat;
                        }
                        stats.push(equip_effects_return_stats_transformed(source_party_id, option.transform[ii], option.value, source_skill_index, source_artifact_stat, artifact_stat_party));
                    }
                    
                }
            }
        }       
    }

    if (skill_index === null) {
        var stats_obj = output_party[party_id].stats;
    } else {
        var stats_obj = output_party[party_id].skills.active.details[skill_index].stats;
    }    

    if (artifact_stat === null) {
        stats_obj.initial.effects_transform_other = stats;
    } else {
        stats_obj.optimize[artifact_stat_party][artifact_stat].effects_transform_other = stats;
    }
}

function equip_effects_update_stats_transform_personal_all() {
    for (var i = 0; i < const_party_size; i++) {
        equip_effects_update_stats_transform_personal(i, null, null, null);
        equip_effects_update_stats_transform_personal_optimize(i, null);

        for (var ii = 0; ii < user_objects.user_party[i].active_skills.length; ii++) {
            var skill_effects = user_objects.user_party[i].active_skills[ii].effects;
            if (skill_effects && skill_effects.length > 0) {
                equip_effects_update_stats_transform_personal(i, ii);
                equip_effects_update_stats_transform_personal_optimize(i, ii);
            }
        }
    }
}

function equip_effects_update_stats_transform_personal_optimize(party_id, skill_index) {
    for (var i = 0; i < output_party[party_id].artifacts.optimize_stats.length; i++) {
        var optimize_char = output_party[party_id].artifacts.optimize_stats[i];
        for (var ii = 0; ii < optimize_char.length; ii++) {
            equip_effects_update_stats_transform_personal(party_id, skill_index, optimize_char[ii], i);
        }
    }
}

function equip_effects_update_stats_transform_personal(party_id, skill_index = null, artifact_stat = null, artifact_stat_party = null) {
    var stats = [];

    var user_effects = user_objects.user_party[party_id].effects;
    if (skill_index !== null) {
        user_effects = user_effects.concat(user_objects.user_party[party_id].active_skills[skill_index].effects);
    } 

    for (var i = 0; i < user_effects.length; i++) {
        if (user_effects[i].selected) {
            var option = equip_effects_return_selected_option(user_effects[i]);

            if (option.transform) {
                for (var ii = 0; ii < option.transform.length; ii++) {
                    if (!option.transform[ii].character && !option.transform[ii].special) {
                        stats.push(equip_effects_return_stats_transformed(party_id, option.transform[ii], option.value, skill_index, artifact_stat, artifact_stat_party));
                    }
                }
            }
        }
    }

    if (skill_index === null) {
        var stats_obj = output_party[party_id].stats;
    } else {
        var stats_obj = output_party[party_id].skills.active.details[skill_index].stats;
    }

    if (artifact_stat === null) {
        stats_obj.initial.effects_transform_personal = stats;
    } else {
        stats_obj.optimize[artifact_stat_party][artifact_stat].effects_transform_personal = stats;
    }
}

function equip_effects_update_infusion(party_id) {
    output_party[party_id].effects.infusion = equip_effects_return_infusion(party_id, null);

    for (var i = 0; i < user_objects.user_party[party_id].active_skills.length; i++) {
        var skill_effects = user_objects.user_party[party_id].active_skills[i].effects;
        if (skill_effects && skill_effects.length > 0) {
            output_party[party_id].skills.active.details[i].infusion = equip_effects_return_infusion(party_id, i);
        }
    }
}


function equip_effects_update_options_all() {
    for (var i = 0; i < const_party_size; i++) {
        equip_effects_update_options(i);
    }
}

function equip_effects_update_options(party_id) {

    var effect_list = [];
    equip_effects_update_character_options(effect_list, party_id, party_id, false);   
    output_party[party_id].effects.character = effect_list;

    var party_effect_list = [];

    for (var i = 0; i < output_resonances.length; i++) {
        if (output_resonances[i].active) {
            var resonance = data_resonance[i];
            if (!resonance.personal) {
                for (var ii = 0; ii < resonance.bonus.length; ii++) {
                    if (resonance.bonus[ii].apply) {
                        equip_effects_update_single_option(party_effect_list, resonance.bonus[ii].apply, false, 0, { "type": "svg", "id": resonance.icon, "name": resonance.name }, party_id)
                    }
                }
            } 
        }
               
    }

    for (var i = 0; i < const_party_size; i++) {       
        if (i != party_id) {
            equip_effects_update_character_options(party_effect_list, i, party_id, true);           
        }
    }
    output_party[party_id].effects.party = party_effect_list;

   
    equip_effects_update_active_options(party_id);
}

function equip_effects_update_character_options(effect_list, source_party, party_id, party) {
    var current_character = data_characters[user_objects.user_party[source_party].id];

    for (var i = 0; i < output_resonances.length; i++) {
        if (output_resonances[i].active) {
            var resonance = data_resonance[i];
            if (resonance.personal) {
                for (var ii = 0; ii < resonance.bonus.length; ii++) {
                    if (resonance.bonus[ii].apply) {
                        equip_effects_update_single_option(effect_list, resonance.bonus[ii].apply, party, 0, { "type": "svg", "id": resonance.icon, "name": current_character.name }, source_party, party_id)
                    }
                }
            }
        }        
    }

    for (var i = 0; i < current_character.attacks.length; i++) {
        if (current_character.attacks[i].apply) {
            var level = equip_skills_return_skill_level(source_party, current_character.attacks[i].type);
            equip_effects_update_single_option(effect_list, current_character.attacks[i].apply, party, level, { "type": "character", "id": user_objects.user_party[source_party].id, "name": current_character.name }, source_party, party_id)
        }
    }

    for (var i = 0; i < current_character.passive.length; i++) {
        if (user_objects.user_party[source_party].level >= current_character.passive[i].level && current_character.passive[i].apply) {
            var level = equip_skills_return_skill_level(source_party, current_character.passive[i].type);
            equip_effects_update_single_option(effect_list, current_character.passive[i].apply, party, level, { "type": "character", "id": user_objects.user_party[source_party].id, "name": current_character.name }, source_party, party_id)
        }
    }

    for (var i = 0; i < current_character.const.length; i++) {
        if (user_objects.user_party[source_party].constel > i && current_character.const[i].apply) {
            var level = equip_skills_return_skill_level(source_party, current_character.const[i].type);
            equip_effects_update_single_option(effect_list, current_character.const[i].apply, party, level, { "type": "character", "id": user_objects.user_party[source_party].id, "name": current_character.name }, source_party, party_id)
        }
    }

    var current_weapon = utils_array_get_by_lookup(data_weapons[output_party[source_party].weapon_type], "id", user_objects.user_party[source_party].weapon.id);

    if (current_weapon.apply_effect) {
        equip_effects_update_single_option(effect_list, current_weapon.apply_effect, party, user_objects.user_party[source_party].weapon.refine, { "type": "weapon", "id": current_weapon.id, "name": current_weapon.name }, source_party, party_id)
    }

    for (const [key, value] of Object.entries(output_party[source_party].artifacts.sets)) {
        var artifact_set = utils_array_get_by_lookup(data_artifact_sets, "id", key);
        for (var i = 0; i < artifact_set.set_bonus.length; i++) {
            if (value >= artifact_set.set_bonus[i].req && artifact_set.set_bonus[i].apply) {
                equip_effects_update_single_option(effect_list, artifact_set.set_bonus[i].apply, party, 0, { "type": "artifact_set", "id": artifact_set.id, "name": artifact_set.name }, source_party, party_id)
            }
        }
    }
}

function equip_effects_update_single_option(effect_list, apply, party = false, offset = 0, source, source_party, party_id) {
    if (Array.isArray(apply)) {
        for (var i = 0; i < apply.length; i++) {
            equip_effects_update_single_option(effect_list, apply[i], party, offset, source, source_party, party_id);
        }
    } else {
        if ((!party && !apply.noself) || (party && apply.party)) {
            if (apply.special) {
                equip_effects_update_special_option(effect_list, apply, offset, source, source_party, party_id);
            } else {
                var offset_val = 0;
                var max_id = apply.id;
                if (apply.offset) {
                    offset_val = apply.offset[offset];
                    max_id = apply.id + apply.offset.slice(-1)[0];
                }
                var option = 0;
                if (apply.option) {
                    option = apply.option;
                    
                } 
                effect_list.push(
                    { "id": apply.id + offset_val, "option": option, "source": source, "base_id": apply.id, "max_id": max_id, "multi": apply.multi, "auto": apply.auto, "source_party": source_party }
                )
            }            
        }
        
    }
}

function equip_effects_update_special_option(effect_list, apply, offset, source, source_party, party_id) {

    var new_effect = {
        "id": null,
        "option": 0,
        "source": source,
        "base_id": apply.id,
        "max_id": null,
        "multi": apply.multi,
        "auto": apply.auto,
        "source_party": source_party
    }


    switch (apply.special) {
        case "illusory_heart":
            var pyro_count = equip_character_return_variable_count("vision", "pyro");
            if (user_objects.user_party[equip_character_return_party_id_by_name("nahida")].constel >= 1) {
                pyro_count += 1;
            }           
            if (pyro_count > 0) {
                var max_id = apply.id + 29;
                var offset_val = apply.offset[offset];
                if (pyro_count > 1) {
                    offset_val += 15;
                }
                new_effect.id = apply.id + offset_val;
                new_effect.max_id = max_id;
            }
            break;

        case "return_to_oblivion":
            var cryo_hydro_count = equip_character_return_variable_count("vision", "cryo") + equip_character_return_variable_count("vision", "hydro");
            if (cryo_hydro_count > 1) {
                var max_id = apply.id + 5;
                var offset_val = cryo_hydro_count - 2;

                if (user_objects.user_party[equip_character_return_party_id_by_name("skirk")].constel >= 4) {
                    offset_val += 3;
                }

                new_effect.id = apply.id + offset_val;
                new_effect.max_id = max_id;
            }
            break;
        case "scroll_of_the_hero_of_cinder_city":
            var offset_val = 0;
            var max_id = apply.id + 1;
            if (data_characters[user_objects.user_party[source_party].id].nightsoul) {
                offset_val = 1;
            }
            new_effect.id = apply.id + offset_val;
            new_effect.max_id = max_id;
            break;

        case "plan_to_get_paid":
            var pyro_count = equip_character_return_variable_count("vision", "pyro");
            var hydro_count = equip_character_return_variable_count("vision", "hydro");
            var electro_count = equip_character_return_variable_count("vision", "electro");
            var cryo_count = equip_character_return_variable_count("vision", "cryo");
            var constel = user_objects.user_party[source_party].constel;
            var moonsign = equip_character_return_variable_count("moonsign");

            var vision_counts = [pyro_count, hydro_count, electro_count, cryo_count];
            vision_counts.sort().reverse();

            new_effect.max_id = apply.id + 2;

            var pyro = false;
            var hydro = false;

            if (moonsign >= 2 && constel >= 2) {
                if (pyro_count >= 1 && pyro_count >= vision_counts[1]) {
                    pyro = true;
                }
                if (hydro_count >= 1 && hydro_count >= vision_counts[1]) {
                    hydro = true;
                }
            } else {
                if (pyro_count >= 1 && pyro_count == vision_counts[0]) {
                    pyro = true;
                } else if (hydro_count >= 1 && hydro_count == vision_counts[0]) {
                    hydro = true;
                }
            }

            if (pyro && hydro) {
                new_effect.id = apply.id + 2;
            } else if (pyro) {
                new_effect.id = apply.id;
            } else if (hydro) {
                new_effect.id = apply.id + 1;
            }

            
            break;

        case "nightsoul":
            if (data_characters[user_objects.user_party[party_id].id].nightsoul) {
                new_effect.id = apply.id;
                new_effect.max_id = apply.id;
            }            
            break;
        case "nightsoul_1":
            var nightsoul = Boolean(data_characters[user_objects.user_party[party_id].id].nightsoul);
            if (apply.offset) {
                var offset_val = apply.offset[offset] + nightsoul * apply.offset.length;
                var max_id = apply.id + apply.offset.slice(-1)[0] + apply.offset.length;
            } else {
                var offset_val = nightsoul;
                var max_id = apply.id + 1;
            }

            new_effect.id = apply.id + offset_val;
            new_effect.max_id = max_id;
            break;
        case "moonsign_1_2":
            var moonsign = equip_character_return_variable_count("moonsign");
            if (moonsign > 0) {
                if (moonsign > 1) {
                    moonsign = 1;
                } else {
                    moonsign = 0;
                }
                if (apply.offset) {
                    var offset_val = apply.offset[offset] + moonsign * apply.offset.length;
                    var max_id = apply.id + apply.offset.slice(-1)[0] + apply.offset.length;
                } else {
                    var offset_val = moonsign;
                    var max_id = apply.id + 1;
                }

                new_effect.id = apply.id + offset_val;
                new_effect.max_id = max_id;
            }
            
            break;
        case "moonsign_0_2":
            var moonsign = equip_character_return_variable_count("moonsign");
            if (moonsign >= 2) {
                moonsign = 1;
            } else {
                moonsign = 0;
            }
            if (apply.offset) {
                var offset_val = apply.offset[offset] + moonsign * apply.offset.length;
                var max_id = apply.id + apply.offset.slice(-1)[0] + apply.offset.length;
            } else {
                var offset_val = moonsign;
                var max_id = apply.id + 1;
            }

            new_effect.id = apply.id + offset_val;
            new_effect.max_id = max_id;
            

            break;
        case "moonsign_1":
            var moonsign = equip_character_return_variable_count("moonsign");
            if (moonsign >= 1) {
                if (apply.offset) {
                    var offset_val = apply.offset[offset];
                    var max_id = apply.id + apply.offset.slice(-1)[0];
                } else {
                    var offset_val = 0;
                    var max_id = apply.id;
                }
                new_effect.id = apply.id + offset_val;
                new_effect.max_id = max_id;
            }
            break;
        case "moonsign_2":
            var moonsign = equip_character_return_variable_count("moonsign");
            if (moonsign >= 2) {
                if (apply.offset) {
                    var offset_val = apply.offset[offset];
                    var max_id = apply.id + apply.offset.slice(-1)[0];
                } else {
                    var offset_val = 0;
                    var max_id = apply.id;
                }
                new_effect.id = apply.id + offset_val;
                new_effect.max_id = max_id;
            }
            break;

        case "moonsign_2_personal_only":
            var moonsign = equip_character_return_variable_count("moonsign");
            if (moonsign >= 2 && data_characters[user_objects.user_party[party_id].id].moonsign) {

                if (apply.offset) {
                    var offset_val = apply.offset[offset] + apply.offset.length;
                    var max_id = apply.id + apply.offset.slice(-1)[0] + apply.offset.length;
                } else {
                    var offset_val = 0;
                    var max_id = apply.id + 1;
                }
                new_effect.id = apply.id + offset_val;
                new_effect.max_id = max_id;
            }

            break;

        case "hexenzirkel_0_2":
            var hexenzirkel = equip_character_return_variable_count("hexenzirkel");
            if (hexenzirkel >= 2) {
                hexenzirkel = 1;
            } else {
                hexenzirkel = 0;
            }
            if (apply.offset) {
                var offset_val = apply.offset[offset] + hexenzirkel * apply.offset.length;
                var max_id = apply.id + apply.offset.slice(-1)[0] + apply.offset.length;
            } else {
                var offset_val = hexenzirkel;
                var max_id = apply.id + 1;
            }

            new_effect.id = apply.id + offset_val;
            new_effect.max_id = max_id;


            break;

        case "hexenzirkel_2":
            var hexenzirkel = equip_character_return_variable_count("hexenzirkel");
            if (hexenzirkel >= 2) {
                if (apply.offset) {
                    var offset_val = apply.offset[offset];
                    var max_id = apply.id + apply.offset.slice(-1)[0];
                } else {
                    var offset_val = 0;
                    var max_id = apply.id;
                }
                new_effect.id = apply.id + offset_val;
                new_effect.max_id = max_id;
            }
            break;

        case "hexenzirkel_2_personal":
            var hexenzirkel = equip_character_return_variable_count("hexenzirkel");
            if (hexenzirkel >= 2) {
                var hexenzirkel_personal = 0;
                if (data_characters[user_objects.user_party[party_id].id].hexenzirkel) {
                    hexenzirkel_personal = 1;
                }

                if (apply.offset) {
                    var offset_val = apply.offset[offset] + hexenzirkel_personal * apply.offset.length;
                    var max_id = apply.id + apply.offset.slice(-1)[0] + apply.offset.length;
                } else {
                    var offset_val = hexenzirkel_personal;
                    var max_id = apply.id + 1;
                }
                new_effect.id = apply.id + offset_val;
                new_effect.max_id = max_id;
            }

            break;

        case "hexenzirkel_personal":
            var hexenzirkel_personal = 0;
            if (data_characters[user_objects.user_party[party_id].id].hexenzirkel) {
                hexenzirkel_personal = 1;
            }

            if (apply.offset) {
                var offset_val = apply.offset[offset] + hexenzirkel_personal * apply.offset.length;
                var max_id = apply.id + apply.offset.slice(-1)[0] + apply.offset.length;
            } else {
                var offset_val = hexenzirkel_personal;
                var max_id = apply.id + 1;
            }
            new_effect.id = apply.id + offset_val;
            new_effect.max_id = max_id;

            break;

        case "hexenzirkel_2_personal_only":
            var hexenzirkel = equip_character_return_variable_count("hexenzirkel");
            if (hexenzirkel >= 2 && data_characters[user_objects.user_party[party_id].id].hexenzirkel) {

                if (apply.offset) {
                    var offset_val = apply.offset[offset] + apply.offset.length;
                    var max_id = apply.id + apply.offset.slice(-1)[0] + apply.offset.length;
                } else {
                    var offset_val = 0;
                    var max_id = apply.id + 1;
                }
                new_effect.id = apply.id + offset_val;
                new_effect.max_id = max_id;
            }

            break;

        case "phantasmal_nocturne":
            var hexenzirkel = equip_character_return_variable_count("hexenzirkel");
            if (hexenzirkel >= 2) {
                var const_effect_ids = equip_effects_return_const_offset(source_party, apply, offset, [6]);
                new_effect.id = const_effect_ids.id;
                new_effect.max_id = const_effect_ids.max_id;               
            }
            break;

        case "veil_of_falsehood":
            var moonsign = equip_character_return_variable_count("moonsign");
            if (moonsign >= 2) {
                var const_effect_ids = equip_effects_return_const_offset(source_party, apply, offset, [2]);
                new_effect.id = const_effect_ids.id;
                new_effect.max_id = const_effect_ids.max_id;
            }

            break;

        case "selenic_adeptus":
            var moonsign = equip_character_return_variable_count("moonsign");
            if (moonsign >= 2) {
                var const_effect_ids = equip_effects_return_const_offset(source_party, apply, offset, [2]);
                new_effect.id = const_effect_ids.id;
                new_effect.max_id = const_effect_ids.max_id;
            } else {
                new_effect.id = apply.id;
                new_effect.max_id = apply.id + 1;
            }

            break;
        case "torchforger_covenant":
            var moonsign = equip_character_return_variable_count("moonsign");
            if (moonsign >= 2) {
                var offset_val = 2;
            } else {
                var offset_val = 0;
            }
            var const_effect_ids = equip_effects_return_const_offset(source_party, apply, offset, [6]);
            new_effect.id = const_effect_ids.id + offset_val;
            new_effect.max_id = const_effect_ids.max_id + 2;

            break;
        case "blessing_of_moonlight":
            if (!data_characters[user_objects.user_party[source_party].id].moonsign) {
                var offset_val = 0;
                var vision = data_characters[user_objects.user_party[source_party].id].vision;
                switch (vision) {
                    case "hydro":
                        offset_val = 1;
                        break;
                    case "geo":
                        offset_val = 2;
                        break;
                    case "anemo":
                        offset_val = 3;
                        break;
                    case "dendro":
                        offset_val = 3;
                        break;
                    default:
                        offset_val = 0;
                }

                new_effect.id = apply.id + offset_val;
                new_effect.max_id = apply.id + 3;
            }

            break;

        case "lithic":
            var liyue_count = equip_character_return_variable_count("nation", "liyue");;
            if (liyue_count > 0) {
                var max_id = apply.id + 19;
                var offset_val = apply.offset[offset] + (liyue_count-1)*5;

                new_effect.id = apply.id + offset_val;
                new_effect.max_id = max_id;
            }
            break;
        case "min_cryo_hydro_4":
            if ((equip_character_return_variable_count("vision", "cryo") + equip_character_return_variable_count("vision", "hydro")) >= 4) {
                effect_list.push(
                    { "id": apply.id, "option": 0, "source": source, "base_id": apply.id, "max_id": apply.id, "source_party": source_party }
                )
            }
            break;
        case "min_cryo_hydro_4_each":
            if ((equip_character_return_variable_count("vision", "cryo") + equip_character_return_variable_count("vision", "hydro")) >= 4
                && equip_character_return_variable_count("vision", "cryo") >= 1 && equip_character_return_variable_count("vision", "hydro") >= 1) {
                new_effect.id = apply.id;
                new_effect.max_id = apply.id;
            }
            break;
        case "min_geo_3":
            if (equip_character_return_variable_count("vision", "geo") >= 3) {
                new_effect.id = apply.id;
                new_effect.max_id = apply.id;
            }
            break;
        case "min_pyro_electro_4":
            if ((equip_character_return_variable_count("vision", "pyro") + equip_character_return_variable_count("vision", "electro")) >= 4) {
                new_effect.id = apply.id;
                new_effect.max_id = apply.id;
            }
            break;
        case "min_dendro_hydro_4":
            if ((equip_character_return_variable_count("vision", "dendro") + equip_character_return_variable_count("vision", "hydro")) >= 4) {
                new_effect.id = apply.id;
                new_effect.max_id = apply.id;
            }
            break;

        case "cryo_hydro":
            var cryo_hydro_count = equip_character_return_variable_count("vision", "cryo") + equip_character_return_variable_count("vision", "hydro");
            if (cryo_hydro_count > 0) {
                var max_id = apply.id + 3;
                var offset_val = cryo_hydro_count - 1;

                new_effect.id = apply.id + offset_val;
                new_effect.max_id = max_id;
            }
            break;

        case "geo_hydro_0_1_2_3":
            var geo_hydro_count = equip_character_return_variable_count("vision", "geo")  + equip_character_return_variable_count("vision", "hydro");

            var max_id = apply.id + 3;
            if (geo_hydro_count > 3) {
                geo_hydro_count = 3;
            }

            if (apply.offset) {
                var offset_val = apply.offset[offset] + geo_hydro_count * apply.offset.length;
                var max_id = apply.id + apply.offset.slice(-1)[0] + apply.offset.length * 3;
            } else {
                var offset_val = geo_hydro_count;
                var max_id = apply.id + 3;
            }

            new_effect.id = apply.id + offset_val;
            new_effect.max_id = max_id;

            break;

        case "geo_1_2_3": 
            var geo_count = equip_character_return_variable_count("vision", "geo");
            if (geo_count > 0) {
                var max_id = apply.id + 2;
                var offset_val = geo_count - 1;
                if (offset_val > 2) {
                    offset_val = 2;
                }

                new_effect.id = apply.id + offset_val;
                new_effect.max_id = max_id;
            }            
            break;

        case "geo_2_3_4":
            var geo_count = equip_character_return_variable_count("vision", "geo");
            if (geo_count > 1) {
                var max_id = apply.id + 2;
                var offset_val = geo_count - 2;
                if (offset_val > 2) {
                    offset_val = 2;
                }

                new_effect.id = apply.id + offset_val;
                new_effect.max_id = max_id;
            }
            break;

        case "hydro_0_1_2":
            var hydro_count = equip_character_return_variable_count("vision", "hydro");

            var max_id = apply.id + 2;
            if (hydro_count > 2) {
                hydro_count = 2;
            }

            if (apply.offset) {
                var offset_val = apply.offset[offset] + hydro_count * apply.offset.length;
                var max_id = apply.id + apply.offset.slice(-1)[0] + apply.offset.length * 2;
            } else {
                var offset_val = hydro_count;
                var max_id = apply.id + 2;
            }

            new_effect.id = apply.id + offset_val;
            new_effect.max_id = max_id;
            
            break;

        case "hydro_1_2_3":
            var hydro_count = equip_character_return_variable_count("vision", "hydro");
            if (hydro_count > 0) {
                var max_id = apply.id + 2;
                var offset_val = hydro_count - 1;
                if (offset_val > 2) {
                    offset_val = 2;
                }

                new_effect.id = apply.id + offset_val;
                new_effect.max_id = max_id;
            }
            break;

        case "pyro_1_2_3":
            var pyro_count = equip_character_return_variable_count("vision", "pyro");
            if (pyro_count > 0) {
                var max_id = apply.id + 2;
                var offset_val = pyro_count - 1;
                if (offset_val > 2) {
                    offset_val = 2;
                }

                new_effect.id = apply.id + offset_val;
                new_effect.max_id = max_id;
            }
            break;

        case "phec_1_2":
            var pyro_count = equip_character_return_variable_count("vision", "pyro");
            var hydro_count = equip_character_return_variable_count("vision", "hydro");
            var electro_count = equip_character_return_variable_count("vision", "electro");
            var cryo_count = equip_character_return_variable_count("vision", "cryo");

            var phec_count = pyro_count + hydro_count + electro_count + cryo_count;

            if (phec_count > 0) {
                var max_id = apply.id + 1;
                var offset_val = 0;
                if (phec_count > 1) {
                    offset_val = 1;
                }

                new_effect.id = apply.id + offset_val;
                new_effect.max_id = max_id;
            }
            break;

        case "elemental_types":
            var different_elements = equip_character_return_variable_count("vision", null);
            var max_id = apply.id + 3;
            var offset_val = different_elements - 1;

            new_effect.id = apply.id + offset_val;
            new_effect.max_id = max_id;
            break;

        case "same_element":
            var vision = data_characters[user_objects.user_party[party_id].id].vision;
            var same_element = equip_character_return_variable_count("vision", vision);
           
            if (apply.offset) {
                var offset_val = apply.offset[offset] + (same_element - 1) * apply.offset.length;
                var max_id = apply.id + apply.offset.slice(-1)[0] + apply.offset.length * 3;
            } else {
                var offset_val = same_element - 1;
                var max_id = apply.id + 3;
            }
            
            new_effect.id = apply.id + offset_val;
            new_effect.max_id = max_id;
            break;

        case "different_element_0_1_2":
            var vision = data_characters[user_objects.user_party[party_id].id].vision;
            var different_element = 4 - equip_character_return_variable_count("vision", vision);

            if (different_element > 2) {
                different_element = 2;
            }

            if (apply.offset) {
                var offset_val = apply.offset[offset] + different_element * apply.offset.length;
                var max_id = apply.id + apply.offset.slice(-1)[0] + apply.offset.length * 2;
            } else {
                var offset_val = different_element;
                var max_id = apply.id + 2;
            }
            new_effect.id = apply.id + offset_val;
            new_effect.max_id = max_id;

            break;

        case "chiucue_mix":
            var current_vision = data_characters[user_objects.user_party[party_id].id].vision;
            var max_id = apply.id + 3;
            if (current_vision == "geo") {
                new_effect.id = apply.id;
            } else if (current_vision == "pyro") {
                new_effect.id = apply.id + 1;
            } else if (current_vision == "hydro") {
                new_effect.id = apply.id + 2;
            } else if (current_vision == "cryo") {
                new_effect.id = apply.id + 3;
            }            
            new_effect.max_id = max_id;
            break;

        case "fontaine_count":
            var fontaine_count = equip_character_return_variable_count("nation", "fontaine");
            var max_id = apply.id + 3;
            var offset_val = fontaine_count - 1;

            new_effect.id = apply.id + offset_val;
            new_effect.max_id = max_id;
            break;

        case "natlan_different_element":

            var vision = data_characters[user_objects.user_party[party_id].id].vision;

            var count = 0;
            for (var i = 0; i < const_party_size; i++) {
                if (data_characters[user_objects.user_party[i].id].nation == "natlan" || data_characters[user_objects.user_party[i].id].vision != vision) {
                    count += 1;
                }
            }

            if (count > 0) {
                if (apply.offset) {
                    var offset_val = apply.offset[offset] + (count - 1) * 5;
                    var max_id = apply.id + apply.offset.slice(-1)[0] + apply.offset.length * 3;
                } else {
                    var offset_val = count - 1;
                    var max_id = apply.id + 3;
                }
            }
            new_effect.id = apply.id + offset_val;
            new_effect.max_id = max_id;
            break;

        case "const_1":
            var const_effect_ids = equip_effects_return_const_offset(source_party, apply, offset, [1]);
            new_effect.id = const_effect_ids.id;
            new_effect.max_id = const_effect_ids.max_id;
            break;

        case "const_2":
            var const_effect_ids = equip_effects_return_const_offset(source_party, apply, offset, [2]);
            new_effect.id = const_effect_ids.id;
            new_effect.max_id = const_effect_ids.max_id;
            break;

        case "const_1_2":
            var const_effect_ids = equip_effects_return_const_offset(source_party, apply, offset, [1, 2]);
            new_effect.id = const_effect_ids.id;
            new_effect.max_id = const_effect_ids.max_id;
            break;

        case "const_4":
            var const_effect_ids = equip_effects_return_const_offset(source_party, apply, offset, [4]);
            new_effect.id = const_effect_ids.id;
            new_effect.max_id = const_effect_ids.max_id;
            break;

        case "const_6":
            var const_effect_ids = equip_effects_return_const_offset(source_party, apply, offset, [6]);
            new_effect.id = const_effect_ids.id;
            new_effect.max_id = const_effect_ids.max_id;
            break;

        case "const_2_3_4_5_6":
            var const_effect_ids = equip_effects_return_const_offset(source_party, apply, offset, [2,3,4,5,6]);
            new_effect.id = const_effect_ids.id;
            new_effect.max_id = const_effect_ids.max_id;
            break;

        case "energy_60_40":
            var energy = output_party[party_id].stats.initial.total.energy_burst;
            if (energy <= 60 ) {
                var energy_count = 0;
                if (energy <=40) {
                    energy_count = 1;
                }

                if (apply.offset) {
                    var offset_val = apply.offset[offset] + energy_count * apply.offset.length;
                    var max_id = apply.id + apply.offset.slice(-1)[0] + apply.offset.length;
                } else {
                    var offset_val = energy_count;
                    var max_id = apply.id + 1;
                }
            }

            break;

        default:
            return 
    }
    if (new_effect.id) {
        effect_list.push(new_effect);
    }
}

function equip_effects_update_active_options_all() {
    for (var i = 0; i < const_party_size; i++) {
        equip_effects_update_active_options(i);
    }
}

function equip_effects_update_active_options(party_id) {
    equip_effects_update_active_options_sub(party_id, null);
    for (var i = 0; i < user_objects.user_party[party_id].active_skills.length; i++) {
        if (user_objects.user_party[party_id].active_skills[i].effects && user_objects.user_party[party_id].active_skills[i].effects.length > 0) {
            equip_effects_update_active_options_sub(party_id, i);
        }
    }
}

function equip_effects_update_active_options_sub(party_id, skill_index) {

    if (skill_index === null) {
        var user_effects = user_objects.user_party[party_id].effects;
        equip_effects_update_active_auto("character", party_id);
        equip_effects_update_active_auto("party", party_id);
    } else {
        var user_effects = user_objects.user_party[party_id].active_skills[skill_index].effects;
    }

    for (var i = user_effects.length - 1; i >= 0; i--) {
        var found = false;
        var user_effect = user_effects[i];

        if (!user_effect.manual) {

            if (user_effect.selected == false && user_effect.option == 0) {
                user_effects.splice(i, 1);
            } else if (!equip_effects_return_selected_option(user_effect)) {
                utils_log_debug("Resetting effect option id: " + user_effect.id);
                user_effect.option = 0;
            } else {
                for (var ii = 0; ii < output_party[party_id].effects["character"].length; ii++) {
                    var output_effect = output_party[party_id].effects["character"][ii];
                    if (output_effect.max_id != output_effect.base_id) {
                        if (user_effect.id >= output_effect.base_id && user_effect.id <= output_effect.max_id && user_effect.source_party == output_effect.source_party) {
                            found = true;
                            user_effect.id = output_effect.id;
                            break;
                        }
                    } else if (user_effect.id == output_effect.id && user_effect.source_party == output_effect.source_party) {
                        found = true;
                        break;
                    }
                }

                if (found == false) {
                    for (var ii = 0; ii < output_party[party_id].effects["party"].length; ii++) {
                        var output_effect = output_party[party_id].effects["party"][ii];
                        if (output_effect.max_id != output_effect.base_id) {
                            if (user_effect.id >= output_effect.base_id && user_effect.id <= output_effect.max_id && user_effect.source_party == output_effect.source_party) {
                                found = true;
                                user_effect.id = output_effect.id;
                                break;
                            }
                        } else if (user_effect.id == output_effect.id && user_effect.source_party == output_effect.source_party) {
                            found = true;
                            break;
                        }
                    }
                }

                if (found == false) {
                    if (skill_index === null) {
                        utils_log_debug("Removing effect id: " + user_effect.id);
                    } else {
                        utils_log_debug("Removing effect id: " + user_effect.id + ", from skill: " + skill_index);
                    }                    
                    user_effects.splice(i, 1);
                }
            }    
        }  
        if (user_effect.id != 0 && skill_index !== null && (found == true || user_effect.manual)) {
            var user_effects_general = user_objects.user_party[party_id].effects;
            for (var ii = 0; ii < user_effects_general.length; ii++) {
                if (user_effect.id == user_effects_general[ii].id && user_effects_general[ii].selected) {
                    user_effects.splice(i, 1);
                    utils_log_debug("Removing effect id: " + user_effect.id + ", from skill: " + skill_index);
                    break;
                }
            }
        }        
    }
}

function equip_effects_update_active_auto(effect_type, party_id) {
    var user_effects = user_objects.user_party[party_id].effects;

    for (var i = 0; i < output_party[party_id].effects[effect_type].length; i++) {
        var output_effect = output_party[party_id].effects[effect_type][i];
        if (output_effect.auto) {
            var found = false;
            for (var ii = 0; ii < user_effects.length; ii++) {
                var user_effect = user_effects[ii];
                if (user_effect.id >= output_effect.base_id && user_effect.id <= output_effect.max_id && user_effect.source_party == output_effect.source_party) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                utils_log_debug("Applying auto effect id: " + output_effect.id);
                user_effects.push(
                    { "id": output_effect.id, "option": output_effect.option, "selected": true, "manual": false, "source_party": output_effect.source_party, "skill_index": null, "auto": true }
                );
            }            
        }
    }
}


function equip_effects_display_all(skill_index = null) {
    for (var i = 0; i < const_effect_types_auto.length; i++) {
        equip_effects_display(const_effect_types_auto[i], skill_index);
    }
    equip_effects_display_manual(skill_index);
}

function equip_effects_display_manual(skill_index = null) {

    if (skill_index === null) {
        var parent = document.getElementById("effects_container_manual");
        var current_effects = user_objects.user_party[user_objects.user_active_character].effects;
    } else {
        var parent = document.getElementById("skill_effects_container_manual");
        var current_effects = user_objects.user_party[user_objects.user_active_character].active_skills[skill_index].effects;
    }

    utils_delete_children(parent, 0);

    var manual_index = 0;

    if (current_effects) {
        for (var i = 0; i < current_effects.length; i++) {
            var user_effect = current_effects[i];

            if (user_effect.manual) {
                let effect = utils_array_get_by_lookup(data_effects, "id", user_effect.id);

                let selected_option = equip_effects_return_selected_option(user_effect);   

                var effect_obj = utils_create_obj("div", "effect_row");

                var effect_left = utils_create_obj("div", "effect_col");
                effect_obj.appendChild(effect_left);

                effect_left.appendChild(equip_effects_return_manual_selector(effect, manual_index, skill_index));

                if (effect.options.length > 1) {
                    effect_left.appendChild(equip_effects_return_options_manual_selector(effect, manual_index, selected_option, skill_index));
                }

                effect_obj.appendChild(equip_effects_return_effect_right(selected_option, user_objects.user_active_character));
                let delete_index = manual_index;
                effect_obj.appendChild(utils_create_img_btn("delete-forever", function (event) { equip_effects_change_delete_manual(delete_index, skill_index) }, "Delete"));

                manual_index += 1;

                parent.appendChild(effect_obj);
            }

        }
    }

    
}

function equip_effects_display(effect_type, skill_index = null) {

    if (skill_index === null) {
        var effect_super_type = "effects";
    } else {
        var effect_super_type = "skill_effects";        
    }
    var parent = document.getElementById(effect_super_type + "_container_" + effect_type);
    utils_delete_children(parent, 0);

    var possible_effects = output_party[user_objects.user_active_character].effects[effect_type];

    for (var i = 0; i < possible_effects.length; i++) {
        let possible_eff = possible_effects[i];
        let effect = utils_array_get_by_lookup(data_effects, "id", possible_eff.id);
        
        let user_select = equip_effects_return_user_select(user_objects.user_active_character, effect.id, possible_eff, skill_index);
        let selected_option = equip_effects_return_selected_option(user_select);        

        if ((skill_index === null || !user_select.selected || user_select.skill_index !== null) && !possible_eff.auto) {
            var enabled = true;
            var effect_obj = utils_create_obj("div", "effect_row");
        } else {
            var enabled = false;
            var effect_obj = utils_create_obj("div", "effect_row disabled");
        }

        if (user_select.selected) {
            var toggle_class = "active";
        } else {
            var toggle_class = "inactive";
        }
        
        var effect_toggle = utils_create_obj("div", "effect_toggle " + toggle_class, effect_super_type + "_toggle_" + effect_type + "_" + effect.id);
        if (enabled) {    
            if (skill_index === null) {
                effect_toggle.onclick = function (event) { equip_effects_change_selected(possible_eff, skill_index); };
            } else {
                effect_toggle.onclick = function (event) { equip_effects_change_selected(possible_eff, skill_index); event.preventDefault(); };
            }
        }       
        effect_obj.appendChild(effect_toggle);

        var display_source = utils_create_obj("div", "effect_source");
        if (possible_eff.source.type == "svg") {
            display_source.appendChild(utils_create_label_img(possible_eff.source.id, possible_eff.source.name, null, null, "effect_source_img"))
        } else {
            display_source.appendChild(utils_create_img("effect_source_img img_icon", null, equip_effects_return_source_icon(possible_eff), possible_eff.source.name));
        }
        effect_obj.appendChild(display_source);

        var effect_left = utils_create_obj("div", "effect_col");
        effect_obj.appendChild(effect_left);

        effect_left.appendChild(utils_create_obj("div", "effect_name", null, effect.name));

        if (effect.options && effect.options.length > 1) {
            effect_left.appendChild(equip_effects_return_options_selector(effect, selected_option, possible_eff, skill_index, enabled));
        }
        if (effect.input) {
            effect_left.appendChild(equip_effects_return_input_selector(effect, selected_option, possible_eff, skill_index, enabled));
        }

        effect_obj.appendChild(equip_effects_return_effect_right(selected_option, possible_eff.source_party));

        parent.appendChild(effect_obj);
    }
}

function equip_effects_return_manual_selector(current_effect, manual_index, skill_index, enabled) {
    if (skill_index === null) {
        var effect_super_type = "effects";
    } else {
        var effect_super_type = "skill_effects";
    }
    let option_container = utils_create_obj("div", "container");
    let option = utils_create_obj("div", "icon_selects effect_manual", effect_super_type + "_manual_" + manual_index);
    if (skill_index === null) {
        option.onclick = function (event) { utils_create_prompt_values(option.id, equip_effects_change_manual, equip_effects_return_manual_options(skill_index), manual_index, option_container); event.preventDefault(); };
    } else {
        option.onclick = function (event) { utils_create_prompt_values(option.id, equip_effects_change_manual, equip_effects_return_manual_options(skill_index), skill_index + "_" + manual_index, option_container, "active_prompt_skill_effects"); event.preventDefault(); };
    }  
    option_container.appendChild(option);
    option.appendChild(utils_create_obj("div", "icon_selects_text", null, current_effect.name));
    return option_container;
}

function equip_effects_return_input_selector(effect, selected_option, possible_eff, skill_index, enabled) {
    if (skill_index === null) {
        var effect_super_type = "effects";
    } else {
        var effect_super_type = "skill_effects";
    }

    let option_container = utils_create_obj("div", "container");
    let option = utils_create_obj("div", "icon_selects effect_option", effect_super_type + "_option_" + effect.id);
    let possible_effect = structuredClone(possible_eff);
    possible_effect.skill_index = skill_index;
    if (enabled) {
        if (skill_index === null) {
            option.onclick = function (event) { utils_create_prompt_input(null, option.id, equip_effects_change_input, possible_effect, selected_option.value, option_container); event.preventDefault(); };
        } else {
            option.onclick = function (event) { utils_create_prompt_input(null, option.id, equip_effects_change_input, possible_effect, selected_option.value, option_container, "active_prompt_skill_effects"); event.preventDefault(); };
        }
    }
    option_container.appendChild(option);
    if (effect.input.custom_name) {
        option.appendChild(utils_create_obj("div", "icon_selects_text", null, selected_option.value + effect.input.custom_name));
    } else {
        option.appendChild(utils_create_obj("div", "icon_selects_text", null, selected_option.value));
    }
    
    return option_container;
}

function equip_effects_return_options_selector(effect, selected_option, possible_eff, skill_index, enabled) {
    if (skill_index === null) {
        var effect_super_type = "effects";
    } else {
        var effect_super_type = "skill_effects";
    }
    let option_container = utils_create_obj("div", "container");
    let option = utils_create_obj("div", "icon_selects effect_option", effect_super_type + "_option_" + effect.id);
    let possible_effect = structuredClone(possible_eff);
    possible_effect.skill_index = skill_index;
    if (enabled) {
        if (skill_index === null) {
            option.onclick = function (event) { utils_create_prompt_values(option.id, equip_effects_change_option, equip_effects_return_options(effect), possible_effect, option_container); event.preventDefault(); };
        } else {
            option.onclick = function (event) { utils_create_prompt_values(option.id, equip_effects_change_option, equip_effects_return_options(effect), possible_effect, option_container, "active_prompt_skill_effects"); event.preventDefault(); };
        }
    }    
    option_container.appendChild(option);
    option.appendChild(utils_create_obj("div", "icon_selects_text", null, selected_option.name));
    return option_container;
}

function equip_effects_return_options_manual_selector(current_effect, manual_index, selected_option, skill_index) {
    if (skill_index === null) {
        var effect_super_type = "effects";
    } else {
        var effect_super_type = "skill_effects";
    }
    let option_container = utils_create_obj("div", "container");
    let option = utils_create_obj("div", "icon_selects effect_option", effect_super_type + "_option_" + current_effect.id);
    if (skill_index === null) {
        option.onclick = function (event) { utils_create_prompt_values(option.id, equip_effects_change_manual_option, equip_effects_return_options(current_effect), manual_index, option_container); event.preventDefault(); };
    } else {
        option.onclick = function (event) { utils_create_prompt_values(option.id, equip_effects_change_manual_option, equip_effects_return_options(current_effect), skill_index + "_" + manual_index, option_container, "active_prompt_skill_effects"); event.preventDefault(); };
    }
    option_container.appendChild(option);
    option.appendChild(utils_create_obj("div", "icon_selects_text", null, selected_option.name));
    return option_container;
}

function equip_effects_return_effect_right(selected_option, source_party) {
    var effect_right = utils_create_obj("div", "effect_col");
    
    if (selected_option.stats) {
        for (var ii = 0; ii < selected_option.stats.length; ii++) {
            if (!selected_option.stats[ii].hidden) {
                if (selected_option.stats[ii].multiplier) {
                    var bonus = {};
                    bonus.stat = selected_option.stats[ii].stat;
                    bonus.value = selected_option.value * selected_option.stats[ii].multiplier;
                    if (selected_option.stats[ii].add) {
                        bonus.value += selected_option.stats[ii].add;
                    }
                    bonus.custom_name = selected_option.stats[ii].custom_name;
                    effect_right.appendChild(utils_create_bonus(bonus));
                } else {
                    effect_right.appendChild(utils_create_bonus(selected_option.stats[ii]));
                }  
            }                      
        }
    }
    if (selected_option.transform) {
        for (var ii = 0; ii < selected_option.transform.length; ii++) {
            if (!selected_option.transform[ii].hidden) {
                effect_right.appendChild(equip_effects_return_transform_statline(selected_option.transform[ii], source_party, selected_option.value));
            }
        }
    }

    if (selected_option.bonusdmg) {
        for (var ii = 0; ii < selected_option.bonusdmg.length; ii++) {
            if (!selected_option.bonusdmg[ii].hidden) {
                effect_right.appendChild(equip_effects_return_bonusdmg_statline(selected_option.bonusdmg[ii]));
            }
        }
    }

    if (selected_option.infusion) {
        effect_right.appendChild(utils_create_statline(data_visions[selected_option.infusion.vision].name + " Infusion", null));
    }

    if (selected_option.conversion) {
        effect_right.appendChild(utils_create_statline(data_visions[selected_option.conversion].name + " Conversion", null));
    }

    return effect_right;
}

function equip_effects_return_transform_statline(transform, source_party, input_value) {
    if (transform.custom_name) {
        var text = transform.custom_name;
    } else {
        try {
            var sourcename = data_stats[transform.source].name;
            var targetname = data_stats[transform.target].name;
        } catch (e) {
            console.log(transform);
        }
        
        var text_min = "";
        if (transform.min) {
            text_min = " over&nbsp;" + utils_number_format(transform.min);
        }
        var text_max = "";
        if (transform.max) {
            text_max = " (Max&nbsp;" + utils_number_format(transform.max)  + ")";
        }
        if (transform.character) {
            sourcename = equip_character_return_short_name(user_objects.user_party[source_party].id) + "'s " + sourcename;
        } else if (transform.party) {
            sourcename = "Party " + sourcename;
        }
        var text_add = "";
        if (transform.add) {
            text_add = utils_number_format(transform.add) + " + "
        }
        var text = text_add + sourcename + text_min + " to " + targetname + text_max;
    }
    if (input_value) {
        if (transform.breakpoint && input_value >= transform.breakpoint) {
            var ratio = transform.breakpoint_ratio;
        } else {
            var ratio = transform.ratio * input_value;
        }
    } else {
        var ratio = transform.ratio;
    }
    return utils_create_statline(text, utils_number_format(Math.round(ratio * 10000) / 100) + "%", "value_transform");
}

function equip_effects_return_bonusdmg_statline(bonusdmg) {
    if (bonusdmg.custom_name) {
        var text = bonusdmg.custom_name;
    } else {
        
        var targetname = "";
        if (bonusdmg.target_vision && bonusdmg.target_vision != "all" && bonusdmg.target_vision != "reactions") {
            targetname += " " + data_visions[bonusdmg.target_vision].name;
        }
        if (bonusdmg.target_type && bonusdmg.target_type != "all") {
            if (bonusdmg.target_type == "reactions" || !const_bonusdmg_names.hasOwnProperty(bonusdmg.target_type)) {
                targetname += " " + data_reactions[bonusdmg.target_type].name;
            } else {
                targetname += " " + const_bonusdmg_names[bonusdmg.target_type];
            }
            
        }
        if (targetname == "") {
            targetname = " All Damage";
        }

        var sourcename = data_stats[bonusdmg.source].name;
        if (bonusdmg.character) {
            sourcename = equip_character_return_short_name(bonusdmg.character) + "'s " + sourcename;
        }

        var text_min = "";
        if (bonusdmg.min) {
            text_min = " over&nbsp;" + utils_number_format(bonusdmg.min);
        }
        var text_max = "";
        if (bonusdmg.max) {
            text_max = " (Max&nbsp;" + utils_number_format(bonusdmg.max) + ")";
        }

        var text = sourcename + text_min + " to" + targetname + text_max;
    }
    return utils_create_statline(text, utils_number_format(Math.round(bonusdmg.ratio * 10000) / 10000) + "%", "value_bonusdmg");
}

function equip_effects_return_options(effect) {
    var options = [];

    for (var i = 0; i < effect.options.length; i++) {
        let option = {};
        option.text = effect.options[i].name;
        option.id = effect.options[i].id;
        options.push(option);
    }
    return options;
}

function equip_effects_return_user_select(party_id, effect_id, possible_effect, skill_index = null) {

    var user_effects = user_objects.user_party[party_id].effects;

    for (var i = 0; i < user_effects.length; i++) {
        if (user_effects[i].id == effect_id && user_effects[i].source_party == possible_effect.source_party) {
            if (user_effects[i].selected || skill_index === null) {
                return user_objects.user_party[party_id].effects[i];
            }            
        }
    }

    if (skill_index !== null) {
        var active_skill = user_objects.user_party[party_id].active_skills[skill_index];
        if (active_skill.effects) {
            for (var i = 0; i < active_skill.effects.length; i++) {
                if (active_skill.effects[i].id == effect_id && active_skill.effects[i].source_party == possible_effect.source_party) {
                    return user_objects.user_party[party_id].active_skills[skill_index].effects[i];
                }
            }
        }
    }

    return { "id": effect_id, "option": possible_effect.option, "selected": false, "manual": false, "skill_index": false, "auto": false };

}

function equip_effects_return_manual_options(skill_index) {
    var user_effects = user_objects.user_party[user_objects.user_active_character].effects;
    var selected_manual = [];

    for (var i = 0; i < user_effects.length; i++) {
        if (user_effects[i].id > 0 && user_effects[i].manual) {
            selected_manual.push(user_effects[i].id);
        }
    }

    if (skill_index !== null) {
        var user_skill_effects = user_objects.user_party[user_objects.user_active_character].active_skills[skill_index].effects;
        for (var i = 0; i < user_skill_effects.length; i++) {
            if (user_skill_effects[i].id > 0 && user_skill_effects[i].manual) {
                selected_manual.push(user_skill_effects[i].id);
            }
        }
    }

    var options = [];

    for (var i = 0; i < data_manual_effects.length; i++) {
        if (!selected_manual.includes(data_manual_effects[i].id)) {
            let option = {};
            option.text = data_manual_effects[i].name;
            option.id = data_manual_effects[i].id;
            options.push(option);
        }
             
    }
    return options;
}

function equip_effects_return_stats_transformed(source_party_id, transform, input_value = null, skill_index = null, artifact_stat = null, artifact_stat_party = null) {

    if (skill_index === null) {
        var source_stats = output_party[source_party_id].stats;
    } else {
        var source_stats = output_party[source_party_id].skills.active.details[skill_index].stats;
    }

    if (artifact_stat === null) {
        var source_value = source_stats.initial.total[transform.source];
    } else {
        var source_value = source_stats.optimize[artifact_stat_party][artifact_stat].total[transform.source];
    }

    if (transform.party) {
        for (var i = 0; i < const_party_size; i++) {
            if (i != source_party_id) {
                if (artifact_stat === null) {
                    source_value += output_party[i].stats.initial.total[transform.source];
                } else {
                    source_value += output_party[i].stats.optimize[artifact_stat_party][artifact_stat].total[transform.source];
                }                
            }
        }
    }
    
    if (transform.min) {
        source_value = source_value - transform.min;
        if (source_value < 0) {
            source_value = 0;
        }
    }
    
    if (input_value) {
        if (transform.breakpoint && input_value >= transform.breakpoint) {
            var target_value = source_value * transform.breakpoint_ratio;
        } else {
            var target_value = source_value * transform.ratio * input_value;
        }
    } else {
        var target_value = source_value * transform.ratio;
    }    
    if (transform.max) {
        if (target_value > transform.max) {
            target_value = transform.max;
        }
    }
    if (transform.add) {
        target_value += transform.add;
    }
    return { "id": transform.target, "value": target_value };
}

function equip_effects_return_source_icon(possible_eff) {
    switch (possible_eff.source.type) {
        case "character":
            return "/images/icons/character/" + possible_eff.source.id + "/char.png";
            break;
        case "weapon":
            var weapon_type = output_party[possible_eff.source_party].weapon_type;
            var weapon = utils_array_get_by_lookup(data_weapons[weapon_type], "id", possible_eff.source.id);
            return "/images/icons/weapon/" + weapon_type + "/" + weapon.icon + ".png";
            break;

        case "resonance":
            return "/images/icons/element/24p/" + possible_eff.source.id + ".png";
            break;
        case "artifact_set":
            var artifact = utils_array_get_by_lookup(data_artifact_sets, "id", possible_eff.source.id);
            return "/images/icons/artifact/flower/" + artifact.icon + ".png";
            break;

        default:
    }
}


function equip_effects_return_infusion(party_id, skill_index = null) {

    var repeated_infusions = [];
    var single_infusion = false;
    var infusable = true;
    if (output_party[party_id].weapon_type == "bow" || output_party[party_id].weapon_type == "catalyst") {
        infusable = false;
    }

    var user_effects = user_objects.user_party[party_id].effects;
    for (var i = 0; i < user_effects.length; i++) {
        if (user_effects[i].selected) {
            var option = equip_effects_return_selected_option(user_effects[i]);

            if (option.conversion) {
                return option.conversion;
            }

            if (infusable && option.infusion) {
                if (option.infusion.repeated) {
                    repeated_infusions.push(option.infusion.vision)
                } else {
                    single_infusion = option.infusion.vision;
                }
            }
        }        
    }

    if (skill_index !== null) {
        var skill_effects = user_objects.user_party[party_id].active_skills[skill_index].effects;
        for (var i = 0; i < skill_effects.length; i++) {
            if (skill_effects[i].selected) {
                var option = equip_effects_return_selected_option(skill_effects[i]);

                if (option.conversion) {
                    return option.conversion;
                }

                if (infusable && option.infusion) {
                    if (option.infusion.repeated) {
                        repeated_infusions.push(option.infusion.vision)
                    } else {
                        single_infusion = option.infusion.vision;
                    }
                }
            }
        }
    }

    if (infusable) {
        if (single_infusion && repeated_infusions.length == 0) {
            return single_infusion;
        } else if (repeated_infusions.length > 0) {
            var hydro = repeated_infusions.includes("hydro");
            var pyro = repeated_infusions.includes("pyro");
            var cryo = repeated_infusions.includes("cryo");

            if (hydro && pyro) {
                return "hydro";
            } else if ((hydro && cryo) || (hydro && single_infusion == "cryo")) {
                return "cryo";
            } else if (cryo && pyro) {
                return "pyro"
            } else {
                return repeated_infusions[0];
            }
        } else {
            return false;
        }
    } else {
        return false;
    }    
}

function equip_effects_return_const_offset(source_party, apply, offset, breakpoints) {
    var constel = user_objects.user_party[source_party].constel;

    var offset_val = 0;
    if (apply.offset) {
        var max_id = apply.id + apply.offset.length * (breakpoints.length + 1) - 1;
        offset_val = apply.offset[offset];
    } else {
        var max_id = apply.id + breakpoints.length;
    }
    for (var i = 0; i < breakpoints.length; i++) {
        if (constel >= breakpoints[i]) {
            if (apply.offset) {
                offset_val += apply.offset.length;
            } else {
                offset_val += 1;
            }
        }
    }

    return {
        "id": apply.id + offset_val,
        "max_id": max_id
    }
}

