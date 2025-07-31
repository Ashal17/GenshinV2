function equip_stats_load_preferences(preferences_data = null) {
    user_preferences.stats = {};

    user_preferences.stats.detail = utils_object_get_value(preferences_data, "stats.detail", []);

    if (user_preferences.stats.detail.length != const_display_stats_columns.length) {
        user_preferences.stats.detail = [];
        for (var i = 0; i < const_display_stats_columns.length; i++) {
            user_preferences.stats.detail.push(false);
        }
    }
}

function equip_stats_change_trigger() {
    equip_stats_display_detail_all();
    utils_preferences_change_trigger();
}

function equip_stats_change_detail(index) {
    if (user_preferences.stats.detail[index]) {
        user_preferences.stats.detail[index] = false;
    } else {
        user_preferences.stats.detail[index] = true;    
    }
    equip_stats_change_trigger();
}

function equip_stats_update_total_all() {
    equip_stats_update_reset_total_all();
    equip_stats_update_add_total_all();

    equip_stats_update_add_all("total", "effects", true);
    equip_stats_update_transformation_all("main");
    equip_stats_update_transformation_all("mult");
    equip_effects_update_stats_transform_other_all();
    equip_stats_update_add_all("total", "effects_transform_other", true);
    equip_effects_update_stats_transform_personal_all();
    equip_stats_update_add_all("total", "effects_transform_personal", true);
    equip_stats_update_transformation_all("mult_trans");
    equip_stats_update_transformation_all("elemastery");
    equip_stats_update_transformation_all("merge");

    equip_stats_update_vision_stat_all();
    equip_stats_update_enemy_defense_all();

}

function equip_stats_update_reset_total_all() {
    for (var i = 0; i < const_party_size; i++) {
        equip_stats_update_reset_total(i);
    }
}

function equip_stats_update_reset_total(party_id) {
    for (const [stat_type, stat_obj] of Object.entries(const_output_party_stat_objects)) {
        output_party[party_id].stats[stat_type] = structuredClone(default_stats);
    } 
}


function equip_stats_update_add_total_all() {
    for (const [stat_type, stat_obj] of Object.entries(const_output_party_stat_objects)) {
        for (var i = 0; i < stat_obj.length; i++) {
            equip_stats_update_add_all(stat_type, stat_obj[i], false);
        }
        equip_stats_update_copy_total_all(stat_type);
    }      
}

function equip_stats_update_add_all(stat_type, stats_obj_name, skills) {
    for (var i = 0; i < const_party_size; i++) {
        equip_stats_update_add(stat_type, i, stats_obj_name, null);
        if (skills) {
            equip_stats_update_add_skills(stat_type, i, stats_obj_name)
        }
    }
}

function equip_stats_update_add_skills(stat_type, party_id, stats_obj_name) {
    for (var i = 0; i < user_objects.user_party[party_id].active_skills.length; i++) {
        var skill_effects = user_objects.user_party[party_id].active_skills[i].effects;
        if (skill_effects && skill_effects.length > 0) {
            equip_stats_update_add(stat_type, party_id, stats_obj_name, i)
        }
    }
}

function equip_stats_update_add(stat_type, party_id, stats_obj_name, skill_index = null) {
    if (skill_index === null) {
        var stats_obj = output_party[party_id].stats[stats_obj_name];
        var output_obj = output_party[party_id].stats[stat_type];
    } else {
        var stats_obj = output_party[party_id].skills.active.details[skill_index].stats[stats_obj_name];
        var output_obj = output_party[party_id].skills.active.details[skill_index].stats[stat_type];
    }
    
    for (var i = 0; i < stats_obj.length; i++) {
        if (stats_obj[i].id.endsWith("_mult") && output_obj[stats_obj[i].id] != 0) {
            output_obj[stats_obj[i].id] *= stats_obj[i].value/100;
        } else {
            output_obj[stats_obj[i].id] += stats_obj[i].value;
        }
        
    }
}

function equip_stats_update_copy_total_all(stat_type) {
    for (var i = 0; i < const_party_size; i++) {
        equip_stats_update_copy_total(stat_type, i)
    }
}

function equip_stats_update_copy_total(stat_type, party_id) {
    for (var i = 0; i < user_objects.user_party[party_id].active_skills.length; i++) {
        var skill_effects = user_objects.user_party[party_id].active_skills[i].effects;
        if (skill_effects && skill_effects.length > 0) {
            output_party[party_id].skills.active.details[i].stats[stat_type] = structuredClone(output_party[party_id].stats[stat_type]);
        }
    }
}

function equip_stats_update_transformation_all(transformation_name) {
    for (var i = 0; i < const_party_size; i++) {
        for (const [stat_type, stat_obj] of Object.entries(const_output_party_stat_objects)) {
            output_party[i].stats[stat_type] = equip_stats_calculate_tranformation(output_party[i].stats[stat_type], transformation_name);
            for (var ii = 0; ii < user_objects.user_party[i].active_skills.length; ii++) {
                var skill_effects = user_objects.user_party[i].active_skills[ii].effects;
                if (skill_effects && skill_effects.length > 0) {
                    output_party[i].skills.active.details[ii].stats[stat_type] = equip_stats_calculate_tranformation(output_party[i].skills.active.details[ii].stats[stat_type], transformation_name);
                }
            }
        }          
    }
}

function equip_stats_update_vision_stat_all() {
    for (var i = 0; i < const_party_size; i++) {
        equip_stats_update_vision_stat(i);
    }
}

function equip_stats_update_vision_stat(party_id) {
    output_party[party_id].stats.vision_stat = equip_stats_return_vision_stat(party_id);
}

function equip_stats_update_enemy_defense_all() {
    for (var i = 0; i < const_party_size; i++) {
        equip_stats_update_enemy_defense(i);
    }
}

function equip_stats_update_enemy_defense(party_id) {
    output_party[party_id].stats.total["enemyred"] = equip_stats_calculate_enemyred(output_party[party_id].stats.total, party_id);

    for (var i = 0; i < user_objects.user_party[party_id].active_skills.length; i++) {
        var skill_effects = user_objects.user_party[party_id].active_skills[i].effects;
        if (skill_effects && skill_effects.length > 0) {
            output_party[party_id].skills.active.details[i].stats.total["enemyred"] = equip_stats_calculate_enemyred(output_party[party_id].skills.active.details[i].stats.total, party_id);
        }
    }
}

function equip_stats_calculate_tranformation(stats_total, transformation_name) {
    var transform_list = data_stat_transformations[transformation_name];

    for (var i = 0; i < transform_list.length; i++) {
        mainid = transform_list[i].stat;
        mainvalue = stats_total[mainid];
        change = transform_list[i].change;

        switch (change) {
            case "mult":
                for (var j = 0; j < transform_list[i].mods.length; j++) {
                    modid = transform_list[i].mods[j];
                    modvalue = stats_total[modid] / 100 + 1;
                    mainvalue = mainvalue * modvalue;
                }
                break;
            case "mult_100":
                for (var j = 0; j < transform_list[i].mods.length; j++) {
                    modid = transform_list[i].mods[j];
                    modvalue = stats_total[modid] / 100;
                    mainvalue = mainvalue * modvalue;
                }
                break;
            case "mult_red":
                for (var j = 0; j < transform_list[i].mods.length; j++) {
                    modid = transform_list[i].mods[j];
                    modvalue = stats_total[modid];
                    mainvalue = 100 - (100 - mainvalue) * (100 - modvalue) / 100;
                }
                break;

            case "times":
                for (var j = 0; j < transform_list[i].mods.length; j++) {

                    if (isNaN(transform_list[i].mods[j])) {
                        modid = transform_list[i].mods[j];
                        modvalue = stats_total[modid] / 100;
                    } else {
                        modvalue = transform_list[i].mods[j];
                    }
                    mainvalue = mainvalue * modvalue;
                }
                break;

            case "divide":
                for (var j = 0; j < transform_list[i].mods.length; j++) {

                    if (isNaN(transform_list[i].mods[j])) {
                        modid = transform_list[i].mods[j];
                        modvalue = stats_total[modid];
                    } else {
                        modvalue = transform_list[i].mods[j];
                    }
                    mainvalue = mainvalue / modvalue;
                }
                break;

            case "add":
                for (var j = 0; j < transform_list[i].mods.length; j++) {
                    if (isNaN(transform_list[i].mods[j])) {
                        modid = transform_list[i].mods[j];
                        modvalue = stats_total[modid];
                    } else {
                        modvalue = transform_list[i].mods[j];
                    }
                    mainvalue = mainvalue + modvalue;
                }
                break;

            case "substract":
                for (var j = 0; j < transform_list[i].mods.length; j++) {
                    if (isNaN(transform_list[i].mods[j])) {
                        modid = transform_list[i].mods[j];
                        modvalue = stats_total[modid];
                    } else {
                        modvalue = transform_list[i].mods[j];
                    }
                    mainvalue = mainvalue - modvalue;
                }
                break;
            case "cap":
                var modvalue = 0;
                for (var j = 0; j < transform_list[i].mods.length; j++) {
                    if (isNaN(transform_list[i].mods[j])) {
                        modid = transform_list[i].mods[j];
                        modvalue += stats_total[modid];
                    } else {
                        modvalue += transform_list[i].mods[j];
                    }
                }
                if (mainvalue > modvalue) { mainvalue = modvalue }
                break;
            case "default":
                if (mainvalue == transform_list[i].mods[0]) {
                    mainvalue = transform_list[i].mods[1];
                }
                break;
            case "minimum":
                if (mainvalue < transform_list[i].value) { mainvalue = transform_list[i].value }
                break;
            case "elemastery":
                modvalue = stats_total["elemastery"];
                mainvalue += equip_stats_calculate_elemastery(transform_list[i].stat, modvalue);
                break;
            case "enemyres":
                if (mainvalue < 0) {
                    mainvalue = mainvalue / 2;
                } else if (mainvalue > 75) {
                    mainvalue = 100 - (100 / (4 * res + 100))
                }
                break;
        }

        stats_total[mainid] = mainvalue;
    }

    return stats_total;
}

function equip_stats_calculate_elemastery(type, value) {

    switch (type) {
        case "elemasteryadd":
            var result = value / (2000 + value);
            result = 144 / 9 * result;
            break;

        case "elemasteryaddshared":
            var result = value / (2000 + value);
            result = 54 / 9 * result;
            break;

        case "elemasterymult":
            var result = value / (1400 + value);
            result = 25 / 9 * result;
            break;

        case "elemasterycrystalize":
            var result = value / (1400 + value);
            result = 40 / 9 * result;
            break;

        case "elemasterybonus":
            var result = value / (1200 + value);
            result = 45 / 9 * result;
            break;

        default:
            throw new Error('Invalid Elemental Mastery type');
    }

    return result * 100;

}

function equip_stats_calculate_enemyred(stats_total, party_id) {

    return 100 * stats_total["enemydef"] / (stats_total["enemydef"] + (5 * const_level_list_values[user_objects.user_party[party_id].level]) + 500);

}

function equip_stats_display() {

    equip_stats_display_detail_all();
    for (var i = 0; i < const_party_size; i++) {
        equip_stats_display_unit("party", i);
    }
    equip_stats_display_unit("enemy");

}

function equip_stats_display_detail_all() {
    for (var i = 0; i < const_display_stats_columns.length; i++) {
        equip_stats_display_detail(i);
    }
}

function equip_stats_display_detail(index) {
    var parent = document.getElementById("stats_detail_column_" + index);
    utils_delete_children(parent, 0);

    if (Array.isArray(const_display_stats_columns[index].main)) {
        if (const_display_stats_columns[index].default == "vision_auto") {
            var default_stat = data_characters[user_objects.user_party[user_objects.user_active_character].id].vision
        } else {
            var default_stat = const_display_stats_columns[index].default;
        }
        var main_stat_id = equip_stats_return_highest_stat(
            output_party[user_objects.user_active_character].stats.total,
            const_display_stats_columns[index].main,
            default_stat
        )
    } else {
        var main_stat_id = const_display_stats_columns[index].main;
    }

    var main_stat_line = utils_create_obj("div", "main_statline");
    main_stat_line.appendChild(utils_create_img_svg(main_stat_id));
    main_stat_line.appendChild(utils_create_obj("p", null, null, data_stats[main_stat_id].name));
    main_stat_line.appendChild(utils_create_obj("p", null, null, utils_format_stat_value(data_stats[main_stat_id], output_party[user_objects.user_active_character].stats.total[main_stat_id])));
    main_stat_line.onclick = function (event) { equip_stats_change_detail(index); }
    parent.append(main_stat_line);

    if (user_preferences.stats.detail[index]) {
        for (var i = 0; i < const_display_stats_columns[index].stats.length; i++) {
            var stat_id = const_display_stats_columns[index].stats[i];
            parent.append(utils_create_stat(stat_id, output_party[user_objects.user_active_character].stats.total[stat_id]));
        }
    } else {
        main_stat_line.className += " detail_hidden";
    } 
}

function equip_stats_display_unit(unit, unit_id = null) {
    if (unit_id == null) {
        var parent = document.getElementById("stats_unit_" + unit);
        unit_id = user_objects.user_active_character;    
    } else {
        var parent = document.getElementById("stats_unit_" + unit + "_" + unit_id);
    }
    utils_delete_children(parent, 0);

    for (var i = 0; i < const_display_stats_units[unit].length; i++) {
        var stat_id = const_display_stats_units[unit][i];
        if (stat_id == "vision_auto") {
            stat_id = equip_stats_return_vision_stat(unit_id);
        }
        parent.appendChild(utils_create_stat_img(stat_id, output_party[unit_id].stats.total[stat_id]));
    }
}

function equip_stats_return_vision_stat(party_id) {
    return equip_stats_return_calculated_vision_stat(
        user_objects.user_party[party_id].id, output_party[party_id].stats.total);
}

function equip_stats_return_calculated_vision_stat(character_id, stats) {  
    return equip_stats_return_highest_stat(stats, const_stats_visions, data_characters[character_id].vision);
}

function equip_stats_return_highest_stat(stats, stats_ids, default_stat) {
    
    var highest_stat = default_stat;
    var highest_val = stats[default_stat];
    for (var i = 0; i < stats_ids.length; i++) {
        if (stats[stats_ids[i]] > highest_val) {
            highest_val = stats[stats_ids[i]];
            highest_stat = stats_ids[i];
        }
    }
    
    return highest_stat;
}

function equip_stats_return_display_stats(char_obj) {
    var calculate_stats = equip_stats_return_calculated_display_stats(char_obj);
    var vision_stat = equip_stats_return_calculated_vision_stat(char_obj.id, calculate_stats);
    var stats = {};

    for (var i = 0; i < const_display_stats_storage.length; i++) {
        stats[const_display_stats_storage[i]] = calculate_stats[const_display_stats_storage[i]];
    }
    stats[vision_stat] = calculate_stats[vision_stat];

    return stats;
}

function equip_stats_return_calculated_display_stats(char_obj) {
    var calculate_stats = structuredClone(default_calculate_stats);
    var stats = equip_stats_return_basic_stats(char_obj);

    for (var i = 0; i < stats.length; i++) {
        calculate_stats[stats[i].id] += stats[i].value;
    }
    calculate_stats = equip_stats_calculate_tranformation(calculate_stats, "display");
    return calculate_stats;
}

function equip_stats_return_basic_stats(char_obj) {

    var stats = [];
    stats = stats.concat(equip_stats_return_character_basic_stats(data_characters[char_obj.id], char_obj.level));
    stats = stats.concat(equip_stats_return_weapon_stats(char_obj.weapon, data_characters[char_obj.id].weapon));
    stats = stats.concat(equip_stats_return_artifacts_stats(char_obj.artifacts, equip_artifacts_return_active_sets(char_obj.artifacts)))

    return stats;    
}



function equip_stats_return_character_basic_stats(character, level) {
    var stats = [];
    for (var i = 0; i < character.stats.length; i++) {
        stats.push(
            { "id": character.stats[i].stat, "value": character.stats[i].values[level] }
        );
    }
    return stats;
}

function equip_stats_return_weapon_stats(weapon_obj, weapon_type) {
    var stats = [];
    var weapon = utils_array_get_by_lookup(data_weapons[weapon_type], "id", weapon_obj.id);

    stats.push(
        { "id": "atk_base", "value": data_weapon_stats.primary[weapon.atk_base][weapon_obj.level] }
    );

    for (var i = 0; i < weapon.stats.length; i++) {
        var stat_id = weapon.stats[i].stat;
        var value = 0;

        if (weapon.stats[i].type == "refine") {
            value = weapon.stats[i].value[weapon_obj.refine];
        } else if (weapon.stats[i].type == "level") {
            value = data_weapon_stats.secondary[weapon.stats[i].value][Math.round(weapon_obj.level / 2)];
        } else if (weapon.stats[i].type == "flat") {
            value = weapon.stats[i].value;
        }

        stats.push(
            { "id": stat_id, "value": value }
        );
    }
    return stats;
}

function equip_stats_return_artifacts_stats(artifacts, sets) {

    var stats = [];

    for (var i = 0; i < const_artifact_types.length; i++) {
        var artifact_id = const_artifact_types[i];
        var current_artifact = artifacts[artifact_id];

        stats.push(
            { "id": current_artifact.main_stat, "value": equip_artifacts_return_main_value(current_artifact) }
        );

        for (var ii = 0; ii < const_artifact_sub_stats; ii++) {
            stats.push(
                { "id": current_artifact.sub_stats[ii].id, "value": current_artifact.sub_stats[ii].value }
            );
        }
    }

    for (const [key, value] of Object.entries(sets)) {
        var artifact_set = utils_array_get_by_lookup(data_artifact_sets, "id", key);
        for (var i = 0; i < artifact_set.set_bonus.length; i++) {
            if (value >= artifact_set.set_bonus[i].req && artifact_set.set_bonus[i].stat) {
                stats.push(
                    { "id": artifact_set.set_bonus[i].stat, "value": artifact_set.set_bonus[i].value }
                );
            }
        }
    }

    return stats;
}
