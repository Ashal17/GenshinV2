function equip_energy_change_trigger() {

    equip_energy_update_options(user_objects.user_active_character);
    equip_energy_update_selected_options(user_objects.user_active_character);
    equip_energy_update(user_objects.user_active_character);
    equip_energy_display();
    equip_storage_save_last();
}

function equip_energy_change_count_on_field(count, id) {
    equip_energy_change_count(count, id, true);
}

function equip_energy_change_count_off_field(count, id) {
    equip_energy_change_count(count, id, false);
}

function equip_energy_change_count(count, id, field) {
    count = utils_number_verify(count, 0, 0, 99);

    if (count != null) {
        var user_energy = user_objects.user_party[user_objects.user_active_character].energy;
        var found = false;
        for (var i = 0; i < user_energy.length; i++) {            
            if (user_energy[i].id == id && user_energy[i].field == field) {
                user_energy[i].count = count;
                break;
            }
        }
        if (!found) {
            user_objects.user_party[user_objects.user_active_character].energy.push(
                {
                    "id": id,
                    "count": count,
                    "field": field
                }
            )
        }
        equip_energy_change_trigger();
    }    
}

function equip_energy_update_all() {
    for (var i = 0; i < const_party_size; i++) {
        equip_energy_update_options(i);
        equip_energy_update_selected_options(i);
        equip_energy_update(i);
    }
}

function equip_energy_update(party_id) {
    var recharge = output_party[party_id].stats.initial.total.recharge;
    var vision = data_characters[user_objects.user_party[party_id].id].vision;
    var required_energy = output_party[party_id].stats.initial.total.burst_energy;

    var raw_energy = 0;
    var raw_recharge_energy = 0;

    for (var i = 0; i < user_objects.user_party[party_id].energy.length; i++) {
        var user_energy_obj = user_objects.user_party[party_id].energy[i];
        var output_energy_obj = utils_array_get_by_lookup(output_party[party_id].energy.source, "id", user_energy_obj.id);
        var energy_obj = utils_array_get_by_lookup(data_energy, "id", user_energy_obj.id);
        if (Array.isArray(energy_obj.value)) {
            var energy_value = energy_obj.value[output_energy_obj.value_id];
        } else {
            var energy_value = energy_obj.value;
        }
        energy_value *= user_energy_obj.count;
        if (energy_obj.type == "energy") {
            raw_energy += energy_value;
        } else {     
            if (energy_obj.type == "orb") {
                energy_value *= 3;
            }

            if (energy_obj.vision && (energy_obj.vision == vision || energy_obj.vision == "same")) {
                energy_value *= 3;
            } else if (!energy_obj.vision) {
                energy_value *= 2;
            }

            if (!user_energy_obj.field) {
                energy_value *= 0.6;
            }

            raw_recharge_energy += energy_value;
        }
    }
    
    output_party[party_id].energy.energy_raw = raw_energy;
    output_party[party_id].energy.energy_raw_recharge = raw_recharge_energy;
    output_party[party_id].energy.energy_required = required_energy;
    output_party[party_id].energy.energy_total = raw_energy + (raw_recharge_energy * recharge / 100);
    output_party[party_id].energy.recharge_current = recharge;
    if (raw_recharge_energy) {
        output_party[party_id].energy.recharge_required = (required_energy - raw_energy) / raw_recharge_energy * 100;
    } else {
        output_party[party_id].energy.recharge_required = null
    }
    
}

function equip_energy_update_selected_options(party_id) {
    for (var i = user_objects.user_party[party_id].energy.length - 1; i >= 0; i--) {
        var user_energy_obj = user_objects.user_party[party_id].energy[i];
        if (user_energy_obj.count == 0) {
            user_objects.user_party[party_id].energy.splice(i, 1);
        } else {
            var duplicity = false;
            for (var ii = 0; ii < i; ii++) {
                var user_energy_obj_check = user_objects.user_party[party_id].energy[ii];
                if (user_energy_obj.id == user_energy_obj_check.id && user_energy_obj.field == user_energy_obj_check.field) {
                    duplicity = true;
                }
            }
            if (duplicity) {
                utils_log_debug("Removing duplicate energy id: " + user_objects.user_party[party_id].energy[i].id);
                user_objects.user_party[party_id].energy.splice(i, 1);
            } else {
                var found = false;
                for (var ii = 0; ii < output_party[party_id].energy.source.length; ii++) {
                    var output_energy_obj = output_party[party_id].energy.source[ii];
                    if (user_energy_obj.id == output_energy_obj.id) {
                        if (user_energy_obj.field) {
                            output_energy_obj.on_field = user_energy_obj.count;
                        } else {
                            output_energy_obj.off_field = user_energy_obj.count;
                        }
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    utils_log_debug("Removing energy id: " + user_objects.user_party[party_id].energy[i].id);
                    user_objects.user_party[party_id].energy.splice(i, 1);
                }
            }            
        }
    }
}

function equip_energy_update_options(party_id) {

    var energy_source_list = [];
    equip_energy_update_character_options(energy_source_list, party_id, party_id)

    for (var i = 0; i < const_party_size; i++) {
        if (i != party_id) {
            equip_energy_update_character_options(energy_source_list, i, party_id);
        }
    }

    for (var i = 0; i < output_resonances.length; i++) {
        if (output_resonances[i].active) {
            var resonance = data_resonance[i];
            if (!resonance.personal) {
                for (var ii = 0; ii < resonance.bonus.length; ii++) {
                    if (resonance.bonus[ii].energy) {
                        equip_energy_update_group_options(
                            energy_source_list,
                            resonance.bonus[ii].energy,
                            {
                                "party_id": null,
                                "type": "svg",
                                "id": resonance.icon,
                                "name": resonance.name
                            },
                            party_id
                        )
                    }
                }
            }
        }
    }

    equip_energy_update_group_options(
        energy_source_list,
        const_energy_other,
        {
            "party_id": null,
            "type": "svg",
            "id": "energy",
            "name": "Generic"
        },
        party_id
    )

    output_party[party_id].energy.source = energy_source_list;

}

function equip_energy_update_character_options(energy_source_list, source_party_id, party_id) {
    var current_character_id = user_objects.user_party[source_party_id].id;
    var current_character = data_characters[current_character_id];

    if (current_character.energy) {
        equip_energy_update_group_options(
            energy_source_list,
            current_character.energy,
            {
                "party_id": source_party_id,
                "type": "character",
                "id": current_character_id,
                "name": current_character.name
            },
            party_id
        )
    }

    for (var i = 0; i < current_character.passive.length; i++) {
        if (user_objects.user_party[source_party_id].level >= current_character.passive[i].level && current_character.passive[i].energy) {
            equip_energy_update_group_options(
                energy_source_list,
                current_character.passive[i].energy,
                {
                    "party_id": source_party_id,
                    "type": "character",
                    "id": current_character_id,
                    "name": current_character.name
                },
                party_id
            )
        }
    }

    for (var i = 0; i < current_character.const.length; i++) {
        if (user_objects.user_party[source_party_id].constel > i && current_character.const[i].energy) {
            equip_energy_update_group_options(
                energy_source_list,
                current_character.const[i].energy,
                {
                    "party_id": source_party_id,
                    "type": "character",
                    "id": current_character_id,
                    "name": current_character.name
                },
                party_id
            )
        }
    }

    var current_weapon = utils_array_get_by_lookup(data_weapons[output_party[source_party_id].weapon_type], "id", user_objects.user_party[source_party_id].weapon.id);
    if (current_weapon.energy) {
        equip_energy_update_group_options(
            energy_source_list,
            current_weapon.energy,
            {
                "party_id": source_party_id,
                "type": "weapon",
                "id": user_objects.user_party[source_party_id].weapon.id,
                "name": current_weapon.name
            },
            party_id            
        )
    }

    for (const [key, value] of Object.entries(output_party[source_party_id].artifacts.sets)) {
        var artifact_set = utils_array_get_by_lookup(data_artifact_sets, "id", key);
        for (var i = 0; i < artifact_set.set_bonus.length; i++) {
            if (value >= artifact_set.set_bonus[i].req && artifact_set.set_bonus[i].energy) {
                equip_energy_update_group_options(
                    energy_source_list,
                    artifact_set.set_bonus[i].energy,
                    {
                        "party_id": source_party_id,
                        "type": "artifact_set",
                        "id": key,
                        "name": artifact_set.name
                    },
                    party_id
                )
            }
        }
    }

    for (var i = 0; i < output_resonances.length; i++) {
        if (output_resonances[i].active) {
            var resonance = data_resonance[i];
            if (resonance.personal) {
                for (var ii = 0; ii < resonance.bonus.length; ii++) {
                    if (resonance.bonus[ii].energy) {
                        equip_energy_update_group_options(
                            energy_source_list,
                            resonance.bonus[ii].energy,
                            {
                                "party_id": source_party_id,
                                "type": "svg",
                                "id": resonance.icon,
                                "name": current_character.name
                            },
                            party_id
                        )
                    }
                }
            }
        }
    }    
}

function equip_energy_update_group_options(energy_source_list, energy_list, source, party_id) {
    for (var i = 0; i < energy_list.length; i++) {
        var energy = utils_array_get_by_lookup(data_energy, "id", energy_list[i].id);
        if (((party_id == source.party_id && !energy.noself) || energy.type != "energy" || energy.party) && utils_array_lookup_parameter(energy_source_list, "id", energy_list[i].id) == -1) {
            var value_id = null;
            if (energy.source && Array.isArray(energy.value)) {
                if (["normal", "skill", "burst"].includes(energy.source)) {
                    value_id = equip_skills_return_skill_level(source.party_id, energy.skill);
                } else if (energy.source == "weapon") {
                    value_id = user_objects.user_party[source.party_id].weapon.refine;
                }
            } 
            if (energy.special && !equip_energy_return_special_condition(energy, party_id, source.party_id)) {
                continue;
            }
            energy_source_list.push(
                {
                    "id": energy_list[i].id,
                    "value_id": value_id,
                    "source": source,
                    "on_field": 0,
                    "off_field": 0
                }
            )
        }
    }
}

function equip_energy_display() {
    var parent_input = document.getElementById("energy_container_input");
    utils_delete_children(parent_input, 0);

    for (var i = 0; i < output_party[user_objects.user_active_character].energy.source.length; i++) {
        parent_input.appendChild(equip_energy_display_option(i))
    }

    var parent_output = document.getElementById("energy_container_output");
    utils_delete_children(parent_output, 0);

    for (const [output_type, output_name] of Object.entries(const_energy_outputs)) {
        if (output_party[user_objects.user_active_character].energy[output_type] !== null) {
            parent_output.appendChild(equip_energy_display_output(output_type, output_name));
        }        
    }
    
}

function equip_energy_display_option(index) {

    var output_energy = output_party[user_objects.user_active_character].energy.source[index];
    var energy = utils_array_get_by_lookup(data_energy, "id", output_energy.id);

    if (energy.vision && energy.vision == "same") {
        var vision = data_characters[user_objects.user_party[user_objects.user_active_character].id].vision;
    } else {
        var vision = energy.vision;
    }

    var obj = utils_create_obj("div", "energy_option_row " + vision);

    var display_source = utils_create_obj("div", "effect_source");
    if (output_energy.source.type == "svg") {
        display_source.appendChild(utils_create_label_img(output_energy.source.id, output_energy.source.name, null, null, "effect_source_img"))
    } else {
        display_source.appendChild(utils_create_img("effect_source_img img_icon", null, equip_effects_return_source_icon(output_energy.source, output_energy.source.party_id), output_energy.source.name));
    }
    obj.appendChild(display_source);

    obj.appendChild(utils_create_obj("p", "energy_option_name", null, energy.name));

    var on_field_count_container = utils_create_obj("div", "container energy_option_count energy_on_field", null);
    var on_field_count_val = utils_create_obj("div", "icon_selects  energy_option_count_val", "energy_option_count_val_on_" + index);
    on_field_count_val.onclick = function (event) { utils_create_prompt_input(null, on_field_count_val.id, equip_energy_change_count_on_field, output_energy.id, output_energy.on_field, on_field_count_container); event.preventDefault(); };
    on_field_count_container.appendChild(on_field_count_val);
    on_field_count_val.appendChild(utils_create_obj("div", "icon_selects_text", null, output_energy.on_field));
    obj.appendChild(on_field_count_container);

    obj.appendChild(utils_create_label_img("account-outline", "On-field", null, null, "energy_option_val_desc energy_on_field"));

    var off_field_count_container = utils_create_obj("div", "container energy_option_count energy_off_field", null);
    var off_field_count_val = utils_create_obj("div", "icon_selects  energy_option_count_val", "energy_option_count_val_off_" + index);
    off_field_count_val.onclick = function (event) { utils_create_prompt_input(null, off_field_count_val.id, equip_energy_change_count_off_field, output_energy.id, output_energy.off_field, off_field_count_container); event.preventDefault(); };
    off_field_count_container.appendChild(off_field_count_val);
    off_field_count_val.appendChild(utils_create_obj("div", "icon_selects_text", null, output_energy.off_field));
    obj.appendChild(off_field_count_container);

    obj.appendChild(utils_create_label_img("account-group-outline", "Off-field", null, null, "energy_option_val_desc energy_off_field"));

    if (output_energy.value_id !== null) {
        var energy_value = energy.value[output_energy.value_id]
    } else {
        var energy_value = energy.value;
    }
    obj.appendChild(utils_create_obj("p", "energy_option_value", null, energy_value + " &times;"));

    var type_desc = utils_capitalize(energy.type);
    if (vision) {
        if (vision == "other") {
            type_desc = "Other Element " + type_desc;
        } else {
            type_desc = utils_capitalize(vision) + " " + type_desc;
        }        
    } else if (!(energy.type == "energy")) {
        type_desc = "Blank " + type_desc;
    }
    obj.appendChild(utils_create_label_img(energy.type, type_desc));

    return obj;
}

function equip_energy_display_output(output_type, output_name) {
    var obj = utils_create_obj("div", "energy_output");

    obj.appendChild(utils_create_img_svg(output_type.split("_")[0]));
    obj.appendChild(utils_create_obj("p", "energy_output_text", null, output_name));

    var output_value = utils_number_format(output_party[user_objects.user_active_character].energy[output_type], 2);
    if (output_type.startsWith("recharge")) {
        output_value += "%";
    }
    obj.appendChild(utils_create_obj("p", "energy_output_val", null, output_value));

    return obj;
}

function equip_energy_return_special_condition(energy, party_id, source_party_id) {
    var result = false;
    switch (energy.special) {
        case "hexenzirkel_2":
            if (equip_character_return_variable_count("hexenzirkel") >= 2) {
                result = true;
            }
            break;

        case "electro":
            if (data_characters[user_objects.user_party[party_id].id].vision == "electro") {
                result = true
            }
            break;

        case "anemo_pyro_hydro_electro_cryo":
            if (["anemo", "pyro", "hydro", "electro", "cryo"].includes(data_characters[user_objects.user_party[party_id].id].vision)) {
                result = true
            }
            break;

        case "burst_1_3":
            if (equip_skills_return_skill_level(source_party_id, "burst") < 4) {
                result = true;
            }
            break;

        case "burst_4_6":
            if (equip_skills_return_skill_level(source_party_id, "burst") >= 4 && equip_skills_return_skill_level(source_party_id, "burst") < 7) {
                result = true;
            }
            break;

        case "burst_7_15":
            if (equip_skills_return_skill_level(source_party_id, "burst") >= 7) {
                result = true;
            }
            break;

        default:

    }

    return result;
}

