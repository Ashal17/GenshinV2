function equip_control_display_all() {

    for (var i = 0; i < const_party_size; i++) {
        if (i == user_objects.user_active_character) {
            document.getElementById("container_character_" + i).className = "container_object container_character active_character";
        } else {
            document.getElementById("container_character_" + i).className = "container_object container_character";
        }
    }

}

function equip_control_create_share_storage(btn) {
    var prompt = utils_create_prompt(btn, "prompt_select", "main_window");
    if (!prompt) {
        return;
    }

    var headerline = utils_create_obj("div", "prompt_header");
    headerline.appendChild(utils_create_obj("div", "prompt_header_text", null, "Share"));
    headerline.appendChild(utils_create_obj("div", "spacer"));
    var decline = utils_create_obj("button", "prompt_button prompt_button_decline", null, "&#10006");
    decline.onclick = function () { utils_destroy_current_prompt(); };
    headerline.appendChild(decline);
    prompt.appendChild(headerline);

    var container = utils_create_obj("div", "share_container");
    container.appendChild(utils_create_obj("div", "char_storage_column", "share_column_active"));
    container.appendChild(utils_create_obj("div", "char_storage_column", "share_column"));
    prompt.appendChild(container);
    
    equip_share_display_all();
    utils_setup_prompt_destroyer(prompt, "active_prompt_share");
    utils_update_frame_position_center(btn, prompt);
}

function equip_control_create_enka(btn) {

    var prompt = utils_create_prompt(btn, "prompt_select", "main_window");
    if (!prompt) {
        return;
    }
    var headerline = utils_create_obj("div", "prompt_header");   
    headerline.appendChild(utils_create_obj("div", "prompt_header_text", null, "Load Enka"));
    headerline.appendChild(utils_create_obj("div", "spacer"));
    var decline = utils_create_obj("button", "prompt_button prompt_button_decline", null, "&#10006");
    decline.onclick = function () { utils_destroy_current_prompt(); };
    headerline.appendChild(decline);
    prompt.appendChild(headerline);
    
    var inputline = utils_create_obj("div", "enka_load_container");
    prompt.appendChild(inputline);
    var inputfield = utils_create_obj("input", "prompt_input_field", "prompt_input_enka");
    inputfield.placeholder = "UID...";
    inputfield.value = user_preferences.enka.last_uid;
    inputline.appendChild(inputfield);

    inputline.appendChild(utils_create_img_btn("enka-download", equip_enka_change_load_uid, "Load Enka characters", "enka_load", "enka_load"));
    inputline.appendChild(utils_create_img_btn("enka-share", equip_enka_change_goto_uid, "Go to Enka", "enka_share", "enka_load"));
    inputline.appendChild(utils_create_img_btn("download", equip_enka_change_save_character_all, "Save All", "enka_save_all", "enka_load"));

    prompt.appendChild(utils_create_obj("div", "char_storage_column", "enka_column"));

    inputline.addEventListener("keyup", function (event) {
        if (event.code === "Escape") {
            event.preventDefault();
            utils_destroy_current_prompt();
        }
    });
    inputfield.addEventListener("keyup", function (event) {
        if (event.code === "Enter") {
            event.preventDefault();
            equip_enka_change_load_uid();
        }
    });
       
    equip_enka_display_all();
    utils_setup_prompt_destroyer(prompt, "active_prompt_enka");
    utils_update_frame_position_center(btn, prompt);
    inputfield.focus();
}

function equip_control_create_character_storage(btn) {
    var prompt = utils_create_prompt(btn, "prompt_select", "main_window");
    if (!prompt) {
        return;
    }
    var headerline = utils_create_obj("div", "prompt_header");   
    var search = utils_create_obj("input", "prompt_select_search", "prompt_select_search");
    search.placeholder = "Search...";
    search.addEventListener("input", function () {
        equip_character_storage_display_all();
    });
    search.addEventListener("keyup", function (event) {
        if (event.code === "Escape") {
            event.preventDefault();
            utils_destroy_current_prompt();
        }
    });
    headerline.appendChild(search);
    headerline.appendChild(utils_create_obj("div", "prompt_header_text", null, "Character Storage"));
    headerline.appendChild(utils_create_obj("div", "spacer"));
    var decline = utils_create_obj("button", "prompt_button prompt_button_decline", null, "&#10006");
    decline.onclick = function () { utils_destroy_current_prompt(); };
    headerline.appendChild(decline);
    prompt.appendChild(headerline);

    var subheader = equip_control_create_character_filter();
    subheader.onchange = function () { equip_character_storage_display_all(); };
    prompt.appendChild(subheader);

    prompt.appendChild(utils_create_obj("div", "char_storage_column", "character_storage_active_column"));
    prompt.appendChild(utils_create_obj("div", "char_storage_column", "character_storage_column"));

    equip_character_storage_display_active_all();
    equip_character_storage_display_all();
    utils_setup_prompt_destroyer(prompt, "active_prompt_char_storage");
    utils_update_frame_position_center(btn, prompt);
    search.focus();
}

function equip_control_create_character_select(party_id, icon) {
    var options = [];

    for (var key in data_characters) {
        options.push(equip_control_create_character(key, party_id));
    }

    options = utils_array_sort(options, "sort");

    options.unshift(options.splice(options.findIndex(item => item.id === "prompt_option_none"), 1)[0]);

    var subheader = equip_control_create_character_filter();
    subheader.onchange = function () {
        equip_character_change_filter(options);
    }

    utils_create_prompt_select("Select Party Member " + (party_id + 1), icon.id, null, options, "main_window", icon.id, subheader);
}

function equip_control_create_character_filter() {
    var obj = utils_create_obj("div", "filter_header");
    var filter_vision = utils_create_obj("div", "filter_list", "character_filter_vision");
    for (var i = 0; i < const_character_visions.length; i++) {
        filter_vision.appendChild(
            utils_create_checkbox(
                "filter_icon filter_icon_vision",
                "character_filter_" + const_character_visions[i],
                const_character_visions[i],
                data_visions[const_character_visions[i]].name)
        );
    }
    obj.appendChild(filter_vision);

    var filter_weapon = utils_create_obj("div", "filter_list", "character_filter_weapon");
    for (var i = 0; i < const_weapon_types.length; i++) {
        filter_weapon.appendChild(
            utils_create_checkbox(
                "filter_icon filter_icon_weapon",
                "character_filter_" + const_weapon_types[i],
                const_weapon_types[i],
                utils_capitalize(const_weapon_types[i]))
        );
    }
    obj.appendChild(filter_weapon);

    var filter_rarity = utils_create_obj("div", "filter_list", "character_filter_rarity");
    for (var i = 4; i < 6; i++) {
        filter_rarity.appendChild(
            utils_create_checkbox(
                "filter_icon filter_icon_weapon",
                "character_filter_star" + i,
                "star-" + i,
                i + " Star")
        );
    }
    obj.appendChild(filter_rarity);

    return obj;
}

function equip_control_create_character(character_id, party_id) {
    var character = data_characters[character_id];

    var icon = utils_create_obj("div", "character_icon " + character.vision, "prompt_option_" + character_id);
    var icon_container = utils_create_obj("div", "character_img");
    icon_container.appendChild(utils_create_img(null, null, "images/icons/character/" + character_id + "/char.png"));
    icon_container.onclick = function () { equip_character_change(character_id, party_id); utils_destroy_current_prompt(); };
    icon.appendChild(icon_container);
    
    icon.name = character.name;
    icon.vision = character.vision;
    icon.weapon = character.weapon;
    icon.rarity = character.rarity;

    if (character.short_name) {
        var char_name = character.short_name;
    } else {
        var char_name = character.name;
    }

    icon.sort = char_name;

    var label_name = utils_create_obj("p", "character_img_label", null, char_name);
    icon.appendChild(label_name);

    if (character.unreleased) {
        icon.appendChild(utils_create_obj("div", "character_ribbon ribbon_left_top",null , "Beta"));
    }

    return icon;
}

function equip_control_create_enemy_select(icon) {
    var options = [];

    for (var i = 0; i < data_enemies.length; i++) {
        options.push(equip_control_create_enemy(i));
    }

    utils_create_prompt_select("Select Enemy", icon.id, null, options, "main_window", icon.id);
}

function equip_control_create_enemy(index) {
    var enemy = data_enemies[index];

    var icon = utils_create_obj("div", "character_icon " + enemy.vision, "prompt_option_" + index);
    var icon_container = utils_create_obj("div", "character_img");
    icon.name = enemy.name;
    icon_container.onclick = function () { equip_enemy_change(enemy.id); utils_destroy_current_prompt(); };
    icon.appendChild(icon_container);
    icon_container.appendChild(utils_create_img(null, null, "images/icons/enemy/" + enemy.icon + ".png"));

    var label_name = utils_create_obj("p", "character_img_label enemy_img_label", null, enemy.name);
    icon.appendChild(label_name);

    
    return icon;
}

function equip_control_create_weapon_select(icon) {
    var weapon_type = output_party[user_objects.user_active_character].weapon_type;
    var options = [];

    for (var i = 0; i < data_weapons[weapon_type].length; i++) {
        if (data_weapons[weapon_type][i].icon) {
            options.push(equip_control_create_weapon(i, weapon_type));
        }       
    }

    options = utils_array_sort(options, "name");
    options = utils_array_sort(options, "rarity");

    utils_create_prompt_select("Select Weapon ", icon.id, "prompt_equipment_select", options, "main_window", icon.id);
}

function equip_control_create_weapon(index, weapon_type) {
    var weapon = data_weapons[weapon_type][index];
    var current_weapon = user_objects.user_party[user_objects.user_active_character].weapon;

    var icon = utils_create_obj("div", "tooltip_trigger equipment_icon img_stars_" + weapon.rarity, "prompt_option_" + weapon.id);
    var icon_container = utils_create_obj("div", "equipment_img");
    icon.name = weapon.name;
    icon.rarity = weapon.rarity;
    icon.appendChild(icon_container);
    icon_container.appendChild(utils_create_img(null, null, "images/icons/weapon/" + weapon_type +"/"+ weapon.icon + ".png"));

    var label_name = utils_create_obj("p", "equipment_img_label", null, weapon.name);
    icon.appendChild(label_name);
    
    var tooltip = equip_weapon_display_tooltip(weapon, current_weapon, weapon_type);
    icon.appendChild(tooltip);
    icon.onmouseover = function () { utils_update_frame_position_contain(this, tooltip, "bottom"); }

    icon.onclick = function () { equip_weapon_change(weapon.id); utils_destroy_current_prompt(); };

    return icon;
}

function equip_control_create_artifacts_storage(artifact_id, btn) {
    var prompt = utils_create_prompt(btn, "prompt_select", "main_window");
    if (!prompt) {
        return;
    }

    var headerline = utils_create_obj("div", "prompt_header");
    prompt.appendChild(headerline);
    headerline.appendChild(utils_create_obj("div", "prompt_header_text", null, data_artifact_vars[artifact_id].name + " Storage"));
    headerline.appendChild(utils_create_obj("div", "spacer"));
    var decline = utils_create_obj("button", "prompt_button prompt_button_decline", null, "&#10006");
    decline.onclick = function () { utils_destroy_current_prompt(); };
    headerline.appendChild(decline);

    prompt.appendChild(utils_create_obj("div", "artifact_storage_header_column", "artifact_storage_header_column"));
    prompt.appendChild(utils_create_obj("div", "artifact_storage_column", "artifact_storage_column"));

    equip_artifacts_storage_display_header(artifact_id);
    equip_artifacts_storage_display_all(artifact_id);
    utils_setup_prompt_destroyer("active_prompt", "active_prompt_artifact_storage");
    utils_update_frame_position_center(btn, prompt);
}

function equip_control_create_artifacts_select(artifact_id, icon) {
    var options = [];

    for (var i = 0; i < data_artifact_sets.length; i++) {
        if (Object.hasOwn(data_artifact_sets[i], artifact_id) ) {
            options.push(equip_control_create_artifact(i, artifact_id));
        }
    }

    options = utils_array_sort(options, "name");
    options = utils_array_sort(options, "rarity");

    utils_create_prompt_select("Select " + data_artifact_vars[artifact_id].name, icon.id, "prompt_equipment_select", options, "main_window", icon.id);
}

function equip_control_create_artifact_icon(artifact, artifact_id) {

    var icon = utils_create_obj("div", "tooltip_trigger equipment_icon img_stars_" + artifact.stars.join("_"), "prompt_option_" + artifact.id);
    var icon_container = utils_create_obj("div", "equipment_img");
    icon.name = artifact.name;
    icon.alt_names = [artifact[artifact_id]];
    icon.rarity = artifact.stars[0];
    icon.appendChild(icon_container);
    icon_container.appendChild(utils_create_img(null, null, "images/icons/artifact/" + artifact_id + "/" + artifact.icon + ".png"));

    var label_name = utils_create_obj("p", "equipment_img_label", null, artifact[artifact_id]);
    icon.appendChild(label_name);

    var tooltip = equip_artifacts_storage_display_tooltip(artifact);
    icon.appendChild(tooltip);
    icon.onmouseover = function () { utils_update_frame_position_contain(this, tooltip, "bottom"); };
    return icon;
}

function equip_control_create_artifact(index, artifact_id) {
    var artifact = data_artifact_sets[index];
    var icon = equip_control_create_artifact_icon(artifact, artifact_id);

    icon.onclick = function () { equip_artifacts_change(artifact.id, artifact_id); utils_destroy_current_prompt(); };

    return icon;
}

function equip_control_create_active_skill_effects(index, btn) {
    var prompt = utils_create_prompt(btn, "prompt_select", "main_window");
    if (!prompt) {
        return;
    }

    var headerline = utils_create_obj("div", "prompt_header");
    prompt.appendChild(headerline);
    headerline.appendChild(utils_create_obj("div", "prompt_header_text", null, "Individual Effects for Active Skill"));
    headerline.appendChild(utils_create_obj("div", "spacer"));
    var decline = utils_create_obj("button", "prompt_button prompt_button_decline", null, "&#10006");
    decline.onclick = function () { utils_destroy_current_prompt(); };
    headerline.appendChild(decline);

    var effects_parent = utils_create_obj("div", "frame_window_content frame_effects");

    for (var i = 0; i < const_effect_types.length; i++) {
        effects_parent.appendChild(equip_setup_ui_effects(const_effect_types[i], index));
    }
    prompt.appendChild(effects_parent);

    equip_effects_display_all(index);
    utils_setup_prompt_destroyer("active_prompt", "active_prompt_skill_effects");
    utils_update_frame_position_center(btn, prompt);
}
