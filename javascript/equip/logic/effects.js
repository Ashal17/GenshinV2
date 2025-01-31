const effect_types = ["character", "party", "manual"];
const effect_types_auto = ["character", "party"];

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

function equip_effects_change_new_manual() {
    user_objects.user_party[user_objects.user_active_character].effects.push(
        { "id": 0, "option": 0, "selected": true, "manual": true }
    );
    equip_effects_change_trigger();
}

function equip_effects_change_delete_manual(delete_index) {

    var user_effects = user_objects.user_party[user_objects.user_active_character].effects;

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

    equip_effects_change_trigger();
}

function equip_effects_change_manual(selected_id, manual_index) {
    var user_effects = user_objects.user_party[user_objects.user_active_character].effects;

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

    equip_effects_change_trigger();
}

function equip_effects_change_manual_option(option, manual_index) {

    var user_effects = user_objects.user_party[user_objects.user_active_character].effects;

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

    equip_effects_change_trigger();
}

function equip_effects_change_option(option, possible_eff) {
    var effect_id = possible_eff.id;
    var source_party = possible_eff.source_party;

    var user_effects = user_objects.user_party[user_objects.user_active_character].effects;

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
            { "id": effect_id, "option": option, "selected": false, "manual": false, "source_party": source_party }
        );
    }
    equip_effects_change_trigger();
}

function equip_effects_change_selected(possible_eff) {

    var user_effects = user_objects.user_party[user_objects.user_active_character].effects;
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
            { "id": effect_id, "option": 0, "selected": true, "manual": false, "source_party": source_party }
        );
    }
    equip_effects_change_trigger();
}

function equip_effects_update_stats_all() {
    for (var i = 0; i < party_size; i++) {
        equip_effects_update_stats(i);
        equip_effects_update_infusion(i);
    }
}

function equip_effects_update_stats(party_id) {

    var stats = [];

    var user_effects = user_objects.user_party[party_id].effects;
    for (var i = 0; i < user_effects.length; i++) {
        if (user_effects[i].selected) {
            var effect = utils_array_get_by_lookup(data_effects, "id", user_effects[i].id);
            var option = effect.options[user_effects[i].option];

            if (option.stats) {
                for (var ii = 0; ii < option.stats.length; ii++) {
                    stats.push(
                        { "id": option.stats[ii].stat, "value": option.stats[ii].value }
                    );
                }
            }
        }       
    }

    output_party[party_id].stats.effects = stats;
}

function equip_effects_update_stats_transform_other_all() {
    for (var i = 0; i < party_size; i++) {
        equip_effects_update_stats_transform_other(i);
    }
}

function equip_effects_update_stats_transform_other(party_id) {
    var stats = [];

    var user_effects = user_objects.user_party[party_id].effects;

    for (var i = 0; i < user_effects.length; i++) {
        if (user_effects[i].selected) {
            var effect = utils_array_get_by_lookup(data_effects, "id", user_effects[i].id);
            var option = effect.options[user_effects[i].option];

            if (option.transform) {
                for (var ii = 0; ii < option.transform.length; ii++) {
                    if (option.transform[ii].character) {

                        stats.push(equip_effects_return_stats_transformed(user_effects[i].source_party, option.transform[ii]));

                    } else if (option.transform[ii].special) {


                        var source_party_id = equip_character_return_party_id_by_special(option.transform[ii].special);

                        stats.push(equip_effects_return_stats_transformed(source_party_id, option.transform[ii]));
                    }
                }
            }
        }       
    }

    output_party[party_id].stats.effects_transform_other = stats;
}

function equip_effects_update_stats_transform_personal_all() {
    for (var i = 0; i < party_size; i++) {
        equip_effects_update_stats_transform_personal(i);
    }
}

function equip_effects_update_stats_transform_personal(party_id) {
    var stats = [];

    var user_effects = user_objects.user_party[party_id].effects;

    for (var i = 0; i < user_effects.length; i++) {
        if (user_effects[i].selected) {
            var effect = utils_array_get_by_lookup(data_effects, "id", user_effects[i].id);
            var option = effect.options[user_effects[i].option];

            if (option.transform) {
                for (var ii = 0; ii < option.transform.length; ii++) {
                    if (!option.transform[ii].character && !option.transform[ii].special) {
                        stats.push(equip_effects_return_stats_transformed(party_id, option.transform[ii]));
                    }
                }
            }
        }
    }

    output_party[party_id].stats.effects_transform_personal = stats;
}

function equip_effects_update_infusion(party_id) {
    output_party[party_id].effects.infusion = equip_effects_return_infusion(party_id);
}


function equip_effects_update_options_all() {
    for (var i = 0; i < party_size; i++) {
        equip_effects_update_options(i);
    }
}

function equip_effects_update_options(party_id) {

    var effect_list = [];
    equip_effects_update_character_options(effect_list, party_id, false);   
    output_party[party_id].effects.character = effect_list;

    var party_effect_list = [];

    for (var i = 0; i < output_resonances.length; i++) {
        var resonance = utils_array_get_by_lookup(data_resonance, "id", output_resonances[i]);
        for (var ii = 0; ii < resonance.bonus.length; ii++) {
            if (resonance.bonus[ii].apply) {
                equip_effects_update_single_option(party_effect_list, resonance.bonus[ii].apply, false, 0, { "type": "resonance", "id": resonance.vision }, party_id)
            }
        }
    }

    for (var i = 0; i < party_size; i++) {       
        if (i != party_id) {
            equip_effects_update_character_options(party_effect_list, i, true);           
        }
    }
    output_party[party_id].effects.party = party_effect_list;

   
    equip_effects_update_active_options(party_id);
}

function equip_effects_update_character_options(effect_list, party_id, party) {
    var current_character = data_characters[user_objects.user_party[party_id].id];

    for (var i = 0; i < current_character.attacks.length; i++) {
        if (current_character.attacks[i].apply) {
            var level = equip_skills_return_skill_level(party_id, current_character.attacks[i].type);
            equip_effects_update_single_option(effect_list, current_character.attacks[i].apply, party, level, { "type": "character", "id": user_objects.user_party[party_id].id }, party_id)
        }
    }

    for (var i = 0; i < current_character.passive.length; i++) {
        if (user_objects.user_party[party_id].level >= current_character.passive[i].level && current_character.passive[i].apply) {
            var level = equip_skills_return_skill_level(party_id, current_character.passive[i].type);
            equip_effects_update_single_option(effect_list, current_character.passive[i].apply, party, level, { "type": "character", "id": user_objects.user_party[party_id].id }, party_id)
        }
    }

    for (var i = 0; i < current_character.const.length; i++) {
        if (user_objects.user_party[party_id].constel > i && current_character.const[i].apply) {
            var level = equip_skills_return_skill_level(party_id, current_character.const[i].type);
            equip_effects_update_single_option(effect_list, current_character.const[i].apply, party, level, { "type": "character", "id": user_objects.user_party[party_id].id }, party_id)
        }
    }

    var current_weapon = utils_array_get_by_lookup(data_weapons[output_party[party_id].weapon_type], "id", user_objects.user_party[party_id].weapon.id);

    if (current_weapon.apply_effect) {
        equip_effects_update_single_option(effect_list, current_weapon.apply_effect, party, user_objects.user_party[party_id].weapon.refine, { "type": "weapon","id": current_weapon.id }, party_id)
    }

    for (const [key, value] of Object.entries(output_party[party_id].artifacts.sets)) {
        var artifact_set = utils_array_get_by_lookup(data_artifact_sets, "id", key);
        for (var i = 0; i < artifact_set.set_bonus.length; i++) {
            if (value >= artifact_set.set_bonus[i].req && artifact_set.set_bonus[i].apply) {
                equip_effects_update_single_option(effect_list, artifact_set.set_bonus[i].apply, party, 0, { "type": "artifact_set", "id": artifact_set.id }, party_id)
            }
        }
    }
}

function equip_effects_update_single_option(effect_list, apply, party = false, offset = 0, source, source_party) {
    if (Array.isArray(apply)) {
        for (var i = 0; i < apply.length; i++) {
            equip_effects_update_single_option(effect_list, apply[i], party, offset, source, source_party)
        }
    } else {
        if ((!party && !apply.noself) || (party && apply.party)) {
            if (apply.special) {
                equip_effects_update_special_option(effect_list, apply, offset, source, source_party);
            } else {
                var offset_val = 0;
                var max_id = apply.id;
                if (apply.offset) {
                    offset_val = apply.offset[offset];
                    max_id = apply.id + apply.offset.slice(-1)[0];
                }

                if (apply.option || apply.option === 0) {
                    effect_list.push(
                        { "id": apply.id + offset_val, "option": apply.option, "source": source, "base_id": apply.id, "max_id": max_id, "multi": apply.multi, "source_party": source_party }
                    )
                } else {
                    effect_list.push(
                        { "id": apply.id + offset_val, "option": 0, "source": source, "base_id": apply.id, "max_id": max_id, "multi": apply.multi, "source_party": source_party }
                    )
                }
            }            
        }
        
    }
}

function equip_effects_update_special_option(effect_list, apply, offset, source, source_party) {
    switch (apply.special) {
        case "illusory_heart":
            var pyro_count = equip_character_return_vision_count("pyro");
            if (user_objects.user_party[equip_character_return_party_id_by_name("nahida")].constel >= 1) {
                pyro_count += 1;
            }           
            if (pyro_count > 0) {
                var max_id = apply.id + 29;
                var offset_val = apply.offset[offset];
                if (pyro_count > 1) {
                    offset_val += 15;
                }
                effect_list.push(
                    { "id": apply.id + offset_val, "option": 0, "source": source, "base_id": apply.id, "max_id": max_id, "source_party": source_party }
                )
            }
            break;
        case "scroll_of_the_hero_of_cinder_city":
            var offset_val = 0;
            var max_id = apply.id + 1;
            if (data_characters[user_objects.user_party[source_party].id].nation == "natlan") {
                offset_val = 1;
            }
            effect_list.push(
                { "id": apply.id + offset_val, "option": 0, "source": source, "base_id": apply.id, "max_id": max_id, "source_party": source_party }
            )
            break;
        case "lithic":
            var liyue_count = equip_character_return_nation_count("liyue");
            if (liyue_count > 0) {
                var max_id = apply.id + 19;
                var offset_val = apply.offset[offset] + (liyue_count-1)*5;

                effect_list.push(
                    { "id": apply.id + offset_val, "option": 0, "source": source, "base_id": apply.id, "max_id": max_id, "source_party": source_party }
                )
            }
            break;
        case "min_geo_3":
            if (equip_character_return_vision_count("geo") >= 3) {
                effect_list.push(
                    { "id": apply.id, "option": 0, "source": source, "base_id": apply.id, "max_id": apply.id, "source_party": source_party }
                )
            }
            break;
        case "geo_1_2_3": 
            var geo_count = equip_character_return_vision_count("geo");
            if (geo_count > 0) {
                var max_id = apply.id + 2;
                var offset_val = geo_count - 1;
                if (offset_val > 2) {
                    offset_val = 2;
                }

                effect_list.push(
                    { "id": apply.id + offset_val, "option": 0, "source": source, "base_id": apply.id, "max_id": max_id, "source_party": source_party }
                )
            }
            
            break;


        case "pyro_1_2_3":
            var pyro_count = equip_character_return_vision_count("pyro");
            if (pyro_count > 0) {
                var max_id = apply.id + 2;
                var offset_val = pyro_count - 1;
                if (offset_val > 2) {
                    offset_val = 2;
                }

                effect_list.push(
                    { "id": apply.id + offset_val, "option": 0, "source": source, "base_id": apply.id, "max_id": max_id, "source_party": source_party }
                )
            }

            break;

        case "phec_1_2":
            var pyro_count = equip_character_return_vision_count("pyro");
            var hydro_count = equip_character_return_vision_count("hydro");
            var electro_count = equip_character_return_vision_count("electro");
            var cryo_count = equip_character_return_vision_count("cryo");

            var phec_count = pyro_count + hydro_count + electro_count + cryo_count;

            if (phec_count > 0) {
                var max_id = apply.id + 1;
                var offset_val = 0;
                if (phec_count > 1) {
                    offset_val = 1;
                }

                effect_list.push(
                    { "id": apply.id + offset_val, "option": 0, "source": source, "base_id": apply.id, "max_id": max_id, "source_party": source_party }
                )
            }

            break;

        case "elemental_types":
            var different_elements = equip_character_return_vision_count("unique");
            var max_id = apply.id + 3;
            var offset_val = different_elements - 1;

            effect_list.push(
                { "id": apply.id + offset_val, "option": 0, "source": source, "base_id": apply.id, "max_id": max_id, "source_party": source_party }
            )

            break;

        case "same_element":
            var vision = data_characters[user_objects.user_party[source_party].id].vision;
            var same_element = equip_character_return_vision_count(vision);
           
            if (apply.offset) {
                var offset_val = apply.offset[offset] + (same_element - 1) * 5;
                var max_id = apply.id + apply.offset.slice(-1)[0] + apply.offset.length * 3;
            } else {
                var offset_val = same_element - 1;
                var max_id = apply.id + 3;
            }
            
            effect_list.push(
                { "id": apply.id + offset_val, "option": 0, "source": source, "base_id": apply.id, "max_id": max_id, "source_party": source_party }
            )

            break;

        case "chiucue_mix":
            var current_vision = data_characters[user_objects.user_party[source_party].id].vision;
            var max_id = apply.id + 3;
            if (current_vision == "geo") {
                effect_list.push(
                    { "id": apply.id, "option": 0, "source": source, "base_id": apply.id, "max_id": max_id, "source_party": source_party }
                )
            } else if (current_vision == "pyro") {
                effect_list.push(
                    { "id": apply.id + 1, "option": 0, "source": source, "base_id": apply.id, "max_id": max_id, "source_party": source_party }
                )
            } else if (current_vision == "hydro") {
                effect_list.push(
                    { "id": apply.id + 2, "option": 0, "source": source, "base_id": apply.id, "max_id": max_id, "source_party": source_party }
                )
            } else if (current_vision == "cryo") {
                effect_list.push(
                    { "id": apply.id + 3, "option": 0, "source": source, "base_id": apply.id, "max_id": max_id, "source_party": source_party }
                )
            }
            break;

        case "fontaine":
            var fontaine_count = equip_character_return_nation_count("fontaine");
            var max_id = apply.id + 3;
            var offset_val = fontaine_count - 1;

            effect_list.push(
                { "id": apply.id + offset_val, "option": 0, "source": source, "base_id": apply.id, "max_id": max_id, "source_party": source_party }
            )
            break;

        case "natlan_different_element":

            var vision = data_characters[user_objects.user_party[source_party].id].vision;

            var count = 0;
            for (var i = 0; i < party_size; i++) {
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

            

            break;

        case "const_1":
            var constel = user_objects.user_party[source_party].constel;
            var max_id = apply.id + 1;
            var offset_val = 0;
            if (constel >= 1) {
                offset_val = 1
            }
            effect_list.push(
                { "id": apply.id + offset_val, "option": 0, "source": source, "base_id": apply.id, "max_id": max_id, "source_party": source_party }
            )
            break;

        case "const_2":
            var constel = user_objects.user_party[source_party].constel;
            var max_id = apply.id + 1;
            var offset_val = 0;
            if (constel >= 2) {
                offset_val = 1
            }
            effect_list.push(
                { "id": apply.id + offset_val, "option": 0, "source": source, "base_id": apply.id, "max_id": max_id, "source_party": source_party }
            )
            break;

        default:
            return 
    }
}

function equip_effects_update_active_options_all() {
    for (var i = 0; i < party_size; i++) {
        equip_effects_update_active_options(i);
    }
}

function equip_effects_update_active_options(party_id) {

    for (var i = user_objects.user_party[party_id].effects.length - 1; i >= 0; i--) {
        var found = false;
        var user_effect = user_objects.user_party[party_id].effects[i];

        if (!user_effect.manual) {

            if (user_effect.selected == false && user_effect.option == 0) {
                user_objects.user_party[party_id].effects.splice(i, 1);
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
                    utils_log_debug("Removing effect id: " + user_effect.id);
                    user_objects.user_party[party_id].effects.splice(i, 1);
                }
            }    
        }      
    }
}

function equip_effects_update_multi_options(party_id) {
    var multi_effects = [];

    for (var i = 0; i < effect_types_auto.length; i++) {
        for (var ii = 0; ii < output_party[party_id].effects[effect_types_auto[i]].length; ii++) {
            var output_effect = output_party[party_id].effects[effect_types_auto[i]][ii];
            if (output_effect.multi) {
                multi_effects.push({ "type": effect_types_auto[i], "i": ii, "base_id": output_effect.base_id, "uncounted":false })
            }
        }
    }

    for (var i = 0; i < multi_effects.length; i++) {
        if (multi_effects[i].uncounted) {
            var multi = 0;
            for (var ii = 0; ii < multi_effects.length; ii++) {
                if (multi_effects[i].base_id == multi_effects[i].base_id) {

                }
            }
        }
    }

    console.log(multi_effects);
}

function equip_effects_display_all() {
    for (var i = 0; i < effect_types_auto.length; i++) {
        equip_effects_display(effect_types_auto[i]);
    }
    equip_effects_display_manual();
}

function equip_effects_display_manual() {
    var parent = document.getElementById("effects_container_manual");
    utils_delete_children(parent, 0);

    var manual_index = 0;
    for (var i = 0; i < user_objects.user_party[user_objects.user_active_character].effects.length; i++) {
        var user_effect = user_objects.user_party[user_objects.user_active_character].effects[i];
        
        if (user_effect.manual) {
            let effect = utils_array_get_by_lookup(data_effects, "id", user_effect.id);
            let selected_option = utils_array_get_by_lookup(effect.options, "id", user_effect.option);
            var effect_obj = utils_create_obj("div", "effect_row");

            var effect_left = utils_create_obj("div", "effect_col");
            effect_obj.appendChild(effect_left);

            effect_left.appendChild(equip_effects_return_manual_selector(effect, manual_index));

            if (effect.options.length > 1) {
                effect_left.appendChild(equip_effects_return_options_manual_selector(effect, manual_index, selected_option));
            }

            effect_obj.appendChild(equip_effects_return_effect_right(selected_option, user_objects.user_active_character));
            let delete_index = manual_index;
            effect_obj.appendChild(utils_create_img_btn("delete-forever", function (event) { equip_effects_change_delete_manual(delete_index) }, "Delete"));

            manual_index += 1;

            parent.appendChild(effect_obj);
        }

    }
}

function equip_effects_display(effect_type) {

    var parent = document.getElementById("effects_container_" + effect_type);
    utils_delete_children(parent, 0);

    var possible_effects = output_party[user_objects.user_active_character].effects[effect_type];

    for (var i = 0; i < possible_effects.length; i++) {
        let effect = utils_array_get_by_lookup(data_effects, "id", possible_effects[i].id);
        let user_select = equip_effects_return_user_select(user_objects.user_active_character, effect.id, possible_effects[i].source_party)
        let selected_option = utils_array_get_by_lookup(effect.options, "id", user_select.option);
        var effect_obj = utils_create_obj("div", "effect_row");

        if (user_select.selected) {
            var toggle_class = "active";
        } else {
            var toggle_class = "inactive";
        }
        
        var effect_toggle = utils_create_obj("div", "effect_toggle " + toggle_class, "effect_toggle_" + effect_type + "_" + effect.id);
        let possible_eff = possible_effects[i];
        effect_toggle.onclick = function (event) { equip_effects_change_selected(possible_eff) };
        effect_obj.appendChild(effect_toggle);

        var display_source = utils_create_obj("div", "effect_source");
        display_source.appendChild(utils_create_img("effect_source_img", null, equip_effects_return_source_icon(possible_eff)));
        effect_obj.appendChild(display_source);

        var effect_left = utils_create_obj("div", "effect_col");
        effect_obj.appendChild(effect_left);

        effect_left.appendChild(utils_create_obj("div", "effect_name", null, effect.name));

        if (effect.options.length > 1) {
            effect_left.appendChild(equip_effects_return_options_selector(effect, selected_option, possible_eff));
        }

        effect_obj.appendChild(equip_effects_return_effect_right(selected_option, possible_eff.source_party));

        parent.appendChild(effect_obj);
    }
}

function equip_effects_return_manual_selector(current_effect, manual_index) {
    let option_container = utils_create_obj("div", "container");
    let option = utils_create_obj("div", "icon_selects effect_manual", "effect_manual_" + manual_index);
    option.onclick = function (event) { utils_create_prompt_values(option.id, equip_effects_change_manual, equip_effects_return_manual_options(), manual_index, option_container); event.preventDefault(); };
    option_container.appendChild(option);
    option.appendChild(utils_create_obj("div", "icon_selects_text", null, current_effect.name));
    return option_container;
}

function equip_effects_return_options_selector(effect, selected_option, possible_eff) {
    let option_container = utils_create_obj("div", "container");
    let option = utils_create_obj("div", "icon_selects effect_option", "effect_option_" + effect.id);
    option.onclick = function (event) { utils_create_prompt_values(option.id, equip_effects_change_option, equip_effects_return_options(effect), possible_eff, option_container); event.preventDefault(); };
    option_container.appendChild(option);
    option.appendChild(utils_create_obj("div", "icon_selects_text", null, selected_option.name));
    return option_container;
}

function equip_effects_return_options_manual_selector(current_effect, manual_index, selected_option) {
    let option_container = utils_create_obj("div", "container");
    let option = utils_create_obj("div", "icon_selects effect_option", "effect_option_" + current_effect.id);
    option.onclick = function (event) { utils_create_prompt_values(option.id, equip_effects_change_manual_option, equip_effects_return_options(current_effect), manual_index, option_container); event.preventDefault(); };
    option_container.appendChild(option);
    option.appendChild(utils_create_obj("div", "icon_selects_text", null, selected_option.name));
    return option_container;
}

function equip_effects_return_effect_right(selected_option, source_party) {
    var effect_right = utils_create_obj("div", "effect_col");

    if (selected_option.stats) {
        for (var ii = 0; ii < selected_option.stats.length; ii++) {
            effect_right.appendChild(utils_create_bonus(selected_option.stats[ii]));
        }
    }
    if (selected_option.transform) {
        for (var ii = 0; ii < selected_option.transform.length; ii++) {
            effect_right.appendChild(equip_effects_return_transform_statline(selected_option.transform[ii], source_party));
        }
    }

    if (selected_option.bonusdmg) {
        for (var ii = 0; ii < selected_option.bonusdmg.length; ii++) {
            effect_right.appendChild(equip_effects_return_bonusdmg_statline(selected_option.bonusdmg[ii]));
        }
    }

    if (selected_option.infusion) {
        effect_right.appendChild(utils_create_statline(visions_variables[selected_option.infusion.vision].name + " Infusion", null));
    }

    if (selected_option.conversion) {
        effect_right.appendChild(utils_create_statline(visions_variables[selected_option.conversion].name + " Conversion", null));
    }

    return effect_right;
}

function equip_effects_return_transform_statline(transform, source_party) {
    if (transform.custom_name) {
        var text = transform.custom_name;
    } else {
        var sourcename = data_stats[transform.source].name;
        var targetname = data_stats[transform.target].name;
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
        }
        var text = sourcename + text_min + " to " + targetname + text_max;
    }
    return utils_create_statline(text, utils_number_format(Math.round(transform.ratio * 10000) / 100) + "%", "value_transform");
}

function equip_effects_return_bonusdmg_statline(bonusdmg) {
    if (bonusdmg.custom_name) {
        var text = bonusdmg.custom_name;
    } else {
        var sourcename = data_stats[bonusdmg.source].name;

        var text_min = "";
        if (bonusdmg.min) {
            text_min = " over&nbsp;" + utils_number_format(bonusdmg.min);
        }
        var text_max = "";
        if (bonusdmg.max) {
            text_max = " (Max&nbsp;" + utils_number_format(bonusdmg.max) + ")";
        }
        var targetname = "";
        if (bonusdmg.target_vision != "all") {
            targetname += " " + visions_variables[bonusdmg.target_vision].name;
        }
        if (bonusdmg.target_type != "all") {
            targetname += " " + bonusdmg_names[bonusdmg.target_type];
        }
        if (targetname == "") {
            targetname = " All Damage";
        }

        if (bonusdmg.character) {
            sourcename = equip_character_return_short_name(bonusdmg.character) + "'s " + sourcename;
        }
        var text = sourcename + text_min + " to" + targetname + text_max;
    }
    return utils_create_statline(text, utils_number_format(Math.round(bonusdmg.ratio * 10000) / 10000) + "%", "value_bonusdmg");
}

function equip_effects_return_options(effect) {
    var options = [];

    for (var i = 0; i < effect.options.length; i++) {
        options.push(effect.options[i].name);
    }
    return options;
}

function equip_effects_return_user_select(party_id, effect_id, source_party) {

    var user_effects = user_objects.user_party[party_id].effects;

    for (var i = 0; i < user_effects.length; i++) {
        if (user_effects[i].id == effect_id && user_effects[i].source_party == source_party) {
            return user_objects.user_party[party_id].effects[i];
        }
    }

    return { "id": effect_id, "option": 0, "selected": false, "manual": false };

}

function equip_effects_return_manual_options() {
    var user_effects = user_objects.user_party[user_objects.user_active_character].effects;
    var selected_manual = [];

    for (var i = 0; i < user_effects.length; i++) {
        if (user_effects[i].id > 0 && user_effects[i].manual) {
            selected_manual.push(user_effects[i].id)
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

function equip_effects_return_stats_transformed(source_party_id, transform) {
    var source_value = output_party[source_party_id].stats.total[transform.source];
    if (transform.min) {
        source_value = source_value - transform.min;
        if (source_value < 0) {
            source_value = 0;
        }
    }
    var target_value = source_value * transform.ratio;
    if (transform.max) {
        if (target_value > transform.max) {
            target_value = transform.max;
        }
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


function equip_effects_return_infusion(party_id) {

    var repeated_infusions = [];
    var single_infusion = false;
    var infusable = true;
    if (output_party[party_id].weapon_type == "bow" || output_party[party_id].weapon_type == "catalyst") {
        infusable = false;
    }

    var user_effects = user_objects.user_party[party_id].effects;
    for (var i = 0; i < user_effects.length; i++) {
        if (user_effects[i].selected) {
            var effect = utils_array_get_by_lookup(data_effects, "id", user_effects[i].id);
            var option = effect.options[user_effects[i].option];

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
