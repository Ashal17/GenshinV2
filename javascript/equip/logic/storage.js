function equip_storage_save_last() {

    var user_json = JSON.stringify(user_objects);
    localStorage.setItem("last_storage", user_json);
}

function equip_storage_load_last() {
    var last_storage = localStorage.getItem("last_storage");
    if (last_storage) {
        utils_log_debug("Found last Storage.");
        equip_storage_load(last_storage);
    } else {
        utils_log_debug("No last Storage.");
    }
    
}

function equip_storage_load(storage_json) {
    var storage_data = JSON.parse(storage_json);

    utils_log_debug("Loading storage...")
    if (storage_data) {        
        equip_setup_user_objects(storage_data);

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
        
        equip_stats_display();
       
        utils_log_debug("Storage loaded.")
    } else {
        utils_log_debug("Storage is empty.")
    }  
}

function equip_storage_change_trigger() {
    equip_storage_display_all();
}

function equip_storage_change_new() {

    equip_storage_change_trigger();
}

function equip_storage_display_all() {
    var parent = document.getElementById("skills_container_storage");
    utils_delete_children(parent, 0);

    var storage_count = localStorage.getItem("equip_storage_count");

    for (var i = 0; i < storage_count; i++) {
        parent.appendChild(equip_storage_display(i));
    }
}

function equip_storage_display(index) {
    var equip_storage = localStorage.getItem("equip_storage_" + index);

    var obj = utils_create_obj("div", "storage_line", "storage_line_" + index);



    return obj;
}
