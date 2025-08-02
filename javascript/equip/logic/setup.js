window_frame_ids = [
    { "id": "frame_party", "text": "Party", "order":0, "display":true },
    { "id": "frame_stats", "text": "Stats", "order": 1, "display": true },
    { "id": "frame_equipment", "text": "Equipment", "order": 2, "display": true },
    { "id": "frame_effects", "text": "Effects", "order": 3, "display": true },
    { "id": "frame_skills", "text": "Skills // Storage", "order": 4, "display": true },
];

async function equip_load_all_data() {
    var ver = "?20250803";

    data_characters = await utils_load_json("/data/characters.json" + ver);
    data_enemies = await utils_load_json("/data/enemies.json" + ver);
    data_resonance = await utils_load_json("/data/resonance.json");
    data_visions = await utils_load_json("/data/visions.json");
    data_reactions = await utils_load_json("/data/reactions.json");
    data_stats = await utils_load_json("/data/stats.json" + ver);
    data_stat_transformations = await utils_load_json("/data/stat_transformations.json" + ver);
    data_weapons = await utils_load_json("/data/weapons.json" + ver);
    data_weapon_stats = await utils_load_json("/data/weapon_stats.json");
    data_artifact_vars = await utils_load_json("/data/artifact_vars.json");
    data_artifact_stats = await utils_load_json("/data/artifact_stats.json");
    data_artifact_sets = await utils_load_json("/data/artifact_sets.json");
    data_artifact_enka_stats = await utils_load_json("/data/artifact_enka_stats.json");
    data_effects = await utils_load_json("/data/effects.json");

    for (var i = 0; i < data_enemies.length; i++) {
        for (var ii = 0; ii < data_enemies[i].stats.length; ii++) {
            if (data_enemies[i].stats[ii].value == "Infinity") {
                data_enemies[i].stats[ii].value = Infinity;
            }
        }
    }
}

async function equip_setup_all() {

    var setup_success = true;
    try {
        await equip_load_all_data();
        
        equip_setup_default_stats();
        equip_setup_storage_objects();
        equip_setup_user_objects();
        equip_setup_output_objects();
        equip_setup_character_storage_objects();
        equip_setup_artifacts_storage_objects();
        equip_setup_share_objects();

        await equip_account_setup();
        await equip_setup_preferences_load();
               
        equip_setup_ui_frames();
        equip_setup_ui_frame_party();
        equip_setup_ui_frame_stats();
        equip_setup_ui_frame_equipment();
        equip_setup_ui_frame_effects();
        equip_setup_ui_frame_skills();

        var storage_account = await equip_account_return_storage();
        var share_account = await equip_account_return_share();
        var legacy_storage = await equip_legacy_v1_account_storage_load(storage_account);

        equip_storage_load_user_storage(storage_account.storage_objects);
        equip_storage_display_header_type();
        equip_storage_display_all();

        var load_url_share = await equip_share_load_url();
        if (load_url_share) {
            equip_storage_load(load_url_share);
        }
        var load_url_legacy = equip_legacy_v1_url_load_url();

        if (!load_url_share && !load_url_legacy) {
            equip_storage_load_last();
        } 

        equip_character_storage_load_last(storage_account.character_storage_objects, legacy_storage.setup);
        equip_artifacts_storage_load_last(storage_account.artifact_storage_objects, legacy_storage.artifact_list);

        equip_share_load_account(share_account);
        
    } catch (err) {
        utils_loading_show_error(err, "An Error occured during loading the page.<br>Please reload the page with CTRL+F5.<br>If the Error persists, please contact the administrator.");
        setup_success = false;
    }

    if (setup_success) {
        utils_loading_hide();
    }
  
}

async function equip_setup_preferences_load() {
   
    var preferences_account = await equip_account_return_preferences();
    var pref_data = null;
    if (preferences_account) {
        utils_log_debug("Found preferences at account.");
        pref_data = preferences_account;
    } else {
        var preferences_local = localStorage.getItem("user_preferences");
        if (preferences_local) {
            utils_log_debug("Found preferences locally.");
            pref_data = JSON.parse(preferences_local);
        }       
    }
    user_preferences = {};
    equip_stats_load_preferences(pref_data);
    equip_storage_load_preferences(pref_data);
    equip_skills_load_preferences(pref_data);
    equip_setup_enka_objects(pref_data);
    equip_setup_window_objects(pref_data);
    equip_setup_scanner_objects();

    if (!preferences_account && user_account && user_account.status) {
        utils_log_debug("Saving preferences to account.");
        utils_preferences_save();
    }
}

function equip_setup_initialize() {
    equip_character_update_all(false);
    equip_weapon_update_all();
    equip_artifacts_update_all_all();
    equip_effects_update_stats_all();

    equip_stats_update_total_all();
    equip_skills_update_all();
    equip_effects_update_options_all();

    equip_character_display_all();
    equip_control_display_all();
    equip_character_display_resonance();
    equip_enemy_display();
    equip_weapon_display();
    equip_artifacts_display_all();
    equip_effects_display_all();
    equip_skills_display_all();
    equip_storage_display_active();
    equip_stats_display();
}

function equip_setup_ui_frames() {

    utils_setup_prompt_destroyer();
    utils_create_frames("main_window", user_preferences.window.equip);

}

function equip_setup_ui_frame_party() {
    var parent = document.getElementById("frame_party_content");
    parent.className += " frame_party";
      
    for (var i = 0; i < const_party_size; i++) {
        parent.appendChild(equip_setup_ui_character(i));
    }
    var resonance_container = utils_create_obj("div", "container_party_panel");
    resonance_container.appendChild(equip_setup_ui_party_panel());
    resonance_container.appendChild(equip_setup_ui_resonance());
    parent.appendChild(resonance_container);
    parent.appendChild(equip_setup_ui_enemy());

}

function equip_setup_ui_character(index) {
    var obj = utils_create_obj("div", "container_object container_character", "container_character_" + index);
    obj.onclick = function (event) { equip_active_character_change(index); }
    if (index == 0) {
        obj.className += " active_character";
    }
    var name_row = utils_create_obj("div", "container_namerow");
    obj.appendChild(name_row);
    var char_name = utils_create_obj("p", "container_name", "character_name_" + index, "None");
    name_row.appendChild(char_name);

    var row = utils_create_obj("div", "container_subrow");
    obj.appendChild(row);
      
    var icon = utils_create_obj("div", "character_icon", "character_icon_" + index);
    row.appendChild(icon);

    var level_container = utils_create_obj("div", "container")
    icon.appendChild(level_container);
    var level = utils_create_obj("div", "icon_selects character_level", "character_level_" + index);
    level.onclick = function (event) { utils_create_prompt_values(level.id, equip_character_change_level, const_level_list, index, level_container); event.preventDefault(); event.stopImmediatePropagation(); };
    level_container.appendChild(level);
    level.appendChild(utils_create_obj("div", "icon_selects_text", "character_level_text_" + index, "1"))

    var icon_container = utils_create_obj("div", "character_img", "character_icon_container_" + index);
    icon_container.onclick = function (event) { equip_control_create_character_select(index, icon_container); event.preventDefault(); event.stopImmediatePropagation(); };
    icon.appendChild(icon_container);
    icon_container.appendChild(utils_create_img(null, "character_img_" + index, "/images/icons/characters.png"));

    var constel_container = utils_create_obj("div", "container")
    icon.appendChild(constel_container);
    var constel = utils_create_obj("div", "icon_selects character_constel", "character_constel_" + index);
    constel.onclick = function (event) { utils_create_prompt_values(constel.id, equip_character_change_constel, const_constel_list, index, constel_container); event.preventDefault(); event.stopImmediatePropagation(); };
    constel_container.appendChild(constel);
    constel.appendChild(utils_create_obj("div", "icon_selects_text", "character_constel_text_" + index, "C0"))

    var stats = utils_create_obj("div", "character_stats", "stats_unit_party_" + index);
    row.appendChild(stats);  

    return obj;
}

function equip_setup_ui_party_panel() {
    var panel = utils_create_obj("div", "frame_party_panel", "frame_party_panel");
    var load_enka = utils_create_img_btn("enka", null, "Load Enka", "party_panel_enka");
    load_enka.className += " enka_btn"
    load_enka.onclick = function (event) { equip_control_create_enka(load_enka.id); event.preventDefault(); };
    panel.appendChild(load_enka);
       
    var artifact_scanner = utils_create_img_btn("artifact", null, "Artifact Scanner", "party_panel_scanner");
    artifact_scanner.onclick = function (event) { equip_control_create_artifact_scanner(artifact_scanner.id); event.preventDefault(); };
    panel.appendChild(artifact_scanner);

    var share_storage = utils_create_img_btn("account-multiple-outline-share", null, "Share", "party_panel_share");
    share_storage.onclick = function (event) { equip_control_create_share_storage(share_storage.id); event.preventDefault(); };
    panel.appendChild(share_storage);

    var character_storage = utils_create_img_btn("account-outline-database", null, "Character Storage", "party_panel_storage");
    character_storage.onclick = function (event) { equip_control_create_character_storage(character_storage.id); event.preventDefault(); };
    panel.appendChild(character_storage);

    return panel;
}

function equip_setup_ui_resonance() {
    var obj = utils_create_obj("div", "container_object container_resonance");

    for (var i = 0; i < data_resonance.length; i++) {
        var resonance = utils_create_obj("div", "resonance tooltip_trigger", "resonance_" + i);
        resonance.appendChild(utils_create_obj("p", "resonance_name " + data_resonance[i].vision, null, data_resonance[i].name));
        var resonance_icons = utils_create_obj("div", "resonance_icons");
        resonance.appendChild(resonance_icons);
        if (data_resonance[i].vision && data_resonance[i].req) {
            for (var ii = 0; ii < data_resonance[i].req; ii++) {
                resonance_icons.appendChild(utils_create_img_svg(data_resonance[i].vision));
            }
        }

        var resonance_tooltip = utils_create_obj("div", "tooltip_hover");
        for (var ii = 0; ii < data_resonance[i].bonus.length; ii++) {
            resonance_tooltip.appendChild(utils_create_bonus(data_resonance[i].bonus[ii]));
        }
        resonance.appendChild(resonance_tooltip);

        obj.appendChild(resonance);
    }
    return obj;
}

function equip_setup_ui_enemy() {
    var obj = utils_create_obj("div", "container_object container_character container_enemy", "container_enemy");

    var name_row = utils_create_obj("div", "container_namerow");
    name_row.appendChild(utils_create_obj("p", "container_name", "enemy_name", "None"));
    obj.appendChild(name_row);


    var row = utils_create_obj("div", "container_subrow");
    obj.appendChild(row);

    var icon = utils_create_obj("div", "character_icon", "enemy_icon");
    row.appendChild(icon);

    var level_container = utils_create_obj("div", "container")
    icon.appendChild(level_container);

    var level = utils_create_obj("div", "icon_selects", "enemy_level");
    level.onclick = function (event) { utils_create_prompt_input(null, level.id, equip_enemy_change_level, null, user_objects.user_enemy.level, level_container); event.preventDefault(); };
    level_container.appendChild(level);
    level.appendChild(utils_create_obj("div", "icon_selects_text", "enemy_level_text", "0"))

    var icon_container = utils_create_obj("div", "character_img enemy_img", "enemy_icon_container");
    icon_container.onclick = function (event) { equip_control_create_enemy_select(icon_container); event.preventDefault(); };
    icon.appendChild(icon_container);
    icon_container.appendChild(utils_create_img(null, "enemy_img" , "/images/icons/enemy/none.png"));


    var stats = utils_create_obj("div", "character_stats", "stats_unit_enemy");
    row.appendChild(stats);

    return obj;
}

function equip_setup_ui_frame_stats() {
    var parent = document.getElementById("frame_stats_content");
    parent.className += " frame_stats";

    for (var i = 0; i < const_display_stats_columns.length; i++) {
        parent.appendChild(utils_create_obj("div", "stats_detail_column", "stats_detail_column_" + i));       
    }
}

function equip_setup_ui_frame_equipment() {
    var parent = document.getElementById("frame_equipment_content");
    parent.className += " frame_equipment";

    parent.appendChild(equip_setup_ui_weapon());
    for (var i = 0; i < const_artifact_types.length; i++) {
        parent.appendChild(equip_setup_ui_artifact(const_artifact_types[i]));       
    }
}

function equip_setup_ui_weapon() {
    var obj = utils_create_obj("div", "container_object container_weapon", "container_weapon");

    var name_row = utils_create_obj("div", "container_namerow");
    name_row.appendChild(utils_create_obj("p", "container_name", "weapon_name", "None"));

    obj.appendChild(name_row);

    var row = utils_create_obj("div", "container_subrow");
    obj.appendChild(row);

    var icon = utils_create_obj("div", "equipment_icon", "weapon_icon");
    row.appendChild(icon);

    var level_container = utils_create_obj("div", "container")
    icon.appendChild(level_container);
    var level = utils_create_obj("div", "icon_selects weapon_level", "weapon_level");
    level.onclick = function (event) { utils_create_prompt_values(level.id, equip_weapon_change_level, equip_weapon_return_level_options(), null, level_container); event.preventDefault(); };
    level_container.appendChild(level);
    level.appendChild(utils_create_obj("div", "icon_selects_text", "weapon_level_text", "1"))

    var icon_container = utils_create_obj("div", "equipment_img", "weapon_icon_container");
    icon_container.onclick = function (event) { equip_control_create_weapon_select(icon_container); event.preventDefault(); };
    icon.appendChild(icon_container);
    icon_container.appendChild(utils_create_img(null, "weapon_img", "/images/icons/weapons.png"));

    var refine_container = utils_create_obj("div", "container")
    icon.appendChild(refine_container);
    var refine = utils_create_obj("div", "icon_selects weapon_refine", "weapon_refine");
    refine.onclick = function (event) { utils_create_prompt_values(refine.id, equip_weapon_change_refine, const_refine_list, null, refine_container); event.preventDefault(); };
    refine_container.appendChild(refine);
    refine.appendChild(utils_create_obj("div", "icon_selects_text", "weapon_refine_text", "R1"));

    var stats = utils_create_obj("div", "equipment_stats", "weapon_stats");
    row.appendChild(stats);

    return obj;
}

function equip_setup_ui_artifact(artifact_id) {
    var obj = utils_create_obj("div", "container_object container_artifact", "container_artifact_" + artifact_id);

    var name_row = utils_create_obj("div", "container_namerow");
    name_row.appendChild(utils_create_img_btn(
        "artifact-" + artifact_id + "-database",
        function () { equip_control_create_artifacts_storage(artifact_id, artifact_id + "_storage"); },
        data_artifact_vars[artifact_id].name + " Storage",
        artifact_id + "_storage",
        "container")
    );

    name_row.appendChild(utils_create_obj("p", "container_name", "artifact_name_" + artifact_id, "None"));
    var artifact_set = utils_create_obj("div", "artifact_set tooltip_trigger");
    artifact_set.appendChild(utils_create_obj("p", "artifact_set_text", "artifact_set_text_" + artifact_id, "&times;0"));
    artifact_set.appendChild(utils_create_obj("div", "artifact_set_description tooltip_hover", "artifact_set_description_" + artifact_id));
    name_row.appendChild(artifact_set);   
    obj.appendChild(name_row);

    var row = utils_create_obj("div", "container_subrow");
    obj.appendChild(row);

    var icon = utils_create_obj("div", "equipment_icon", "artifact_icon_" + artifact_id);
    row.appendChild(icon);

    var level_container = utils_create_obj("div", "container", "artifact_level_container_" + artifact_id)
    icon.appendChild(level_container);
    var level = utils_create_obj("div", "icon_selects artifact_level", "artifact_level_" + artifact_id);
    level.onclick = function (event) { utils_create_prompt_values(level.id, equip_artifacts_change_level, equip_artifacts_return_level_options(artifact_id), artifact_id, level_container); event.preventDefault(); };
    level_container.appendChild(level);
    level.appendChild(utils_create_obj("div", "icon_selects_text", "artifact_level_text_" + artifact_id, "+ 0"));

    var icon_container = utils_create_obj("div", "equipment_img", "artifact_icon_container_" + artifact_id);
    icon_container.onclick = function (event) { equip_control_create_artifacts_select(artifact_id, icon_container); event.preventDefault(); };
    icon.appendChild(icon_container);
    icon_container.appendChild(utils_create_img(null, "artifact_img_" + artifact_id, "/images/icons/artifact/" + artifact_id + "/none.png"));

    var stars_container = utils_create_obj("div", "container", "artifact_stars_container_" + artifact_id)
    icon.appendChild(stars_container);
    var stars = utils_create_obj("div", "icon_selects artifact_stars", "artifact_stars_" + artifact_id);
    stars.onclick = function (event) { utils_create_prompt_values(stars.id, equip_artifacts_change_stars, equip_artifacts_return_stars_options(artifact_id), artifact_id, stars_container); event.preventDefault(); };
    stars_container.appendChild(stars);
    stars.appendChild(utils_create_obj("div", "icon_selects_text", "artifact_stars_text_" + artifact_id, "0 &#9733;"));

    var stats = utils_create_obj("div", "equipment_stats artifact_stats", "artifact_stats_" + artifact_id);
    row.appendChild(stats);

    var main_stat_container = utils_create_obj("div", "container artifact_main_container", "artifact_main_container_" + artifact_id);
    stats.appendChild(main_stat_container);
    var main_stat = utils_create_obj("div", "icon_selects artifact_main", "artifact_main_" + artifact_id);
    if (equip_artifacts_return_main_options(artifact_id).length > 1) {
        main_stat.onclick = function (event) { utils_create_prompt_values(main_stat.id, equip_artifacts_change_main, equip_artifacts_return_main_options(artifact_id), artifact_id, main_stat_container); event.preventDefault(); };
    }
    main_stat_container.appendChild(main_stat);
    main_stat.appendChild(utils_create_obj("div", "icon_selects_text", "artifact_main_text_" + artifact_id, "Empty"));

    for (let i = 0; i < const_artifact_sub_stats; i++) {
        let sub_stat_line = utils_create_obj("div", "artifact_sub_line");
        stats.appendChild(sub_stat_line);

        let sub_stat_container = utils_create_obj("div", "container", "artifact_sub_container_" + artifact_id + i);
        sub_stat_line.appendChild(sub_stat_container);
        let sub_stat = utils_create_obj("div", "icon_selects artifact_sub", "artifact_sub_" + artifact_id + i);
        sub_stat.onclick = function (event) { utils_create_prompt_values(sub_stat.id, equip_artifacts_change_sub, equip_artifacts_return_sub_options(i, artifact_id), artifact_id + i, sub_stat_container); event.preventDefault(); };
        sub_stat_container.appendChild(sub_stat);
        sub_stat_text = utils_create_obj("div", "icon_selects_text")
        sub_stat_text.appendChild(utils_create_obj("span", null, "artifact_sub_text_" + artifact_id + i, "Empty"));
        sub_stat.appendChild(sub_stat_text);

        let sub_val_container = utils_create_obj("div", "container", "artifact_sub_val_container_" + artifact_id + i);
        sub_stat_line.appendChild(sub_val_container);
        let sub_val = utils_create_obj("div", "icon_selects artifact_sub_val", "artifact_sub_val_" + artifact_id + i);
        sub_val.onclick = function (event) { utils_create_prompt_input(null, sub_val.id, equip_artifacts_change_sub_value, artifact_id + i, utils_number_round(user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id].sub_stats[i].value, 2), sub_val_container); event.preventDefault(); };
        sub_val_container.appendChild(sub_val);
        sub_val.appendChild(utils_create_obj("div", "icon_selects_text", "artifact_sub_val_text_" + artifact_id + i, "0"));

        sub_stat_line.appendChild(utils_create_obj("div", "artifact_rel_val", "artifact_rel_val_text_" + artifact_id + i, "0"));
    }

    return obj;
}

function equip_setup_ui_frame_effects() {
    var parent = document.getElementById("frame_effects_content");
    parent.className += " frame_effects";

    for (var i = 0; i < const_effect_types.length; i++) {
        parent.appendChild(equip_setup_ui_effects(const_effect_types[i], null));
    }
}

function equip_setup_ui_effects(effect_type, skill_index = null) {
    var obj = utils_create_obj("div", "container_object container_effects");

    obj.appendChild(utils_create_obj("p", "container_name", null, utils_capitalize(effect_type)));
    if (skill_index === null) {
        obj.appendChild(utils_create_obj("div", "effects_column", "effects_container_" + effect_type));
    } else {
        obj.appendChild(utils_create_obj("div", "effects_column", "skill_effects_container_" + effect_type));
    }
    
    if (effect_type == "manual") {
        var new_btn = utils_create_obj("div", "new_button");
        new_btn.onclick = function (event) { equip_effects_change_new_manual(skill_index) };
        obj.appendChild(new_btn);
    }

    return obj;
}

function equip_setup_ui_frame_skills() {
    var parent = document.getElementById("frame_skills_content");
    parent.className += " frame_skills";

    parent.appendChild(equip_setup_ui_skills("permanent"));
    parent.appendChild(equip_setup_ui_skills("active"));
    parent.appendChild(equip_setup_ui_storage());
    parent.appendChild(equip_setup_ui_storage_pin());

    equip_skills_display_header();
    equip_storage_display_header_type();
}

function equip_setup_ui_skills(skill_window) {
    var obj = utils_create_obj("div", "container_object container_skills container_skills_" + skill_window);
    var name_row = utils_create_obj("div", "container_namerow");
    if (skill_window == "permanent") {
        var hide_desc = utils_create_img_btn("eye-outline", null, "Hide Passive Descriptions", "skills_hide_btn", "container");
        hide_desc.onclick = function (event) { equip_skills_change_hideshow_desc() };
        name_row.appendChild(hide_desc);
    }
    name_row.appendChild(utils_create_obj("p", "container_name", null, utils_capitalize(skill_window)));
    obj.appendChild(name_row);

    obj.appendChild(utils_create_obj("div", "skills_column", "skills_container_" + skill_window));

    

    return obj;
}

function equip_setup_ui_storage() {
    var obj = utils_create_obj("div", "container_object container_skills container_skills_storage");

    obj.appendChild(utils_create_obj("p", "container_name", null, utils_capitalize("Storage")));

    var storage_column = utils_create_obj("div", "storage_column", "storage_column");
    var storage_header = utils_create_obj("div", "storage_row");
    storage_header.appendChild(utils_create_obj("div", "storage_btn"));
    storage_header.appendChild(utils_create_obj("div", "storage_text storage_text_name", null, "Name"));
    storage_header.appendChild(utils_create_obj("div", "storage_party_container", "storage_party_container_header", "Party"));
    storage_header.appendChild(utils_create_obj("div", "storage_text storage_text_damage", "storage_text_damage_header", "Damage"));
    storage_header.appendChild(utils_create_obj("div", "storage_text storage_text_comparison", null, "Comparison"));
    storage_header.appendChild(utils_create_obj("div", "storage_btn"));
    storage_header.appendChild(utils_create_obj("div", "storage_btn"));
    storage_header.appendChild(utils_create_obj("div", "storage_btn"));
    storage_header.appendChild(utils_create_obj("div", "storage_btn"));
    storage_column.appendChild(storage_header);

    var storage_active = utils_create_obj("div", "storage_row");
    storage_active.appendChild(utils_create_obj("div", "storage_btn"));
    storage_active.appendChild(utils_create_obj("div", "storage_text storage_text_name", null, "Active"));
    storage_active.appendChild(utils_create_obj("div", "storage_party_container", "storage_party_container_active"));
    storage_active.appendChild(utils_create_obj("div", "storage_text storage_text_damage", "storage_text_damage_active"), "0");
    storage_active.appendChild(utils_create_obj("div", "storage_text storage_text_comparison", "storage_text_comparison_active", "0"));
    storage_active.appendChild(utils_create_img_btn("filter-outline", equip_storage_change_filter, "Filter Active Character", "storage_filter_active", "storage_btn"));
    storage_active.appendChild(utils_create_img_btn("pin-outline", equip_storage_change_pin, "Pin Active Damage", "storage_pin_active", "storage_btn"));
    storage_active.appendChild(utils_create_img_btn("account-outline", equip_storage_change_party_type, "Change Party/Character", "storage_party_active", "storage_btn"));
    storage_active.appendChild(utils_create_img_btn("cog-outline", equip_storage_change_comparison_type, "Change Damage Type", "storage_comparison_active", "storage_btn"));
    storage_column.appendChild(storage_active);

    obj.appendChild(storage_column);

    var new_btn_container = utils_create_obj("div", "container new_button_container");
    var new_btn = utils_create_obj("div", "new_button", "storage_new_button");
    new_btn.onclick = function (event) { utils_create_prompt_input("Enter name for new Storage", new_btn.id, equip_storage_change_new, null, "", new_btn_container); event.preventDefault(); };

    new_btn_container.appendChild(new_btn);
    obj.appendChild(new_btn_container);

    return obj;
}

function equip_setup_ui_storage_pin() {
    var obj = utils_create_obj("div", "container_storage_pin", "storage_pin");
    var storage_header = utils_create_obj("div", "storage_row");
    storage_header.appendChild(utils_create_obj("div", "storage_party_container", "storage_party_container_header_pin", "Party"));
    storage_header.appendChild(utils_create_obj("div", "storage_text", "storage_text_damage_header_pin", "Damage"));
    storage_header.appendChild(utils_create_obj("div", "storage_text", null, "Comparison"));
    obj.appendChild(storage_header);

    var storage_active = utils_create_obj("div", "storage_row");
    storage_active.appendChild(utils_create_obj("div", "storage_party_container", "storage_party_container_pin", "Party"));
    storage_active.appendChild(utils_create_obj("div", "storage_text", "storage_text_damage_pin", "Damage"));
    storage_active.appendChild(utils_create_obj("div", "storage_text", "storage_text_comparison_pin", "Comparison"));
    obj.appendChild(storage_active);

    return obj;
}

function equip_setup_user_objects(user_data = null) {
    user_objects = {};

    user_objects.user_active_character = utils_object_get_value(user_data, "user_active_character", 0);
    user_objects.user_party = [];
    for (var i = 0; i < const_party_size; i++) {
        var char = {};
        char.id = utils_object_get_value(user_data, "user_party."+i+".id", "none");
        char.level = utils_object_get_value(user_data, "user_party." + i + ".level", 0);
        char.constel = utils_object_get_value(user_data, "user_party." + i + ".constel", 0);
        char.levelnormal = utils_object_get_value(user_data, "user_party." + i + ".levelnormal", 0);
        char.levelskill = utils_object_get_value(user_data, "user_party." + i + ".levelskill", 0);
        char.levelburst = utils_object_get_value(user_data, "user_party." + i + ".levelburst", 0);

        char.weapon = {};
        char.weapon.id = utils_object_get_value(user_data, "user_party." + i + ".weapon.id", 0);
        char.weapon.level = utils_object_get_value(user_data, "user_party." + i + ".weapon.level", 0);
        char.weapon.refine = utils_object_get_value(user_data, "user_party." + i + ".weapon.refine", 0);

        char.artifacts = {};

        for (var ii = 0; ii < const_artifact_types.length; ii++) {
            var artifact = {};
            artifact.id = utils_object_get_value(user_data, "user_party." + i + ".artifacts." + const_artifact_types[ii] + ".id", 0);
            artifact.level = utils_object_get_value(user_data, "user_party." + i + ".artifacts." + const_artifact_types[ii] + ".level", 0);
            artifact.stars = utils_object_get_value(user_data, "user_party." + i + ".artifacts." + const_artifact_types[ii] + ".stars", 0);
            artifact.main_stat = utils_object_get_value(user_data, "user_party." + i + ".artifacts." + const_artifact_types[ii] + ".main_stat", data_artifact_vars[const_artifact_types[ii]].main_stats[0]);
            artifact.sub_stats = [];
            for (var iii = 0; iii < const_artifact_sub_stats; iii++) {
                var sub_stat = {};
                sub_stat.id = utils_object_get_value(user_data, "user_party." + i + ".artifacts." + const_artifact_types[ii] + ".sub_stats." + iii + ".id", const_artifact_sub_stats_options[0]);
                sub_stat.value = utils_object_get_value(user_data, "user_party." + i + ".artifacts." + const_artifact_types[ii] + ".sub_stats." + iii + ".value", 0);
                artifact.sub_stats.push(sub_stat);
            }

            char.artifacts[const_artifact_types[ii]] = artifact;
        }

        char.effects = utils_object_get_value(user_data, "user_party." + i + ".effects", []);
        char.active_skills = utils_object_get_value(user_data, "user_party." + i + ".active_skills", []);

        user_objects.user_party.push(char);
    }
    user_objects.user_enemy = {};
    user_objects.user_enemy.id = utils_object_get_value(user_data, "user_enemy.id", 0);
    user_objects.user_enemy.level = utils_object_get_value(user_data, "user_enemy.level", 0);
}

function equip_setup_storage_objects(user_storage = null) {
    storage_objects = {};
    storage_objects.saved_storage = utils_object_get_value(user_storage, "saved_storage", []);
}

function equip_setup_character_storage_objects(user_characters = null) {
    character_storage_objects = {};
    character_storage_objects.saved_characters = utils_object_get_value(user_characters, "saved_characters", []);
}

function equip_setup_artifacts_storage_objects(user_artifacts = null) {
    artifact_storage_objects = {};
    artifact_storage_objects.artifacts = {};
    artifact_storage_objects.filters = {};
    for (var i = 0; i < const_artifact_types.length; i++) {
        artifact_storage_objects.artifacts[const_artifact_types[i]] = utils_object_get_value(user_artifacts, "artifacts." + const_artifact_types[i], []);
        artifact_storage_objects.filters[const_artifact_types[i]] = {};
        artifact_storage_objects.filters[const_artifact_types[i]].sets = utils_object_get_value(user_artifacts, "filters." + const_artifact_types[i] + ".sets", []);
        artifact_storage_objects.filters[const_artifact_types[i]].main_stat = utils_object_get_value(user_artifacts, "filters." + const_artifact_types[i] + ".main_stat", []);
        artifact_storage_objects.filters[const_artifact_types[i]].sub_stats = utils_object_get_value(user_artifacts, "filters." + const_artifact_types[i] + ".sub_stats", []);
    }
}

function equip_setup_enka_objects(preferences_data = null) {
    user_preferences.enka = {};
    user_preferences.enka.last_uid = utils_object_get_value(preferences_data, "enka.last_uid", "");

    enka_objects = {};
    enka_objects.characters = [];
}

function equip_setup_scanner_objects() {
    scanner_objects = {};
    scanner_objects.file = null;
    scanner_objects.artifacts = [];
}

function equip_setup_share_objects(user_share = null) {
    share_objects = {};
    share_objects.saved_shares = utils_object_get_value(user_share, "saved_shares", []);
}

function equip_setup_window_objects(preferences_data = null) {
    user_preferences.window = {};

    user_preferences.window.equip = utils_object_get_value(preferences_data, "window.equip", structuredClone(window_frame_ids));

    if (user_preferences.window.equip.length != window_frame_ids.length) {
        user_preferences.window.equip = structuredClone(window_frame_ids);
    }
}

function equip_setup_output_objects() {

    output_party = [];

    for (var i = 0; i < const_party_size; i++) {
        var char = {};
        char.weapon_type = "none";
        char.artifacts = {};

        for (var ii = 0; ii < const_artifact_types.length; ii++) {
            var artifact = {};
            artifact.relative_values = [];
            for (var iii = 0; iii < const_artifact_sub_stats; iii++) {
                artifact.relative_values.push(0);
            }
            char.artifacts[const_artifact_types[ii]] = artifact;
        }

        char.artifacts.sets = [];

        char.stats = {};
        char.stats.total = { ...default_stats };
        char.stats.basic = [];
        char.stats.environment = [];
        char.stats.weapon = [];
        char.stats.artifacts = [];
        char.stats.effects = [];
        char.stats.effects_transform_other = [];
        char.stats.effects_transform_personal = [];
        char.stats.vision_stat = "none";

        char.effects = {};
        char.effects.infusion = false;
        char.effects.character = [];
        char.effects.party = [];

        char.skills = {};
        char.skills.attacks = [];
        char.skills.passive = [];
        char.skills.const = [];
        char.skills.reactions = {};
        char.skills.bonusdmg = {};
        char.skills.other = [];
        char.skills.active = {};
        char.skills.active.ncrt = 0;
        char.skills.active.crt = 0;
        char.skills.active.avg = 0;
        char.skills.active.comparison = 0;
        char.skills.active.details = [];

        output_party.push(char);
    }

    output_resonances = [];
}

function equip_setup_default_stats() {
    default_stats = {};
    default_calculate_stats = {};
    
    for (let stat_id in data_stats) {
        default_stats[stat_id] = 0;
    }  

    for (var i = 0; i < const_display_stats_calculate.length; i++) {
        default_calculate_stats[const_display_stats_calculate[i]] = 0;
    }

    data_manual_effects = [];
    for (var i = 0; i < data_effects.length; i++) {
        if (data_effects[i].manual) {
            data_manual_effects.push(data_effects[i]);
        }
    }

    default_bonusdmg = {};
    for (var i = 0; i < const_bonusdmg_visions.length; i++) {
        default_bonusdmg[const_bonusdmg_visions[i]] = {};
        for (var ii = 0; ii < const_bonusdmg_types.length; ii++) {
            default_bonusdmg[const_bonusdmg_visions[i]][const_bonusdmg_types[ii]] = 0;
            default_bonusdmg[const_bonusdmg_visions[i]][const_bonusdmg_types[ii] + "alt"] = 0;
            default_bonusdmg[const_bonusdmg_visions[i]][const_bonusdmg_types[ii] + "alt2"] = 0;
        }
        default_bonusdmg[const_bonusdmg_visions[i]]["alt"] = 0;
        default_bonusdmg[const_bonusdmg_visions[i]]["alt2"] = 0;
    }
    default_bonusdmg.reactions = {};
    for (let reaction_id in data_reactions) {
        default_bonusdmg.reactions[reaction_id] = 0;
    }    

    default_artifact = {};
    default_artifact.id = 0
    default_artifact.stars = 0
    default_artifact.level = 0
    default_artifact.main_stat = "none";
    default_artifact.sub_stats = [];
    for (var ii = 0; ii < const_artifact_sub_stats; ii++) {
        var sub_stat = {};
        sub_stat.id = const_artifact_sub_stats_options[0];
        sub_stat.value = 0;
        default_artifact.sub_stats.push(sub_stat);
    }

    default_storage_character = {};
    default_storage_character.id = 0;
    default_storage_character.uid = 0;
    default_storage_character.source = "";
    default_storage_character.name = "";
    default_storage_character.level = 0;
    default_storage_character.constel = 0;
    default_storage_character.levelnormal = 0;
    default_storage_character.levelskill = 0;
    default_storage_character.levelburst = 0;
    default_storage_character.display_stats = {};
    default_storage_character.vision_stat = "blank";

    default_storage_character.weapon = {};
    default_storage_character.weapon.id = 0;
    default_storage_character.weapon.level = 0;
    default_storage_character.weapon.refine = 0;

    default_storage_character.artifacts = {};
    for (var i = 0; i < const_artifact_types.length; i++) {
        default_storage_character.artifacts[const_artifact_types[i]] = structuredClone(default_artifact);
        default_storage_character.artifacts[const_artifact_types[i]].main_stat = data_artifact_vars[const_artifact_types[i]].main_stats[0];
    }  

    default_active_skill_detail = {};
    default_active_skill_detail.stats = {};
    default_active_skill_detail.stats.total = { ...default_stats };
    default_active_skill_detail.stats.effects = [];
    default_active_skill_detail.stats.effects_transform_other = [];
    default_active_skill_detail.stats.effects_transform_personal = [];
    default_active_skill_detail.ncrt = 0;
    default_active_skill_detail.crt = 0;
    default_active_skill_detail.avg = 0;
    default_active_skill_detail.infusion = false;
}
