
const party_size = 4;
const level_list = ["1", "20", "20+", "40", "40+", "50", "50+", "60", "60+", "70", "70+", "80", "80+", "90"];
const level_list_values = [1, 20, 20, 40, 40, 50, 50, 60, 60, 70, 70, 80, 80, 90];
const constel_list = [0, 1, 2, 3, 4, 5, 6];
const character_visions = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"];

function equip_character_load_last() {
    var character_storage = localStorage.getItem("character_storage");
    if (character_storage) {
        utils_log_debug("Found saved Characters.");
        equip_setup_character_storage_objects(JSON.parse(character_storage));
    } else {
        utils_log_debug("No saved Characters.");
    }
}

function equip_character_save_last() {
    var character_json = JSON.stringify(character_storage_objects);
    localStorage.setItem("character_storage", character_json);
}

function equip_character_load(party_id, character_data) {

    for (var i = 0; i < party_size; i++) {
        if (i!= party_id && character_data.id != "none" && character_data.id == user_objects.user_party[i].id) {
            utils_message("Each character can be present only once in party!", "automatic_warn")
            return;
        }
    }

    var current_char_id = user_objects.user_party[party_id].id;

    var char = user_objects.user_party[party_id]

    char.id = utils_object_get_value(character_data, "id", "none");
    char.level = utils_object_get_value(character_data, "level", 0);
    char.constel = utils_object_get_value(character_data, "constel", 0);
    char.levelnormal = utils_object_get_value(character_data, "levelnormal", 0);
    char.levelskill = utils_object_get_value(character_data, "levelskill", 0);
    char.levelburst = utils_object_get_value(character_data, "levelburst", 0);

    char.weapon = {};
    char.weapon.id = utils_object_get_value(character_data, "weapon.id", 0);
    char.weapon.level = utils_object_get_value(character_data, "weapon.level", 0);
    char.weapon.refine = utils_object_get_value(character_data, "weapon.refine", 0);

    char.artifacts = {};

    for (var ii = 0; ii < artifact_types.length; ii++) {
        var artifact = {};
        artifact.id = utils_object_get_value(character_data, "artifacts." + artifact_types[ii] + ".id", 0);
        artifact.level = utils_object_get_value(character_data, "artifacts." + artifact_types[ii] + ".level", 0);
        artifact.stars = utils_object_get_value(character_data, "artifacts." + artifact_types[ii] + ".stars", 0);
        artifact.main_stat = utils_object_get_value(character_data, "artifacts." + artifact_types[ii] + ".main_stat", data_artifact_vars[artifact_types[ii]].main_stats[0]);
        artifact.sub_stats = [];
        for (var iii = 0; iii < artifact_sub_stats; iii++) {
            var sub_stat = {};
            sub_stat.id = utils_object_get_value(character_data, "artifacts." + artifact_types[ii] + ".sub_stats." + iii + ".id", artifact_sub_stats_options[0]);
            sub_stat.value = utils_object_get_value(character_data, "artifacts." + artifact_types[ii] + ".sub_stats." + iii + ".value", 0);
            artifact.sub_stats.push(sub_stat);
        }

        char.artifacts[artifact_types[ii]] = artifact;
    }

    equip_character_update_all(false);
    equip_weapon_update_all();
    equip_artifacts_update_all_all();
    equip_effects_update_options_all();  
    equip_effects_update_stats_all();

    equip_stats_update_total_all();
    if (current_char_id != character_data.id) {
        equip_skills_update_reset_active(party_id);
    }
    equip_skills_update_all();
    
    equip_character_display(party_id);
    equip_control_display_all();
    equip_character_display_resonance();
    equip_weapon_display();
    equip_artifacts_display_all();
    equip_effects_display_all();
    equip_skills_display_all();
    equip_storage_display_active();
    equip_stats_display();   

    equip_storage_save_last();
}

function equip_character_change_simple_trigger(party_id) {
    equip_character_update_stats(party_id);

    equip_stats_update_total_all();
    equip_effects_update_options_all();
    equip_effects_update_stats_all();
    equip_stats_update_total_all();
    equip_skills_update_all();

    equip_effects_display_all();
    equip_skills_display_all();
    equip_character_display(party_id);
    equip_stats_display();
    equip_storage_save_last();
}

function equip_character_change_trigger(party_id) {
    equip_character_update_all(true);

    equip_stats_update_total_all();
    equip_effects_update_options_all();
    equip_effects_update_stats_all();
    equip_stats_update_total_all();
    equip_skills_update_reset_active(party_id);
    equip_skills_update_all();

    equip_effects_display_all();
    equip_skills_display_all();
    equip_character_display(party_id);
    equip_character_display_resonance();
    equip_stats_display();
    equip_weapon_display();
    equip_storage_save_last();
}

function equip_enemy_change_trigger() {
    for (var i = 0; i < party_size; i++) {
        equip_character_update_stats(i);
    }
    equip_stats_update_total_all();
    equip_skills_update_all();

    equip_enemy_display();
    equip_skills_display_all();
    equip_stats_display();
    equip_storage_save_last();
}

function equip_character_storage_change_trigger() {
    equip_character_storage_display_active_all();
    equip_character_storage_display_all();
    equip_character_save_last();
}

function equip_active_character_change(party_id) {
    if (user_objects.user_active_character != party_id) {
        user_objects.user_active_character = party_id;
              
        equip_control_display_all();
        equip_effects_display_all();
        equip_skills_display_all();
        equip_weapon_display();
        equip_artifacts_display_all();
        equip_stats_display();
        equip_storage_save_last();
    }
}

function equip_character_change(character_id, party_id) {

    for (var i = 0; i < party_size; i++) {
        if (character_id != "none" && character_id == user_objects.user_party[i].id) {
            utils_message("Each character can be present only once in party!", "automatic_warn")
            return;
        }
    }
    user_objects.user_party[party_id].id = character_id;

    equip_character_change_trigger(party_id);    
}

function equip_character_change_level(i, party_id) {
    user_objects.user_party[party_id].level = i;

    equip_character_change_simple_trigger(party_id)
}

function equip_character_change_constel(i, party_id) {
    user_objects.user_party[party_id].constel = i;

    equip_character_change_simple_trigger(party_id)
}

function equip_enemy_change(enemy_id) {
    user_objects.user_enemy.id = enemy_id;

    equip_enemy_change_trigger();
}

function equip_enemy_change_level(level) {
    level = utils_number_verify(level, 0, 0, 103);
    if (level != null) {
        user_objects.user_enemy.level = level;
        equip_enemy_change_trigger();
    }
    
}

function equip_character_storage_change_load_character(input_obj) {
    equip_character_load(input_obj.party_id, character_storage_objects.saved_characters[input_obj.index]);
    equip_character_storage_change_trigger();
}

function equip_character_storage_change_delete_character(index) {
    character_storage_objects.saved_characters.splice(index, 1);
    equip_character_storage_change_trigger();
}

function equip_character_update_all(manual = false) {
    
    equip_character_update_resonance();

    for (var i = 0; i < party_size; i++) {
        equip_character_update(i, manual);        
        equip_character_update_stats(i);
    }
}

function equip_character_update(party_id, manual = false) {

    var new_weapon_type = data_characters[user_objects.user_party[party_id].id].weapon;

    if (manual && output_party[party_id].weapon_type != new_weapon_type) {        
        user_objects.user_party[party_id].weapon.id = 0;
        user_objects.user_party[party_id].weapon.level = 0;
        user_objects.user_party[party_id].weapon.refine = 0;
        equip_weapon_update(party_id);
    }

    output_party[party_id].weapon_type = new_weapon_type;
    
}

function equip_character_update_stats(party_id) {

    var stats_basic = [];
    var stats_env = [];

    var character = data_characters[user_objects.user_party[party_id].id];
    var level = user_objects.user_party[party_id].level;

    for (var i = 0; i < character.stats.length; i++) {
        stats_basic.push(
            { "id": character.stats[i].stat, "value": character.stats[i].values[level] }
        );
    }

    for (var i = 0; i < user_objects.user_party[party_id].constel; i++) {
        if (character.const[i].hasOwnProperty("bonus")) {
            for (var ii = 0; ii < character.const[i].bonus.length; ii++) {
                stats_basic.push(
                    { "id": character.const[i].bonus[ii].stat, "value": character.const[i].bonus[ii].value }
                );
            }            
        }
    }

    for (var i = 0; i < output_resonances.length; i++) {
        var resonance = utils_array_get_by_lookup(data_resonance, "id", output_resonances[i]);
        for (var ii = 0; ii < resonance.bonus.length; ii++) {
            if (resonance.bonus[ii].stat) {
                stats_env.push(
                    { "id": resonance.bonus[ii].stat, "value": resonance.bonus[ii].value }
                );
            }
        }
        
    }

    var enemy = utils_array_get_by_lookup(data_enemies, "id", user_objects.user_enemy.id);

    for (var i = 0; i < enemy.stats.length; i++) {
        stats_env.push(
            { "id": enemy.stats[i].id, "value": enemy.stats[i].value }
        );
    }

    if (user_objects.user_enemy.level > 0) {
        var defense = 5 * user_objects.user_enemy.level + 500;
    } else {
        var defense = 0;
    }

    stats_env.push(
        { "id": "enemydef", "value": defense }
    );

    output_party[party_id].stats.basic = stats_basic;
    output_party[party_id].stats.environment = stats_env;
}

function equip_character_update_resonance() {
    var active_resonances = [];
    var visions = [];

    for (var i = 0; i < party_size; i++) {
        if (data_characters[user_objects.user_party[i].id].vision) {
            visions.push(data_characters[user_objects.user_party[i].id].vision);
        }
    }

    for (var i = 0; i < data_resonance.length; i++) {
        if (data_resonance[i].vision) {
            if (visions.length == party_size && utils_array_count(visions, data_resonance[i].vision) >= data_resonance[i].req) {
                active_resonances.push(data_resonance[i].id);
            }
        }
    }

    for (var i = 0; i < data_resonance.length; i++) {
        if (!data_resonance[i].vision) {
            if (visions.length == party_size && active_resonances.length == 0) {
                active_resonances.push(data_resonance[i].id);
            } 
        }
    }

    output_resonances = active_resonances;
}

function equip_character_display_all() {
    for (var i = 0; i < party_size; i++) {
        equip_character_display(i);
    }
}

function equip_character_display(party_id) {

    var character_id = user_objects.user_party[party_id].id;
    var character = data_characters[character_id];
    var name = document.getElementById("character_name_" + party_id);
    var icon = document.getElementById("character_icon_" + party_id);
    var img = document.getElementById("character_img_" + party_id);
    var level = document.getElementById("character_level_" + party_id);
    var level_text = document.getElementById("character_level_text_" + party_id);
    var constel = document.getElementById("character_constel_" + party_id);
    var constel_text = document.getElementById("character_constel_text_" + party_id);

    name.innerHTML = character.name;
    name.className = "container_name " + character.vision;
    icon.className = "character_icon " + character.vision;
    img.src = "/images/icons/character/" + character_id + "/char.png";
    level.className = "icon_selects character_level select_gradient l" + user_objects.user_party[party_id].level;
    level_text.innerHTML = level_list[user_objects.user_party[party_id].level];
    constel.className = "icon_selects character_constel select_gradient c" + user_objects.user_party[party_id].constel;
    constel_text.innerHTML = "C" + constel_list[user_objects.user_party[party_id].constel];
}

function equip_character_display_resonance() {

    for (var i = 0; i < data_resonance.length; i++) {
        if (output_resonances.includes(data_resonance[i].id)) {
            document.getElementById("resonance_" + i).className = "resonance tooltip_trigger active";
        } else {
            document.getElementById("resonance_" + i).className = "resonance tooltip_trigger";
        }
    }
}

function equip_enemy_display() {
    var enemy_id = user_objects.user_enemy.id;
    var enemy = utils_array_get_by_lookup(data_enemies, "id", enemy_id);
    var name = document.getElementById("enemy_name");
    var icon = document.getElementById("enemy_icon");
    var img = document.getElementById("enemy_img");
    var level = document.getElementById("enemy_level_text");

    name.innerHTML = enemy.name;
    name.className = "container_name " + enemy.vision;
    icon.className = "character_icon " + enemy.vision;
    img.src = "/images/icons/enemy/" + enemy.icon + ".png";
    level.innerHTML = user_objects.user_enemy.level;
}

function equip_character_storage_display_all() {
    var parent = document.getElementById("character_storage_column");
    utils_delete_children(parent, 0);

    for (var i = 0; i < character_storage_objects.saved_characters.length; i++) {
        parent.appendChild(equip_character_storage_display(i));
    }
}

function equip_character_storage_display(index) {
    var storage_character = character_storage_objects.saved_characters[index];
    var character = data_characters[storage_character.id];

    var obj = utils_create_obj("div", "char_storage_row", "char_storage_row_" + index);
    obj.appendChild(equip_character_storage_display_name(character, storage_character.name));
    obj.appendChild(equip_character_storage_display_data(storage_character));
    obj.appendChild(equip_character_storage_display_equip(storage_character));
    obj.appendChild(equip_character_storage_display_stats(storage_character.display_stats, storage_character.vision_stat));
    obj.appendChild(equip_character_storage_display_btns(index));

    return obj;
}

function equip_character_storage_display_active_all() {
    var parent = document.getElementById("character_storage_active_column");
    utils_delete_children(parent, 0);

    for (var i = 0; i < party_size; i++) {
        parent.appendChild(equip_character_storage_display_active(i));
    }
}

function equip_character_storage_display_active(index) {
    var active_character = user_objects.user_party[index];
    var output_character = output_party[index];
    var character = data_characters[active_character.id];

    var obj = utils_create_obj("div", "char_storage_row", "char_storage_active_row_" + index);
    obj.appendChild(equip_character_storage_display_name(character, character.name));
    obj.appendChild(equip_character_storage_display_data(active_character));
    obj.appendChild(equip_character_storage_display_equip(active_character));
    obj.appendChild(equip_character_storage_display_stats(output_character.stats.display, output_character.stats.vision_stat));

    return obj;
}

function equip_character_storage_display_btns(index) {
    var btns_obj = utils_create_obj("div", "char_storage_btns", "char_storage_btns_" + index);

    for (let i = 0; i < party_size; i++) {
        let input_obj = { "party_id": i, "index": index };
        let party_num = i + 1;
        btns_obj.appendChild(utils_create_img_button_prompt_confirm("numeric-" + party_num + "-box-outline", "Load as Party " + party_num, "char_storage_load_" + i + "_" + index, "Load this character as Party " + party_num + "?", equip_character_storage_change_load_character, input_obj, "char_storage_btn", "active_prompt_char_storage"))
    }

    btns_obj.appendChild(utils_create_img_button_prompt_confirm("delete-forever", "Delete Character", "char_storage_save_" + index, "Delete this character?", equip_character_storage_change_delete_character, index, "char_storage_btn", "active_prompt_char_storage"))


    return btns_obj;
}

function equip_character_storage_display_stats(character_display_stats, vision_stat) {
    var stats_obj = utils_create_obj("div", "char_storage_stats");

    for (var i = 0; i < display_stats.length; i++) {
        var stat_id = display_stats[i];
        if (data_stats[stat_id].display.enka == true) {
            var stat_obj = utils_create_obj("div", "char_storage_stat char_storage_" + stat_id);
            stat_obj.appendChild(utils_create_label_img(stat_id, data_stats[stat_id].name));
            stat_obj.appendChild(
                utils_create_obj("div", "char_storage_stat_val", null, utils_format_stat_value(data_stats[stat_id], character_display_stats[stat_id]))
            )
            stats_obj.appendChild(stat_obj);
        }
    }
    var vision_stat_obj = utils_create_obj("div", "char_storage_stat char_storage_vision");
    vision_stat_obj.appendChild(utils_create_label_img(vision_stat, data_stats[vision_stat].name));
    vision_stat_obj.appendChild(
        utils_create_obj("div", "char_storage_stat_val", null, utils_format_stat_value(data_stats[vision_stat], character_display_stats[vision_stat]))
    )
    stats_obj.appendChild(vision_stat_obj);

    return stats_obj;
}

function equip_character_storage_display_equip(character_storage) {
    var weapon_type = data_characters[character_storage.id].weapon;
    var weapon = utils_array_get_by_lookup(data_weapons[weapon_type], "id", character_storage.weapon.id);

    var equip_obj = utils_create_obj("div", "char_storage_equip");
    equip_obj.appendChild(equip_display_equipment_icon("/images/icons/weapon/" + weapon_type + "/" + weapon.icon + ".png", weapon.rarity, weapon.name, level_list[character_storage.weapon.level]));

    for (var i = 0; i < artifact_types.length; i++) {
        var artifact = utils_array_get_by_lookup(data_artifact_sets, "id", character_storage.artifacts[artifact_types[i]].id);
        equip_obj.appendChild(equip_display_equipment_icon("/images/icons/artifact/" + artifact_types[i] + "/" + artifact.icon + ".png", character_storage.artifacts[artifact_types[i]].stars, artifact.name, character_storage.artifacts[artifact_types[i]].level));
    }

    return equip_obj;
}


function equip_character_storage_display_skill_level(skill_name, skill_level) {
    var skill_obj = utils_create_obj("div", "char_storage_skill");
    skill_obj.appendChild(utils_create_label_img(skill_name, bonusdmg_names[skill_name]));
    skill_obj.appendChild(utils_create_obj("div", null, null, skill_level));
    return skill_obj;
}

function equip_character_storage_display_data(character_storage) {
    var data_obj = utils_create_obj("div", "char_storage_data");

    data_obj.appendChild(utils_create_obj("div", "char_storage_lv", null, "Lv. " + level_list[character_storage.level]));
    data_obj.appendChild(utils_create_obj("div", "char_storage_const", null, "C" + constel_list[character_storage.constel]));

    for (var i = 0; i < attack_level_types.length; i++) {
        data_obj.appendChild(equip_character_storage_display_skill_level(attack_level_types[i], character_storage["level" + attack_level_types[i]] + 1));
    }

    return data_obj;
}

function equip_character_storage_display_name(character, character_name) {
    var name_container = utils_create_obj("div", "char_storage_name");
    name_container.appendChild(utils_create_img_svg(character.vision));
    name_container.appendChild(utils_create_obj("div", character.vision, null, character_name));

    return name_container;
}

function equip_character_return_party_id_by_name(character_id) {
    for (var i = 0; i < party_size; i++) {
        if (user_objects.user_party[i].id == character_id) {
            return i;
        }
    }
    return -1;
}

function equip_character_return_party_id_by_special(special_condition) {
    switch (special_condition) {
        case "highest_elemastery":
            var highest_index = 0;
            var highest_value = 0;
            for (var i = 0; i < party_size; i++) {
                if (output_party[i].stats.total["elemastery"] > highest_value) {
                    highest_value = output_party[i].stats.total["elemastery"];
                    highest_index = i;
                }
            }
            return highest_index;

            break;
        default:
            return
    }
}

function equip_character_return_vision_count(vision) {
    var count = 0;

    if (vision == "unique") {
        var visions = [];

        for (var i = 0; i < party_size; i++) {
            if (!visions.includes(data_characters[user_objects.user_party[i].id].vision)) {
                visions.push(data_characters[user_objects.user_party[i].id].vision);
                count += 1;
            }                
        }

    } else {
        for (var i = 0; i < party_size; i++) {
            if (data_characters[user_objects.user_party[i].id].vision == vision) {
                count += 1;
            }
        }
    }

    
    return count;
}

function equip_character_return_nation_count(nation) {
    var count = 0;
    for (var i = 0; i < party_size; i++) {
        if (data_characters[user_objects.user_party[i].id].nation == nation) {
            count += 1;
        }
    }
    return count;
}

function equip_character_return_short_name(character_id) {
    var character = data_characters[character_id];
    if (character.short_name) {
        return character.short_name;
    } else {
        return character.name;
    }
}
