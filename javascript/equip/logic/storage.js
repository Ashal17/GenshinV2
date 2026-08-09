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
        equip_effects_update_options_all();
        equip_effects_update_stats_all();

        equip_stats_update_total_all();
        equip_effects_update_options_all();
        equip_effects_update_stats_all();
        equip_stats_update_total_all();
        equip_skills_update_all();
        equip_energy_update_all();

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
        equip_energy_display();
       
        utils_log_debug("Storage loaded.")
    } else {
        utils_log_debug("Storage is empty.")
    }  
}

function equip_storage_load_preferences(preferences_data = null) {
    user_preferences.storage = {};

    user_preferences.storage.base = utils_object_get_value(preferences_data, "storage.base", -1);
    var comparison = utils_object_get_value(preferences_data, "storage.comparison", null);
    if (comparison == "crt") {
        user_preferences.storage.crit = utils_object_get_value(preferences_data, "storage.crit", true);
        user_preferences.storage.noncrit = utils_object_get_value(preferences_data, "storage.noncrit", false);
    } else if (comparison == "ncrt") {
        user_preferences.storage.crit = utils_object_get_value(preferences_data, "storage.crit", false);
        user_preferences.storage.noncrit = utils_object_get_value(preferences_data, "storage.noncrit", true);
    } else {
        user_preferences.storage.crit = utils_object_get_value(preferences_data, "storage.crit", true);
        user_preferences.storage.noncrit = utils_object_get_value(preferences_data, "storage.noncrit", true);
    }
    var party = utils_object_get_value(preferences_data, "storage.party", "character");
    if (party == "character" || !party) {
        user_preferences.storage.party = false;
    } else {
        user_preferences.storage.party = true;
    }

    user_preferences.storage.filter = {};
    user_preferences.storage.filter.active = utils_object_get_value(preferences_data, "storage.filter.active", false);
    user_preferences.storage.filter.highest = utils_object_get_value(preferences_data, "storage.filter.highest", false);
    user_preferences.storage.filter.first = utils_object_get_value(preferences_data, "storage.filter.first", false);

    user_preferences.storage.pin = utils_object_get_value(preferences_data, "storage.pin", false);
    user_preferences.storage.dps = utils_object_get_value(preferences_data, "storage.dps", false);
    user_preferences.storage.party_detail = utils_object_get_value(preferences_data, "storage.party_detail", false);
}

function equip_storage_change_trigger(save_storage = true) {
    equip_storage_update_comparison_all();
    equip_storage_display_active();
    equip_storage_display_all();
    equip_stats_display_optimize_artifacts_all();
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
        equip_skills_return_storage_damage_data(),
        user_objects,
        equip_storage_return_duration(-1)
    );

    equip_storage_change_trigger();
}

function equip_storage_change_rename(new_name, index) {
    if (new_name) {
        storage_objects.saved_storage[index].name = new_name;
        equip_storage_change_trigger();
    }    
}

function equip_storage_change_duration(new_duration, index) {

    if (index == -1) {
        storage_objects.active.duration = utils_number_verify(new_duration, 2, 1, 120);
    } else {
        storage_objects.saved_storage[index].duration = utils_number_verify(new_duration, 2, 1, 120);
    }

    equip_storage_change_trigger();
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
        equip_skills_return_storage_damage_data(),
        user_objects,
        equip_storage_return_duration(-1)
    );

    equip_storage_change_trigger();
}

function equip_storage_change_load(index) {

    equip_storage_load(storage_objects.saved_storage[index].user_data);
    storage_objects.active.duration = equip_storage_return_duration(index),
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

function equip_storage_change_option(option_name) {
    if (user_preferences.storage[option_name]) {
        user_preferences.storage[option_name] = false;
    } else {
        user_preferences.storage[option_name] = true;
    }

    equip_storage_display_header_type();
    equip_storage_display_option_all();
    utils_preferences_change_trigger();
    equip_storage_change_trigger(false);
    equip_storage_display_party_detail();
}

function equip_storage_change_filter(filter_name) {

    for (const [filter, filter_detail] of Object.entries(const_storage_filters)) {
        if (filter == filter_name && !user_preferences.storage.filter[filter_name]) {
            user_preferences.storage.filter[filter_name] = true;
        } else {
            user_preferences.storage.filter[filter] = false;
        }        
    }

    equip_storage_display_filter_all();
    utils_preferences_change_trigger();
    equip_storage_change_trigger(false);
}

function equip_storage_update_set_storage(index, name, damage_data, user_data, duration) {
    var data = {};

    data.name = name;
    data.duration = duration;

    data.damage_data = damage_data;

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
        var base_dmg = equip_storage_return_saved_dmg(user_preferences.storage.base);
        for (var i = 0; i < storage_objects.saved_storage.length; i++) {
            equip_storage_update_comparison(i, base_dmg);
        }
    }
}

function equip_storage_update_comparison(index, base_dmg) {
    var index_dmg = equip_storage_return_saved_dmg(index);
    var dmg_diff = index_dmg / base_dmg - 1;
    storage_objects.saved_storage[index].comparison = utils_number_round(dmg_diff, 4);
}

function equip_storage_display_party_detail() {
    if (user_preferences.storage.party_detail) {
        document.getElementById("frame_skills_content").className = "frame_window_content frame_skills frame_skills_party_detail";        
    } else {
        document.getElementById("frame_skills_content").className = "frame_window_content frame_skills";
    }    
}

function equip_storage_display_header_type() {
    var comparison_header = document.getElementById("storage_text_damage_header");
    var comparison_pin_header = document.getElementById("storage_text_damage_header_pin");

    if (user_preferences.storage.crit && user_preferences.storage.noncrit) {
        var comparison_header_text = "Average";
    } else if (user_preferences.storage.crit) {
        var comparison_header_text = "Crit";
    } else {
        var comparison_header_text = "Non-Crit";
    }

    if (user_preferences.storage.dps) {
        comparison_header_text += " DPS";
    } else {
        comparison_header_text += " Total";
    }

    comparison_header.innerHTML = comparison_header_text;
    comparison_pin_header.innerHTML = comparison_header_text;

    var party_header = document.getElementById("storage_party_container_header");
    var party_pin_header = document.getElementById("storage_party_container_header_pin");

    if (user_preferences.storage.party) {
        party_header.innerHTML = "Party";
        party_pin_header.innerHTML = "Party";        
    } else {
        party_header.innerHTML = "Character";
        party_pin_header.innerHTML = "Character";
    }

    var storage_pin = document.getElementById("storage_pin");
    if (user_preferences.storage.pin) {
        storage_pin.className = "container_storage_pin";
    } else {
        storage_pin.className = "container_storage_pin hidden";
    }
}

function equip_storage_display_active() {

    equip_storage_display_active_party("storage_party_container_active");
    equip_storage_display_active_party("storage_party_container_pin");

    if (user_preferences.storage.party) {
        var active_dmg = equip_skills_return_party_total_active();
        active_dmg = active_dmg[equip_storage_return_comparison_type()];
    } else {
        var active_dmg = output_party[user_objects.user_active_character].skills.output.initial.active[equip_storage_return_comparison_type()];
    }
    var active_duration = equip_storage_return_duration(-1);

    var comparison_class = "storage_text storage_text_comparison";
    var comparison_text = "";

    if (user_preferences.storage.base > -1) {
        var base_dmg = equip_storage_return_saved_dmg(user_preferences.storage.base);
        if (user_preferences.storage.dps) {
            var active_dmg = active_dmg / active_duration;
        } 
        var comparison = active_dmg / base_dmg - 1;
        

        comparison_text = utils_number_format((comparison * 100).toFixed(2)) + " %";
        if (comparison > 0) {
            comparison_class += " positive";
            comparison_text = "+" + comparison_text;
        } else if (comparison < 0) {
            comparison_class += " negative";
        }
    }
    var display_dmg = equip_storage_display_dmg(active_dmg, active_duration);
    document.getElementById("storage_text_damage_active").innerHTML = display_dmg;
    document.getElementById("storage_text_damage_pin").innerHTML = display_dmg;

    var storage_text_comparison_active = document.getElementById("storage_text_comparison_active");
    storage_text_comparison_active.className = comparison_class;
    storage_text_comparison_active.innerHTML = comparison_text;

    var storage_text_comparison_pin = document.getElementById("storage_text_comparison_pin");
    storage_text_comparison_pin.className = comparison_class;
    storage_text_comparison_pin.innerHTML = comparison_text;

    utils_update_obj("storage_duration_active", utils_create_img_button_prompt_input("timer-outline", "Set Rotation Duration", "storage_duration_active", "Enter Rotation Duration (seconds)", equip_storage_change_duration, -1, equip_storage_return_duration(-1), "storage_btn"));
}

function equip_storage_display_all() {
    var parent = document.getElementById("storage_column");
    utils_delete_children(parent, 2);

    var storage_display_objects = [];

    for (var i = 0; i < storage_objects.saved_storage.length; i++) {
        if (equip_storage_return_filter_result(storage_objects.saved_storage[i])) {
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

    var duration = equip_storage_return_duration(index);

    var party_container = utils_create_obj("div", "storage_party_container");
    if (user_preferences.storage.party_detail) {
        equip_storage_display_party_detail_dmg(storage_objects.saved_storage[index].damage_data, storage_objects.saved_storage[index].user_data.user_party, duration, party_container);
    } else if (user_preferences.storage.party) {
        equip_storage_display_party(storage_objects.saved_storage[index].user_data.user_party, party_container);
    } else {
        equip_storage_display_character(storage_objects.saved_storage[index].user_data.user_party[storage_objects.saved_storage[index].user_data.user_active_character].id, party_container);
    }  
    obj.appendChild(party_container);

    obj.appendChild(utils_create_obj("div", "storage_text storage_text_damage", null, equip_storage_display_dmg(equip_storage_return_saved_dmg(index), duration)));
    
    obj.appendChild(equip_storage_display_comparison(index, user_preferences.storage.base));

    obj.appendChild(utils_create_img_button_prompt_input("timer-outline", "Set Rotation Duration", "storage_duration_" + index, "Enter Rotation Duration (seconds)", equip_storage_change_duration, index, duration, "storage_btn"));

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

    if (user_preferences.storage.party_detail) {
        equip_storage_display_party_detail_dmg(equip_skills_return_storage_damage_data(), user_objects.user_party, equip_storage_return_duration(-1), party_container)
    } else if (user_preferences.storage.party) {
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
        party_container.appendChild(equip_display_party_icon(char_id));
    }
}

function equip_storage_display_character(char_id, party_container) {
    var character = data_characters[char_id];
    var vision = character.vision;
   
    party_container.appendChild(utils_create_obj("div", vision, null, utils_object_get_value(character, "short_name", character.name)));
}

function equip_storage_display_option_all() {
    var options_container = document.getElementById("comparison_options_container");

    if (options_container) {
        utils_delete_children(options_container, 0);

        for (const [option, option_detail] of Object.entries(const_storage_options)) {
            options_container.appendChild(equip_storage_display_option(option, option_detail))
        }
    }    
}

function equip_storage_display_option(option, option_detail) {

    if (option_detail.group && user_preferences.storage[option]) {
        var enabled = false;
        for (var i = 0; i < option_detail.group.length; i++) {
            if (option_detail.group[i] != option && user_preferences.storage[option_detail.group[i]]) {
                enabled = true;
                break;
            }
        }
    } else {
        var enabled = true;
    }
    if (enabled) {
        var opt_row = utils_create_obj("div", "toggle_row option_row");
    } else {
        var opt_row = utils_create_obj("div", "toggle_row option_row disabled");
    }
    
    opt_row.appendChild(utils_create_obj("div", "toggle_name", "comparison_option_name_" + option, option_detail.name));

    if (user_preferences.storage[option]) {
        var toggle_class = "active";
    } else {
        var toggle_class = "inactive";
    }

    var opt_toggle = utils_create_obj("div", "toggle " + toggle_class, "comparison_option_toggle_" + option);
    if (enabled) {
        opt_toggle.onclick = function (event) { equip_storage_change_option(option); event.preventDefault(); };
    }
    
    opt_row.appendChild(opt_toggle);

    return opt_row;
}

function equip_storage_display_filter_all() {
    var filters_container = document.getElementById("comparison_filters_container");

    if (filters_container) {
        utils_delete_children(filters_container, 0);

        for (const [filter, filter_detail] of Object.entries(const_storage_filters)) {
            filters_container.appendChild(equip_storage_display_filter(filter, filter_detail))
        }
    }
}

function equip_storage_display_filter(filter, filter_detail) {

    var filter_row = utils_create_obj("div", "toggle_row option_row");
    filter_row.appendChild(utils_create_obj("div", "toggle_name", "comparison_filter_name_" + filter, filter_detail.name));

    if (user_preferences.storage.filter[filter]) {
        var toggle_class = "active";
    } else {
        var toggle_class = "inactive";
    }

    var filter_toggle = utils_create_obj("div", "toggle " + toggle_class, "comparison_filter_toggle_" + filter);
    filter_toggle.onclick = function (event) { equip_storage_change_filter(filter); event.preventDefault(); };

    filter_row.appendChild(filter_toggle);

    return filter_row;
}

function equip_storage_display_party_detail_dmg(damage_data, party_list, duration, party_container) {
    var party_detail_container = utils_create_obj("div", "storage_party_detail_container");

    for (var i = 0; i < party_list.length; i++) {
        if (party_list[i].constructor == Object) {
            var char_id = party_list[i].id;

            if (Array.isArray(damage_data.character)) {
                var char_container = utils_create_obj("div", "storage_party_detail");
                var char_icons_container = utils_create_obj("div", "storage_party_icon_container");
                char_icons_container.appendChild(equip_display_party_icon(char_id, party_list[i].constel));
                char_icons_container.appendChild(equip_character_storage_display_equip(party_list[i], true))

                char_container.appendChild(char_icons_container);

                var damage = damage_data.character[i].damage[equip_storage_return_comparison_type()];
                var share = damage_data.character[i].share[equip_storage_return_comparison_type()] * 100;
                if (user_preferences.storage.dps) {
                    damage = damage / duration;
                }
                var damage_string = utils_number_format('<span class="' + data_characters[char_id].vision + '">' + damage.toFixed(1)) + '</span> <span class="storage_text_detail">' + utils_number_format(share.toFixed(1)) + '%</span>';

                char_container.appendChild(utils_create_obj("div", "storage_text", null, damage_string));
                party_detail_container.appendChild(char_container);
            } else {
                party_detail_container.appendChild(equip_display_party_icon(char_id, party_list[i].constel));
            }
        } else {
            party_detail_container.appendChild(equip_display_party_icon(party_list[i]));
        }
        
    }
    party_container.appendChild(party_detail_container);

}

function equip_storage_display_dmg(dmg_value, duration) {

    if (user_preferences.storage.dps) {
        return utils_number_format(dmg_value.toFixed(1)) + '<span class="storage_text_detail"> /&#8288;s&nbsp;(' + duration + 's)</span>';
    } else {
        return utils_number_format(dmg_value.toFixed(1)) + '<span class="storage_text_detail"> /&#8288;' + duration + 's</span>';
    }
}


function equip_storage_return_saved_dmg(index, party_id = null) {

    if (user_preferences.storage.party && party_id === null) {
        var damage = Number(storage_objects.saved_storage[index].damage_data.party[equip_storage_return_comparison_type()]);
    } else {
        if (Array.isArray(storage_objects.saved_storage[index].damage_data.character)) {
            if (party_id === null) {
                party_id = storage_objects.saved_storage[index].user_data.user_active_character;
            }            
            var damage = Number(storage_objects.saved_storage[index].damage_data.character[party_id].damage[equip_storage_return_comparison_type()]);
        } else {
            if (party_id === null) {
                var damage = Number(storage_objects.saved_storage[index].damage_data.character[equip_storage_return_comparison_type()]);
            } else {
                var damage = 0;
            }            
        }
    }

    if (user_preferences.storage.dps) {
        return damage / equip_storage_return_duration(index);
    } else {
        return damage;
    }
}

function equip_storage_return_duration(index) {
    if (index > -1) {
        return Number(utils_object_get_value(storage_objects.saved_storage[index], "duration", 20))
    } else {
        return Number(utils_object_get_value(storage_objects.active, "duration", 20))
    }
}

function equip_storage_return_comparison_type() {
    if (user_preferences.storage.crit && user_preferences.storage.noncrit) {
       return "avg";
    } else if (user_preferences.storage.crit) {
        return "crt";
    } else {
        return "ncrt";
    }
}

function equip_storage_return_filter_result(saved_storage) {
    if (user_preferences.storage.filter.active) {
        var current_active = user_objects.user_party[user_objects.user_active_character].id;
        var storage_active = saved_storage.user_data.user_party[saved_storage.user_data.user_active_character].id;
        if (current_active == storage_active) {
            return true;
        }
    } else if (user_preferences.storage.filter.highest) {
        var current_highest = equip_storage_return_highest(equip_skills_return_storage_damage_data(), user_objects.user_party);
        var storage_highest = equip_storage_return_highest(saved_storage.damage_data, saved_storage.user_data.user_party);
        if (current_highest == storage_highest) {
            return true;
        }
    } else if (user_preferences.storage.filter.first) {
        var current_first = user_objects.user_party[0].id;
        var storage_first = saved_storage.user_data.user_party[0].id;
        if (current_first == storage_first) {
            return true;
        }
    } else {
        return true;
    }
    return false;
}

function equip_storage_return_highest(damage_data, user_party) {

    var highest_id = null;
    if (Array.isArray(damage_data.character)) {

        var highest = 0;       

        for (var i = 0; i < const_party_size; i++) {

            if (damage_data.character[i].share[equip_storage_return_comparison_type()] > highest) {
                highest = damage_data.character[i].share[equip_storage_return_comparison_type()];
                highest_id = user_party[i].id;
            }            
        }      
    }

    return highest_id;
}