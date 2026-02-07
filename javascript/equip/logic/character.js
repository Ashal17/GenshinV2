function equip_character_storage_load_last(character_storage_account, legacy_character_storage_account) {
    if (character_storage_account) {
        utils_log_debug("Found Characters at account.");
        equip_setup_character_storage_objects(character_storage_account);
    } else {
        var character_storage_local = localStorage.getItem("character_storage");
        if (character_storage_local) {
            utils_log_debug("Found Characters locally.");
            equip_setup_character_storage_objects(JSON.parse(character_storage_local));
        }
    }
    if (legacy_character_storage_account) {
        utils_log_debug("Found legacy Characters at account.");
        equip_legacy_v1_character_storage_load_account(legacy_character_storage_account);
    }

    if (!character_storage_account && user_account && user_account.status) {
        utils_log_debug("Saving Characters to account");
        equip_character_storage_save_last();
    }

    equip_legacy_v1_character_storage_load_local();
}

function equip_character_storage_save_last() {
    var character_json = JSON.stringify(character_storage_objects);

    if (user_account && user_account.status) {
        equip_account_character_storage_save(character_json);
    } else {
        localStorage.setItem("character_storage", character_json);
    }
}

function equip_character_load(party_id, character_data) {

    for (var i = 0; i < const_party_size; i++) {
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

    for (var ii = 0; ii < const_artifact_types.length; ii++) {
        var artifact = {};
        artifact.id = utils_object_get_value(character_data, "artifacts." + const_artifact_types[ii] + ".id", 0);
        artifact.level = utils_object_get_value(character_data, "artifacts." + const_artifact_types[ii] + ".level", 0);
        artifact.stars = utils_object_get_value(character_data, "artifacts." + const_artifact_types[ii] + ".stars", 0);
        artifact.main_stat = utils_object_get_value(character_data, "artifacts." + const_artifact_types[ii] + ".main_stat", data_artifact_vars[const_artifact_types[ii]].main_stats[0]);
        artifact.sub_stats = [];
        for (var iii = 0; iii < const_artifact_sub_stats; iii++) {
            var sub_stat = {};
            sub_stat.id = utils_object_get_value(character_data, "artifacts." + const_artifact_types[ii] + ".sub_stats." + iii + ".id", const_artifact_sub_stats_options[0]);
            sub_stat.value = utils_object_get_value(character_data, "artifacts." + const_artifact_types[ii] + ".sub_stats." + iii + ".value", 0);
            artifact.sub_stats.push(sub_stat);
        }

        char.artifacts[const_artifact_types[ii]] = artifact;
    }

    equip_character_update_all(false);
    equip_weapon_update_all();
    equip_artifacts_update_all_all();
    equip_stats_update_total_all();
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
    for (var i = 0; i < const_party_size; i++) {
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
    equip_character_storage_save_last();
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

    for (var i = 0; i < const_party_size; i++) {
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
    level = utils_number_verify(level, 0, 0, const_enemy_max_level);
    if (level != null) {
        user_objects.user_enemy.level = level;
        equip_enemy_change_trigger();
    }
    
}

function equip_character_change_filter(objects) {
    var filter_vision = [];
    for (var i = 0; i < const_character_visions.length; i++) {
        if (document.getElementById("character_filter_" + const_character_visions[i]).checked) {
            filter_vision.push(const_character_visions[i]);
        }
    }
    var filter_weapon = [];
    for (var i = 0; i < const_weapon_types.length; i++) {
        if (document.getElementById("character_filter_" + const_weapon_types[i]).checked) {
            filter_weapon.push(const_weapon_types[i]);
        }
    }
    var filter_rarity = [];
    for (var i = 4; i < 6; i++) {
        if (document.getElementById("character_filter_star" + i).checked) {
            filter_rarity.push(i);
        }
    }
    for (var i = 0; i < objects.length; i++) {
        if ((filter_vision.length > 0 && !filter_vision.includes(objects[i].vision)) ||
            (filter_weapon.length > 0 && !filter_weapon.includes(objects[i].weapon)) ||
            (filter_rarity.length > 0 && !filter_rarity.includes(objects[i].rarity))
        ) {
            objects[i].filtered = true;
        } else {
            objects[i].filtered = false;
        }
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

function equip_character_storage_change_save_character(index) {

    var character = equip_character_storage_return_active_character(index);

    if (equip_character_storage_save_character(character)) {
        equip_character_storage_change_trigger();
    }   
}

function equip_character_storage_change_rename_character(new_name, index) {
    character_storage_objects.saved_characters[index].name = new_name;
    equip_character_storage_change_trigger();
}

function equip_character_update_all(manual = false) {
    
    equip_character_update_resonance();

    for (var i = 0; i < const_party_size; i++) {
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
        if (character.const[i] && character.const[i].hasOwnProperty("bonus")) {
            for (var ii = 0; ii < character.const[i].bonus.length; ii++) {
                stats_basic.push(
                    { "id": character.const[i].bonus[ii].stat, "value": character.const[i].bonus[ii].value }
                );
            }            
        }
    }

    for (var i = 0; i < character.passive.length; i++) {
        if (character.passive[i].level <= user_objects.user_party[party_id].level) {
            if (character.passive[i] && character.passive[i].hasOwnProperty("bonus")) {
                for (var ii = 0; ii < character.passive[i].bonus.length; ii++) {
                    stats_basic.push(
                        { "id": character.passive[i].bonus[ii].stat, "value": character.passive[i].bonus[ii].value }
                    );
                }
            }
        }
    }

    for (var i = 0; i < output_resonances.length; i++) {
        if (output_resonances[i].active) {
            var resonance = data_resonance[i];
            for (var ii = 0; ii < resonance.bonus.length; ii++) {
                if (resonance.bonus[ii].stat) {
                    stats_env.push(
                        { "id": resonance.bonus[ii].stat, "value": resonance.bonus[ii].value }
                    );
                }
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

    output_party[party_id].stats.initial.basic = stats_basic;
    output_party[party_id].stats.initial.environment = stats_env;
}

function equip_character_update_resonance() {
    var active_resonances = [];

    for (var i = 0; i < data_resonance.length; i++) {
        var count = equip_character_return_variable_count(data_resonance[i].req.type, data_resonance[i].req.value);
        var active = false;
        var hidden = false;
        if (count >= data_resonance[i].req.count) {
            active = true;
        } else if (data_resonance[i].req.value === null) {
            hidden = true;
        }
        active_resonances.push({ "count": count, "active": active, "hidden":hidden })
    }

    output_resonances = active_resonances;
}

function equip_character_storage_save_character(character, show_warns = true) {

    if (user_account && user_account.status) {
        if (character_storage_objects.saved_characters.length > 5000) {
            utils_message("Maximum of 5 000 Characters for logged in users!", "automatic_warn");
            return false;
        }       
    } else if (character_storage_objects.saved_characters.length > 100) {
        utils_message("Maximum of 100 Characters for unlogged users!", "automatic_warn");
        return false;
    }

    var hash = utils_hash(JSON.stringify(character));

    for (var i = 0; i < character_storage_objects.saved_characters.length; i++) {
        if (character_storage_objects.saved_characters[i].hash == hash) {
            if (show_warns) {
                utils_message("This Character build is already saved!", "automatic_warn")
            }
            return false;
        }
    }
    character.hash = hash;
    character_storage_objects.saved_characters.push(character);
    return true;
}

function equip_character_display_all() {
    for (var i = 0; i < const_party_size; i++) {
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
    equip_character_display_name_icons(party_id, character);
    icon.className = "character_icon " + character.vision;
    img.src = "/images/icons/character/" + character_id + "/char.png";
    level.className = "icon_selects character_level select_gradient l" + user_objects.user_party[party_id].level;
    level_text.innerHTML = const_level_list[user_objects.user_party[party_id].level];
    constel.className = "icon_selects character_constel select_gradient c" + user_objects.user_party[party_id].constel;
    constel_text.innerHTML = "C" + const_constel_list[user_objects.user_party[party_id].constel];
}

function equip_character_display_name_icons(party_id, character) {
    var icons_right = document.getElementById("character_icons_right_" + party_id);
    utils_delete_children(icons_right, 0);
    if (character.nation) {
        //icons_right.appendChild(utils_create_img_svg(character.nation));
    }
    for (var i = 0; i < const_character_groups.length; i++) {
        if (character[const_character_groups[i]]) {
            icons_right.appendChild(utils_create_img_svg(const_character_groups[i]));
        }
    }
}

function equip_character_display_resonance() {

    for (var i = 0; i < data_resonance.length; i++) {
        var resonance_class = "resonance tooltip_trigger count_" + output_resonances[i].count;
        if (output_resonances[i].active) {
            resonance_class += " active";
        } else if (output_resonances[i].hidden || output_resonances[i].count === 0) {
            resonance_class += " hidden";
        } 
        document.getElementById("resonance_" + i).className = resonance_class;
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

    var character_objects = [];

    var filter = equip_character_storage_return_filter();

    for (var i = 0; i < character_storage_objects.saved_characters.length; i++) {
        if (equip_character_storage_return_filtered_character(character_storage_objects.saved_characters[i].id, filter.search, filter.vision, filter.weapon, filter.rarity)) {
            character_objects.push(equip_character_storage_display(i));  
        }              
    }
    character_objects = utils_array_sort(character_objects, "sort");
    for (var i = 0; i < character_objects.length; i++) {
        parent.appendChild(character_objects[i]);
    }

    if (filter.search && character_objects.length == 0) {
        document.getElementById("prompt_select_search").style.color = "var(--red)";
    } else {
        document.getElementById("prompt_select_search").style.color = "var(--white)";
    }
}

function equip_character_storage_display(index) {
    var storage_character = character_storage_objects.saved_characters[index];
    var character = data_characters[storage_character.id];

    var obj = utils_create_obj("div", "char_storage_row", "char_storage_row_" + index);
    var name_row = utils_create_obj("div", "char_storage_row_name");
    name_row.appendChild(utils_create_img_button_prompt_input("square-edit-outline", "Rename", "char_storage_rename_" + index, "Enter new name", equip_character_storage_change_rename_character, index, storage_character.name, "char_storage_btn", "active_prompt_char_storage"));
    name_row.appendChild(utils_create_label_img(storage_character.source, storage_character.uid, null, null, "char_storage_btn"));
    name_row.appendChild(equip_character_storage_display_name(character, storage_character.name));
    obj.appendChild(name_row);  
    obj.appendChild(equip_character_storage_display_data(storage_character));
    obj.appendChild(equip_character_storage_display_equip(storage_character));
    obj.appendChild(equip_character_storage_display_stats(storage_character.display_stats, storage_character.vision_stat));
    obj.appendChild(equip_character_storage_display_btns(index));
    obj.sort = character.name + " " + storage_character.name;

    return obj;
}

function equip_character_storage_display_active_all() {
    var parent = document.getElementById("character_storage_active_column");
    utils_delete_children(parent, 0);

    for (var i = 0; i < const_party_size; i++) {
        parent.appendChild(equip_character_storage_display_active(i));
    }
}

function equip_character_storage_display_active(index) {
    var active_character = user_objects.user_party[index];
    var character = data_characters[active_character.id];

    var obj = utils_create_obj("div", "char_storage_row", "char_storage_active_row_" + index);
    var name_row = utils_create_obj("div", "char_storage_row_name");
    name_row.appendChild(equip_character_storage_display_name(character, null));
    obj.appendChild(name_row);  
    obj.appendChild(equip_character_storage_display_data(active_character));
    obj.appendChild(equip_character_storage_display_equip(active_character));
    obj.appendChild(equip_character_storage_display_stats(equip_stats_return_display_stats(active_character), equip_stats_return_vision_stat(index)));
    obj.appendChild(equip_character_storage_display_active_btns(index));

    return obj;
}

function equip_character_storage_display_active_btns(index) {
    var btns_obj = utils_create_obj("div", "char_storage_btns", "char_storage_btns_" + index);

    btns_obj.appendChild(utils_create_img_button_prompt_confirm("download", "Save Character", "char_storage_save_" + index, "Save this character?", equip_character_storage_change_save_character, index, "char_storage_btn", "active_prompt_char_storage"))

    return btns_obj;
}

function equip_character_storage_display_btns(index) {
    var btns_obj = utils_create_obj("div", "char_storage_btns", "char_storage_btns_" + index);

    for (let i = 0; i < const_party_size; i++) {
        let input_obj = { "party_id": i, "index": index };
        let party_num = i + 1;
        btns_obj.appendChild(utils_create_img_button_prompt_confirm("numeric-" + party_num + "-box-outline", "Load as Party " + party_num, "char_storage_load_" + i + "_" + index, "Load this character as Party " + party_num + "?", equip_character_storage_change_load_character, input_obj, "char_storage_btn", "active_prompt_char_storage"))
    }

    btns_obj.appendChild(utils_create_img_button_prompt_confirm("delete-forever", "Delete Character", "char_storage_save_" + index, "Delete this character?", equip_character_storage_change_delete_character, index, "char_storage_btn", "active_prompt_char_storage"))


    return btns_obj;
}

function equip_character_storage_display_stats(character_display_stats, vision_stat) {
    var stats_obj = utils_create_obj("div", "char_storage_stats");

    for (var i = 0; i < const_display_stats_storage.length; i++) {
        var stat_id = const_display_stats_storage[i];
        var stat_obj = utils_create_obj("div", "char_storage_stat char_storage_" + stat_id);
        stat_obj.appendChild(utils_create_label_img(stat_id, data_stats[stat_id].name));
        if (character_display_stats[stat_id] == undefined) {
            var stat_text = "?";
        } else {
            var stat_text = utils_format_stat_value(data_stats[stat_id], character_display_stats[stat_id]);
        }
        stat_obj.appendChild(
            utils_create_obj("div", "char_storage_stat_val", null, stat_text)
        )
        stats_obj.appendChild(stat_obj);
    }
    var vision_stat_obj = utils_create_obj("div", "char_storage_stat char_storage_vision");
    vision_stat_obj.appendChild(utils_create_label_img(vision_stat, data_stats[vision_stat].name));
    if (character_display_stats[vision_stat] == undefined) {
        var vision_stat_text = "?";
    } else {
        var vision_stat_text = utils_format_stat_value(data_stats[vision_stat], character_display_stats[vision_stat]);
    }
    vision_stat_obj.appendChild(
        utils_create_obj("div", "char_storage_stat_val", null, vision_stat_text)
    )
    stats_obj.appendChild(vision_stat_obj);

    return stats_obj;
}

function equip_character_storage_display_equip(character_storage) {
    var weapon_type = data_characters[character_storage.id].weapon;
    var weapon = utils_array_get_by_lookup(data_weapons[weapon_type], "id", character_storage.weapon.id);

    var equip_obj = utils_create_obj("div", "char_storage_equip");
    equip_obj.appendChild(equip_display_equipment_icon("/images/icons/weapon/" + weapon_type + "/" + weapon.icon + ".png", weapon.rarity, equip_weapon_display_tooltip(weapon, character_storage.weapon, weapon_type), const_level_list[character_storage.weapon.level]));

    for (var i = 0; i < const_artifact_types.length; i++) {
        var artifact_id = const_artifact_types[i];
        var artifact = utils_array_get_by_lookup(data_artifact_sets, "id", character_storage.artifacts[artifact_id].id);
        equip_obj.appendChild(equip_display_equipment_icon(
            "/images/icons/artifact/" + artifact_id + "/" + artifact.icon + ".png",
            character_storage.artifacts[artifact_id].stars,
            equip_artifacts_display_tooltip(artifact_id, character_storage.artifacts[artifact_id]),
            character_storage.artifacts[artifact_id].level
        ));
    }

    return equip_obj;
}


function equip_character_storage_display_skill_level(skill_name, skill_level) {
    var skill_obj = utils_create_obj("div", "char_storage_skill");
    skill_obj.appendChild(utils_create_label_img(skill_name, const_bonusdmg_names[skill_name]));
    skill_obj.appendChild(utils_create_obj("div", null, null, skill_level));
    return skill_obj;
}

function equip_character_storage_display_data(character_storage) {
    var data_obj = utils_create_obj("div", "char_storage_data");

    data_obj.appendChild(utils_create_obj("div", "char_storage_lv", null, "Lv. " + const_level_list[character_storage.level]));
    data_obj.appendChild(utils_create_obj("div", "char_storage_const", null, "C" + const_constel_list[character_storage.constel]));

    for (var i = 0; i < const_attack_level_types.length; i++) {
        data_obj.appendChild(equip_character_storage_display_skill_level(const_attack_level_types[i], character_storage["level" + const_attack_level_types[i]] + 1));
    }

    return data_obj;
}

function equip_character_storage_display_name(character, character_name) {
    var name_container = utils_create_obj("div", "char_storage_name");
    name_container.appendChild(utils_create_img_svg(character.vision));
    var full_name = character.name;
    if (character_name) {
        full_name = full_name + " (" + character_name + ")";
    }
    name_container.appendChild(utils_create_obj("div", character.vision, null, full_name));

    return name_container;
}

function equip_character_return_party_id_by_name(character_id) {
    for (var i = 0; i < const_party_size; i++) {
        if (user_objects.user_party[i].id == character_id) {
            return i;
        }
    }
    return -1;
}

function equip_character_return_party_id_by_special(special_condition, party_id, skill_index, artifact_stat, artifact_stat_party) {

    switch (special_condition) {
        case "highest_elemastery":
            var highest_index = 0;
            var highest_value = 0;
            for (var i = 0; i < const_party_size; i++) {

                if (skill_index === null || i != party_id) {
                    if (artifact_stat === null) {
                        var output_stats = output_party[i].stats.initial.total;
                    } else {
                        var output_stats = output_party[i].stats.optimize[artifact_stat_party][artifact_stat];
                    }                    
                } else {
                    var output_stats = output_party[party_id].skills.active.details[skill_index].stats;
                }

                if (output_stats["elemastery"] > highest_value) {
                    highest_value = output_stats["elemastery"];
                    highest_index = i;
                }
            }
            return highest_index;

            break;

        default:
            return
    }
}

function equip_character_return_variable_count(var_name, var_value=true) {
    var count = 0;
    if (var_value !== null) {
        for (var i = 0; i < const_party_size; i++) {
            if (data_characters[user_objects.user_party[i].id][var_name] === var_value) {
                count += 1;
            }
        }
    } else {
        var unique_values = [];
        for (var i = 0; i < const_party_size; i++) {
            if (!unique_values.includes(data_characters[user_objects.user_party[i].id][var_name])) {
                unique_values.push(data_characters[user_objects.user_party[i].id][var_name]);
                count += 1;
            }
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

function equip_character_storage_return_active_character(party_id) {
    var active_character = user_objects.user_party[party_id];
    var output_character = output_party[party_id];  

    var character = structuredClone(default_storage_character);
    character.uid = null;
    character.source = "ashal";
    character.id = active_character.id;

    character.level = active_character.level;
    character.constel = active_character.constel;
    character.levelnormal = active_character.levelnormal;
    character.levelskill = active_character.levelskill;
    character.levelburst = active_character.levelburst;
    character.display_stats = equip_stats_return_display_stats(active_character);
    character.vision_stat = output_character.stats.vision_stat;

    character.weapon = structuredClone(active_character.weapon);
    character.artifacts = structuredClone(active_character.artifacts);

    return character;
}

function equip_character_storage_return_filtered_character(character_id, search, vision, weapon, rarity) {    
    var character = data_characters[character_id];
    if (search && !utils_includes_alt_names(character.name, null, search)) {
        return false;
    } else if (vision.length > 0 && !vision.includes(character.vision)) {
        return false;
    } else if (weapon.length > 0 && !weapon.includes(character.weapon)) {
        return false;
    } else if (rarity.length > 0 && !rarity.includes(character.rarity)) {
        return false;
    } else {
        return true;
    }
}

function equip_character_storage_return_filter() {
    var filter = {};
    var search = document.getElementById("prompt_select_search");
    filter.search = search.value;

    filter.vision = [];
    for (var i = 0; i < const_character_visions.length; i++) {
        if (document.getElementById("character_filter_" + const_character_visions[i]).checked) {
            filter.vision.push(const_character_visions[i]);
        }
    }
    filter.weapon = [];
    for (var i = 0; i < const_weapon_types.length; i++) {
        if (document.getElementById("character_filter_" + const_weapon_types[i]).checked) {
            filter.weapon.push(const_weapon_types[i]);
        }
    }
    filter.rarity = [];
    for (var i = 4; i < 6; i++) {
        if (document.getElementById("character_filter_star" + i).checked) {
            filter.rarity.push(i);
        }
    }
    return filter;
}
