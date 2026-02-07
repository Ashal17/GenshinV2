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
    equip_stats_update_artifact_optimize_setup_all();
    equip_stats_update_reset_total_all();
    equip_stats_update_add_total_all();
    equip_stats_update_add_artifact_optimize_all();

    equip_stats_update_copy_total_all("effects", false);
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

function equip_stats_update_artifact_optimize_setup_all() {

    var optimize_stats_party = [];
    for (var i = 0; i < const_party_size; i++) {
        optimize_stats_party.push(structuredClone(equip_stats_return_artifact_optimize_setup(i)));
    }    

    for (var i = 0; i < const_party_size; i++) {
        var optimize_personal = [];
        optimize_personal = optimize_personal.concat(optimize_stats_party[i][i]);
        for (var ii = 0; ii < const_party_size; ii++) {
            optimize_personal = optimize_personal.concat(optimize_stats_party[ii][i]);
        }
        optimize_stats_party[i][i] = optimize_personal;        

        for (var ii = 0; ii < const_party_size; ii++) {
            optimize_stats_party[i][ii] = [...new Set(optimize_stats_party[i][ii])];
        }
        output_party[i].artifacts.optimize_stats = optimize_stats_party[i];

        equip_stats_update_artifact_optimize_setup(i, null);
        for (var ii = 0; ii < user_objects.user_party[i].active_skills.length; ii++) {
            var skill_effects = user_objects.user_party[i].active_skills[ii].effects;
            if (skill_effects && skill_effects.length > 0) {
                equip_stats_update_artifact_optimize_setup(i, ii);
            }
        }
    }
}

function equip_stats_update_artifact_optimize_setup(party_id, skill_index) {
    if (skill_index == null) {
        var output_stats = output_party[party_id].stats;
    } else {
        var output_stats = output_party[party_id].skills.active.details[skill_index].stats;
    }
    var optimize_stats = output_party[party_id].artifacts.optimize_stats;

    for (var i = 0; i < optimize_stats.length; i++) {
        output_stats.optimize[i] = {};
        for (var ii = 0; ii < optimize_stats[i].length; ii++) {
            output_stats.optimize[i][optimize_stats[i][ii]] = { ...default_short_stats };
        }
    }
}

function equip_stats_return_artifact_optimize_setup(party_id) {

    var optimize_stats = [];
    for (var i = 0; i < const_party_size; i++) {
        optimize_stats.push([]);
    }
    
    var optimize_stats_character = utils_object_get_value(data_characters[user_objects.user_party[party_id].id], "optimize_artifact_stats", []);
    
    optimize_stats[party_id] = const_artifact_sub_stats_optimize_default.concat(optimize_stats_character);

    var optimize_stats_effects = equip_effects_return_optimize_stats(party_id);

    for (var i = 0; i < optimize_stats_effects.length; i++) {
        optimize_stats[optimize_stats_effects[i].party_id].push(optimize_stats_effects[i].stat);
        if (const_artifact_sub_stats_optimize_table.hasOwnProperty(optimize_stats_effects[i].stat)) {
            optimize_stats[optimize_stats_effects[i].party_id].push(const_artifact_sub_stats_optimize_table[optimize_stats_effects[i].stat]);
        }
    }
    
    for (var i = 0; i < const_party_size; i++) {
        var filtered = optimize_stats[i].filter(value => const_artifact_sub_stats_options.includes(value));
        optimize_stats[i] = filtered;
    }

    return optimize_stats;
}

function equip_stats_update_reset_total_all() {
    for (var i = 0; i < const_party_size; i++) {
        equip_stats_update_reset_total(i);
    }
}

function equip_stats_update_reset_total(party_id) {
    for (const [stat_type, stat_obj] of Object.entries(const_output_party_stat_objects)) {
        output_party[party_id].stats.initial[stat_type] = structuredClone(default_stats);
    } 
}


function equip_stats_update_add_total_all() {
    for (const [stat_type, stat_obj] of Object.entries(const_output_party_stat_objects)) {
        for (var i = 0; i < stat_obj.length; i++) {
            equip_stats_update_add_all(stat_type, stat_obj[i], false);
        }
        equip_stats_update_copy_total_all(stat_type, true);
    }      
}

function equip_stats_update_add_all(stat_type, stats_obj_name, recalculate) {
    for (var i = 0; i < const_party_size; i++) {
        equip_stats_update_add(stat_type, i, stats_obj_name, null, null);        
        if (recalculate) {
            equip_stats_update_add_skills(stat_type, i, stats_obj_name, null, null);
            for (var ii = 0; ii < output_party[i].artifacts.optimize_stats.length; ii++) {
                var optimize_char = output_party[i].artifacts.optimize_stats[ii];
                for (var iii = 0; iii < optimize_char.length; iii++) {
                    equip_stats_update_add(stat_type, i, stats_obj_name, null, optimize_char[iii], ii);
                    equip_stats_update_add_skills(stat_type, i, stats_obj_name, optimize_char[iii], ii);
                }
            }
        }
    }
}

function equip_stats_update_add_skills(stat_type, party_id, stats_obj_name, artifact_stat, artifact_stat_party) {
    for (var i = 0; i < user_objects.user_party[party_id].active_skills.length; i++) {
        var skill_effects = user_objects.user_party[party_id].active_skills[i].effects;
        if (skill_effects && skill_effects.length > 0) {
            equip_stats_update_add(stat_type, party_id, stats_obj_name, i, artifact_stat, artifact_stat_party);
        }
    }
}

function equip_stats_update_add(stat_type, party_id, stats_obj_name, skill_index = null, artifact_stat = null, artifact_stat_party = null) {
    if (skill_index === null) {        
        var stats_obj = output_party[party_id].stats;
    } else {
        var stats_obj = output_party[party_id].skills.active.details[skill_index].stats;
    }

    if (artifact_stat === null) {
        var input_obj = stats_obj.initial[stats_obj_name];
        var output_obj = stats_obj.initial[stat_type];
    } else {
        var input_obj = stats_obj.optimize[artifact_stat_party][artifact_stat][stats_obj_name];
        var output_obj = stats_obj.optimize[artifact_stat_party][artifact_stat][stat_type];
    }
    
    for (var i = 0; i < input_obj.length; i++) {
        if (input_obj[i].id.endsWith("_mult") && output_obj[input_obj[i].id] != 0) {
            output_obj[input_obj[i].id] *= input_obj[i].value/100;
        } else {
            output_obj[input_obj[i].id] += input_obj[i].value;
        }
        
    }
}

function equip_stats_update_copy_total_all(stat_type, initialize_skill) {
    for (var i = 0; i < const_party_size; i++) {
        equip_stats_update_copy_total(stat_type, i, initialize_skill);
    }
}

function equip_stats_update_copy_total(stat_type, party_id, initialize_skill) {

    equip_stats_update_copy_total_optimize(stat_type, party_id, output_party[party_id].stats);

    for (var i = 0; i < user_objects.user_party[party_id].active_skills.length; i++) {
        var skill_effects = user_objects.user_party[party_id].active_skills[i].effects;
        if (skill_effects && skill_effects.length > 0) {
            if (initialize_skill) {
                output_party[party_id].skills.active.details[i].stats.initial[stat_type] = structuredClone(output_party[party_id].stats.initial[stat_type]);
            }            
            equip_stats_update_copy_total_optimize(stat_type, party_id, output_party[party_id].skills.active.details[i].stats)
        }
    }    
}

function equip_stats_update_copy_total_optimize(stat_type, party_id, output_obj) {
    for (var i = 0; i < output_party[party_id].artifacts.optimize_stats.length; i++) {
        var optimize_char = output_party[party_id].artifacts.optimize_stats[i];
        for (var ii = 0; ii < optimize_char.length; ii++) {
            output_obj.optimize[i][optimize_char[ii]][stat_type] = structuredClone(output_obj.initial[stat_type]);
        }
    }
}

function equip_stats_update_add_artifact_optimize_all() {
    for (var i = 0; i < const_party_size; i++) {
        equip_stats_update_add_artifact_optimize(i);
    }
}

function equip_stats_update_add_artifact_optimize(party_id) {
    equip_stats_update_add_artifact_optimize_stats(party_id, output_party[party_id].stats);
    for (var i = 0; i < user_objects.user_party[party_id].active_skills.length; i++) {
        var skill_effects = user_objects.user_party[party_id].active_skills[i].effects;
        if (skill_effects && skill_effects.length > 0) {
            equip_stats_update_add_artifact_optimize_stats(party_id, output_party[party_id].skills.active.details[i].stats);
        }
    }
}

function equip_stats_update_add_artifact_optimize_stats(party_id, stats_obj) {
    for (var i = 0; i < output_party[party_id].artifacts.optimize_stats.length; i++) {
        var optimize_char = output_party[party_id].artifacts.optimize_stats[i];
        for (var ii = 0; ii < optimize_char.length; ii++) {
            stats_obj.optimize[i][optimize_char[ii]].total[optimize_char[ii]] += data_artifact_stats.slice(-1)[0].sub_stats[optimize_char[ii]].slice(-1)[0];
        }
    }
}

function equip_stats_update_transformation_all(transformation_name) {
    for (var i = 0; i < const_party_size; i++) {
        for (const [stat_type, stat_obj] of Object.entries(const_output_party_stat_objects)) {
            output_party[i].stats.initial[stat_type] = equip_stats_calculate_tranformation(output_party[i].stats.initial[stat_type], transformation_name);

            equip_stats_update_transformation_optimize(transformation_name, i, stat_type, output_party[i].stats);

            for (var ii = 0; ii < user_objects.user_party[i].active_skills.length; ii++) {
                var skill_effects = user_objects.user_party[i].active_skills[ii].effects;
                if (skill_effects && skill_effects.length > 0) {
                    output_party[i].skills.active.details[ii].stats.initial[stat_type] = equip_stats_calculate_tranformation(output_party[i].skills.active.details[ii].stats.initial[stat_type], transformation_name);
                    equip_stats_update_transformation_optimize(transformation_name, i, stat_type, output_party[i].skills.active.details[ii].stats)
                }
            }
        }          
    }
}

function equip_stats_update_transformation_optimize(transformation_name, party_id, stat_type, stats_obj) {
    for (var i = 0; i < output_party[party_id].artifacts.optimize_stats.length; i++) {
        var optimize_char = output_party[party_id].artifacts.optimize_stats[i];
        for (var ii = 0; ii < optimize_char.length; ii++) {
            stats_obj.optimize[i][optimize_char[ii]][stat_type] = equip_stats_calculate_tranformation(stats_obj.optimize[i][optimize_char[ii]][stat_type], transformation_name);
        }
    }
}

function equip_stats_update_vision_stat_all() {
    for (var i = 0; i < const_party_size; i++) {
        equip_stats_update_vision_stat(i);
    }
}

function equip_stats_update_vision_stat(party_id) {
    output_party[party_id].stats.initial.vision_stat = equip_stats_return_vision_stat(party_id);
}

function equip_stats_update_enemy_defense_all() {
    for (var i = 0; i < const_party_size; i++) {
        equip_stats_update_enemy_defense(i);
    }
}

function equip_stats_update_enemy_defense(party_id) {

    output_party[party_id].stats.initial.total["enemyred"] = equip_stats_calculate_enemyred(output_party[party_id].stats.initial.total, party_id);
    equip_stats_update_enemy_defense_optimize(party_id, output_party[party_id].stats);

    for (var i = 0; i < user_objects.user_party[party_id].active_skills.length; i++) {
        var skill_effects = user_objects.user_party[party_id].active_skills[i].effects;
        if (skill_effects && skill_effects.length > 0) {
            output_party[party_id].skills.active.details[i].stats.initial.total["enemyred"] = equip_stats_calculate_enemyred(output_party[party_id].skills.active.details[i].stats.initial.total, party_id);
            equip_stats_update_enemy_defense_optimize(party_id, output_party[party_id].skills.active.details[i].stats);
        }
    }
}

function equip_stats_update_enemy_defense_optimize(party_id, stats_obj) {
    for (var i = 0; i < output_party[party_id].artifacts.optimize_stats.length; i++) {
        var optimize_char = output_party[party_id].artifacts.optimize_stats[i];
        for (var ii = 0; ii < optimize_char.length; ii++) {
            stats_obj.optimize[i][optimize_char[ii]].total["enemyred"] = equip_stats_calculate_enemyred(stats_obj.optimize[i][optimize_char[ii]].total, party_id);
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
            output_party[user_objects.user_active_character].stats.initial.total,
            const_display_stats_columns[index].main,
            default_stat
        )
    } else {
        var main_stat_id = const_display_stats_columns[index].main;
    }

    var main_stat_line = utils_create_obj("div", "main_statline");
    main_stat_line.appendChild(utils_create_img_svg(main_stat_id));
    main_stat_line.appendChild(utils_create_obj("p", null, null, data_stats[main_stat_id].name));
    main_stat_line.appendChild(utils_create_obj("p", null, null, utils_format_stat_value(data_stats[main_stat_id], output_party[user_objects.user_active_character].stats.initial.total[main_stat_id])));
    main_stat_line.onclick = function (event) { equip_stats_change_detail(index); }
    parent.append(main_stat_line);

    if (user_preferences.stats.detail[index]) {
        for (var i = 0; i < const_display_stats_columns[index].stats.length; i++) {
            var stat_id = const_display_stats_columns[index].stats[i];
            var stat_value = output_party[user_objects.user_active_character].stats.initial.total[stat_id];
            if (stat_id == main_stat_id || !const_display_stats_columns[index].hide || stat_value) {
                parent.append(utils_create_stat(stat_id, stat_value));
            }            
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
        parent.appendChild(utils_create_stat_img(stat_id, output_party[unit_id].stats.initial.total[stat_id]));
    }
}

function equip_stats_return_vision_stat(party_id) {
    return equip_stats_return_calculated_vision_stat(
        user_objects.user_party[party_id].id, output_party[party_id].stats.initial.total);
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
                { "id": current_artifact.sub_stats[ii].id, "value": Number(current_artifact.sub_stats[ii].value) }
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

function equip_stats_return_output_stats(party_id, skill_index, artifact_stat, artifact_stat_party, specific_stat = null) {
    if (skill_index === null) {
        var output_stats = output_party[party_id].stats;
    } else {
        var output_stats = output_party[party_id].skills.active.details[skill_index].stats;
    }

    if (artifact_stat === null) {
        output_stats = output_stats.initial.total;
    } else {
        output_stats = output_stats.optimize[artifact_stat_party][artifact_stat].total;
    }

    if (specific_stat == null) {
        return output_stats;
    } else {
        return output_stats[specific_stat];
    }
}
