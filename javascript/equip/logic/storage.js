function equip_storage_save_last() {

    var user_json = JSON.stringify(user_objects);
    localStorage.setItem("last_storage", user_json);
}

function equip_storage_save_user_storage() {
    var storage_json = JSON.stringify(storage_objects);
    if (user_account && user_account.status) {
        equip_account_storage_save(storage_json);
    } else {
        localStorage.setItem("user_storage", storage_json);
    }
}

function equip_storage_load_last() {    
    var last_storage = localStorage.getItem("last_storage");
    if (last_storage) {
        utils_log_debug("Found last Storage.");
        equip_storage_load(JSON.parse(last_storage));
    } else {
        utils_log_debug("No last Storage.");
        equip_setup_initialize();
    }    
}

function equip_storage_load_user_storage(user_storage_account) {

    if (user_storage_account) {
        utils_log_debug("Found Storages at account.");
        equip_setup_storage_objects(user_storage_account);
    } else {
        var user_storage_local = localStorage.getItem("user_storage");
        if (user_storage_local) {
            utils_log_debug("Found Storages locally.");
            equip_setup_storage_objects(JSON.parse(user_storage_local));
        } else {
            utils_log_debug("No saved Storages.");
        }
    }

    if (!user_storage_account && user_account && user_account.status) {
        utils_log_debug("Saving Storages to account");
        equip_storage_save_user_storage();
    }

    equip_storage_update_comparison_all();
}

function equip_storage_load(storage_data) {

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
        equip_storage_display_active();
        equip_stats_display();
       
        utils_log_debug("Storage loaded.")
    } else {
        utils_log_debug("Storage is empty.")
    }  
}

function equip_storage_load_preferences(preferences_data = null) {
    user_preferences.storage = {};

    user_preferences.storage.base = utils_object_get_value(preferences_data, "storage.base", -1);
    user_preferences.storage.comparison = utils_object_get_value(preferences_data, "storage.comparison", "avg");
    user_preferences.storage.party = utils_object_get_value(preferences_data, "storage.party", "character");
    user_preferences.storage.filter = utils_object_get_value(preferences_data, "storage.filter", false);
    user_preferences.storage.pin = utils_object_get_value(preferences_data, "storage.pin", false);
}

function equip_storage_change_trigger(save_storage = true) {
    equip_storage_update_comparison_all();
    equip_storage_display_active();
    equip_storage_display_all();
    if (save_storage) {
        equip_storage_save_user_storage();
    }   
}

function equip_storage_change_new(new_name) {

    var storage_count = storage_objects.saved_storage.length;

    if (user_account && user_account.status) {
        if (storage_count > 1000) {
            utils_message("Maximum of 1 000 Storages for logged in users!", "automatic_warn");
            return;
        }        
    } else if (storage_count > 100) {
        utils_message("Maximum of 100 Storages for unlogged users!", "automatic_warn");
        return;
    }

    if (!new_name) {
        new_name = "Storage " + (storage_count + 1);
    }

    equip_storage_update_set_storage(
        -1,
        new_name,
        output_party[user_objects.user_active_character].skills.active,
        equip_skills_return_party_total_active(),
        user_objects
    );

    equip_storage_change_trigger();
}

function equip_storage_change_move(index, direction) {

    equip_storage_change_trigger();
}

function equip_storage_change_rename(new_name, index) {
    if (new_name) {
        storage_objects.saved_storage[index].name = new_name;
        equip_storage_change_trigger();
    }    
}

function equip_storage_change_base(index) {
    if (index == user_preferences.storage.base) {
        user_preferences.storage.base = -1;
    } else {
        user_preferences.storage.base = index;
    }
    utils_preferences_change_trigger();
    equip_storage_change_trigger(false);
}

function equip_storage_change_save(index) {
    equip_storage_update_set_storage(
        index,
        storage_objects.saved_storage[index].name,
        output_party[user_objects.user_active_character].skills.active,
        equip_skills_return_party_total_active(),
        user_objects
    );

    equip_storage_change_trigger();
}

function equip_storage_change_load(index) {

    equip_storage_load(storage_objects.saved_storage[index].user_data);
    equip_storage_save_last();

    equip_storage_change_trigger(false);
}

function equip_storage_change_delete(index) {
    
    storage_objects.saved_storage.splice(index, 1);

    if (user_preferences.storage.base == index) {
        user_preferences.storage.base = -1;
    } else if (user_preferences.storage.base > index) {
        user_preferences.storage.base += -1;
    }
    
    equip_storage_change_trigger();
}

function equip_storage_change_filter() {
    if (user_preferences.storage.filter) {
        user_preferences.storage.filter = false;
    } else {
        user_preferences.storage.filter = true;
    }

    equip_storage_display_header_type();
    utils_preferences_change_trigger();
    equip_storage_change_trigger(false);
}

function equip_storage_change_pin() {
    if (user_preferences.storage.pin) {
        user_preferences.storage.pin = false;
    } else {
        user_preferences.storage.pin = true;
    }

    equip_storage_display_header_type();
    utils_preferences_change_trigger();
    equip_storage_change_trigger(false);
}

function equip_storage_change_party_type() {

    if (user_preferences.storage.party == "party") {
        user_preferences.storage.party = "character";
    } else {
        user_preferences.storage.party = "party";
    }

    equip_storage_display_header_type();
    utils_preferences_change_trigger();
    equip_storage_change_trigger(false);
}

function equip_storage_change_comparison_type() {
    if (user_preferences.storage.comparison == "avg") {
        user_preferences.storage.comparison = "ncrt";
    } else if (user_preferences.storage.comparison == "ncrt") {
        user_preferences.storage.comparison = "crt";
    } else {
        user_preferences.storage.comparison = "avg";
    }

    equip_storage_display_header_type();
    utils_preferences_change_trigger();
    equip_storage_change_trigger(false);
}

function equip_storage_update_set_storage(index, name, damage_character, damage_party, user_data) {
    var data = {};

    data.name = name;

    data.damage_data = {
        "character": {
            "avg": damage_character.avg,
            "ncrt": damage_character.ncrt,
            "crt": damage_character.crt
        },
        "party": {
            "avg": damage_party.avg,
            "ncrt": damage_party.ncrt,
            "crt": damage_party.crt
        }       
    }

    data.comparison = 0;

    data.user_data = structuredClone(user_data) ;

    if (index > -1) {
        storage_objects.saved_storage[index] = data;
    } else {
        storage_objects.saved_storage.push(data);
    }    
}

function equip_storage_update_comparison_all() {   

    if (user_preferences.storage.base > -1) {
        var base_dmg = Number(storage_objects.saved_storage[user_preferences.storage.base].damage_data[user_preferences.storage.party][user_preferences.storage.comparison]);
        for (var i = 0; i < storage_objects.saved_storage.length; i++) {
            equip_storage_update_comparison(i, base_dmg);
        }
    }
}

function equip_storage_update_comparison(index, base_dmg) {
    var index_dmg = Number(storage_objects.saved_storage[index].damage_data[user_preferences.storage.party][user_preferences.storage.comparison]);
    var dmg_diff = index_dmg / base_dmg - 1;
    storage_objects.saved_storage[index].comparison = utils_number_round(dmg_diff, 4);
}

function equip_storage_display_header_type() {
    var comparison_header = document.getElementById("storage_text_damage_header");
    var comparison_pin_header = document.getElementById("storage_text_damage_header_pin");

    if (user_preferences.storage.comparison == "crt") {
        comparison_header.innerHTML = "Crit";
        comparison_pin_header.innerHTML = "Crit";
    } else if (user_preferences.storage.comparison == "ncrt") {
        comparison_header.innerHTML = "Non-Crit";
        comparison_pin_header.innerHTML = "Non-Crit";
    } else {
        comparison_header.innerHTML = "Average";
        comparison_pin_header.innerHTML = "Average";
    }

    var party_header = document.getElementById("storage_party_container_header");
    var party_pin_header = document.getElementById("storage_party_container_header_pin");
    var party_icon = document.getElementById("storage_party_active").firstChild;

    if (user_preferences.storage.party == "character") {
        party_header.innerHTML = "Character";
        party_pin_header.innerHTML = "Character";
        party_icon.className = "img_icon svg svg-account-outline";
    } else {
        party_header.innerHTML = "Party";
        party_pin_header.innerHTML = "Party";
        party_icon.className = "img_icon svg svg-account-multiple-outline";
    }

    var filter_icon = document.getElementById("storage_filter_active").firstChild;
    if (user_preferences.storage.filter) {
        filter_icon.className = "img_icon svg svg-filter-outline img_icon_active";
    } else {
        filter_icon.className = "img_icon svg svg-filter-outline";
    }

    var pin_icon = document.getElementById("storage_pin_active").firstChild;
    var storage_pin = document.getElementById("storage_pin");
    if (user_preferences.storage.pin) {
        pin_icon.className = "img_icon svg svg-pin-outline img_icon_active";
        storage_pin.className = "container_storage_pin";
    } else {
        pin_icon.className = "img_icon svg svg-pin-outline";
        storage_pin.className = "container_storage_pin hidden";
    }
}

function equip_storage_display_active() {

    equip_storage_display_active_party("storage_party_container_active");
    equip_storage_display_active_party("storage_party_container_pin");

    if (user_preferences.storage.party == "party") {
        var active_dmg = equip_skills_return_party_total_active();
        active_dmg = active_dmg[user_preferences.storage.comparison];
    } else {
        var active_dmg = output_party[user_objects.user_active_character].skills.active[user_preferences.storage.comparison];
    }

    var comparison_class = "storage_text storage_text_comparison";
    var comparison_text = "";

    if (user_preferences.storage.base > -1) {
        var base_dmg = Number(storage_objects.saved_storage[user_preferences.storage.base].damage_data[user_preferences.storage.party][user_preferences.storage.comparison]);
        var comparison = active_dmg / base_dmg - 1;

        comparison_text = utils_number_format((comparison * 100).toFixed(2)) + " %";
        if (comparison > 0) {
            comparison_class += " positive";
            comparison_text = "+" + comparison_text;
        } else if (comparison < 0) {
            comparison_class += " negative";
        }
    }

    document.getElementById("storage_text_damage_active").innerHTML = utils_number_format(active_dmg.toFixed(1));
    document.getElementById("storage_text_damage_pin").innerHTML = utils_number_format(active_dmg.toFixed(1));

    var storage_text_comparison_active = document.getElementById("storage_text_comparison_active");
    storage_text_comparison_active.className = comparison_class;
    storage_text_comparison_active.innerHTML = comparison_text;

    var storage_text_comparison_pin = document.getElementById("storage_text_comparison_pin");
    storage_text_comparison_pin.className = comparison_class;
    storage_text_comparison_pin.innerHTML = comparison_text;

}

function equip_storage_display_all() {
    var parent = document.getElementById("storage_column");
    utils_delete_children(parent, 2);

    var current_char = user_objects.user_party[user_objects.user_active_character].id;

    var storage_display_objects = [];

    for (var i = 0; i < storage_objects.saved_storage.length; i++) {
        var stored_active_char = storage_objects.saved_storage[i].user_data.user_party[storage_objects.saved_storage[i].user_data.user_active_character].id;
        if (!user_preferences.storage.filter || current_char == stored_active_char) {
            storage_display_objects.push(equip_storage_display(i));
        }        
    }
    storage_display_objects = utils_array_sort(storage_display_objects, "sort");
    for (var i = 0; i < storage_display_objects.length; i++) {
        parent.appendChild(storage_display_objects[i]);
    }
}

function equip_storage_display(index) {

    var obj = utils_create_obj("div", "storage_row", "storage_row_" + index);

    obj.appendChild(utils_create_img_button_prompt_input("square-edit-outline", "Rename", "storage_rename_" + index, "Enter new name", equip_storage_change_rename, index, storage_objects.saved_storage[index].name, "storage_btn"));
    obj.appendChild(utils_create_obj("div", "storage_text storage_text_name", null, storage_objects.saved_storage[index].name));
    obj.sort = storage_objects.saved_storage[index].name;

    var party_container = utils_create_obj("div", "storage_party_container");
    if (user_preferences.storage.party == "party") {
        equip_storage_display_party(storage_objects.saved_storage[index].user_data.user_party, party_container);
    } else {
        equip_storage_display_character(storage_objects.saved_storage[index].user_data.user_party[storage_objects.saved_storage[index].user_data.user_active_character].id, party_container);
    }
    
    obj.appendChild(party_container);

    obj.appendChild(utils_create_obj("div", "storage_text storage_text_damage", null, utils_number_format(Number(storage_objects.saved_storage[index].damage_data[user_preferences.storage.party][user_preferences.storage.comparison]).toFixed(1))));
    obj.appendChild(equip_storage_display_comparison(index, user_preferences.storage.base));

    if (user_preferences.storage.base == index) {
        obj.appendChild(utils_create_img_btn("target-variant img_icon_active", function () { equip_storage_change_base(index) }, "Set Comparison", "storage_base_" + index, "storage_btn"));
    } else {
        obj.appendChild(utils_create_img_btn("target-variant", function () { equip_storage_change_base(index) }, "Set Comparison", "storage_base_" + index, "storage_btn"));

    }
    obj.appendChild(utils_create_img_button_prompt_confirm("download", "Save", "storage_save_" + index, "Overwrite this storage?", equip_storage_change_save, index, "storage_btn"));
    obj.appendChild(utils_create_img_button_prompt_confirm("upload", "Load", "storage_load_" + index, "Load this storage?", equip_storage_change_load, index, "storage_btn"));
    obj.appendChild(utils_create_img_button_prompt_confirm("delete-forever", "Delete", "storage_delete_" + index, "Delete this storage?", equip_storage_change_delete, index, "storage_btn"));

    return obj;
}

function equip_storage_display_comparison(index, storage_base) {
    var comparison_class = "storage_text storage_text_comparison";
    var comparison_text = "";
    if (storage_base > -1) {
        if (storage_base == index) {
            comparison_text = "Basis";
        } else {
            var comparison = Number(storage_objects.saved_storage[index].comparison);

            comparison_text = utils_number_format((comparison * 100).toFixed(2)) + " %";
            if (comparison > 0) {
                comparison_class += " positive";
                comparison_text = "+" + comparison_text;
            } else if (comparison < 0) {
                comparison_class += " negative";
            }
        }
    }
    return utils_create_obj("div", comparison_class, null, comparison_text);
}

function equip_storage_display_active_party(party_container_id) {
    var party_container = document.getElementById(party_container_id);
    utils_delete_children(party_container, 0);

    if (user_preferences.storage.party == "party") {
        equip_storage_display_party(user_objects.user_party, party_container);
    } else {
        equip_storage_display_character(user_objects.user_party[user_objects.user_active_character].id, party_container)
    }
}

function equip_storage_display_party(party_list, party_container) {
    
    for (var i = 0; i < party_list.length; i++) {
        if (party_list[i].constructor == Object) {
            var char_id = party_list[i].id;
        } else {
            var char_id = party_list[i];
        }       
        var char_img_container = utils_create_obj("div", "storage_party " + data_characters[char_id].vision);
        char_img_container.appendChild(utils_create_img("storage_party_img", null, "/images/icons/character/" + char_id + "/char.png"));
        party_container.appendChild(char_img_container);
    }
}

function equip_storage_display_character(char_id, party_container) {
    var character = data_characters[char_id];
    var vision = character.vision;

    party_container.appendChild(utils_create_img_svg(vision));    
    party_container.appendChild(utils_create_obj("div", vision, null, utils_object_get_value(character, "short_name", character.name)));
}
