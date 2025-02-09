const storage_data_names = [
    "name",
    "party",
    "damage",
    "comparison",
    "data"
]

function equip_storage_save_last() {

    var user_json = JSON.stringify(user_objects);
    localStorage.setItem("last_storage", user_json);
}

function equip_storage_load_last() {
    var last_storage = localStorage.getItem("last_storage");
    if (last_storage) {
        utils_log_debug("Found last Storage.");
        equip_storage_load(JSON.parse(last_storage));
    } else {
        utils_log_debug("No last Storage.");
    }
    
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

function equip_storage_change_trigger(recalculate) {
    if (recalculate) {
        equip_storage_update_comparison_all();
        equip_storage_display_active();
    }
    equip_storage_display_all();
}

function equip_storage_change_new(new_name) {

    var storage_count = parseInt(localStorage.getItem("equip_storage_count"));

    if (!new_name) {
        new_name = "Storage " + (storage_count + 1);
    }

    equip_storage_update_set_storage(
        storage_count,
        new_name,
        user_objects.user_active_character,
        user_objects.user_party,
        output_party[user_objects.user_active_character].skills.active,
        equip_skills_return_party_total_active(),
        user_objects
    );

    localStorage.setItem("equip_storage_count", storage_count+1);

    equip_storage_change_trigger(true);
}

function equip_storage_change_move(index, direction) {

    equip_storage_change_trigger(false);
}

function equip_storage_change_rename(new_name, index) {
    localStorage.setItem("equip_storage_name_" + index, new_name);
    equip_storage_change_trigger(false);
}

function equip_storage_change_base(index) {
    var storage_base = parseInt(localStorage.getItem("equip_storage_base"));
    if (index == storage_base) {
        localStorage.setItem("equip_storage_base", -1);
    } else {
        localStorage.setItem("equip_storage_base", index);
    }

    equip_storage_change_trigger(true);
}

function equip_storage_change_save(index) {
    equip_storage_update_set_storage(
        index,
        null,
        user_objects.user_active_character,
        user_objects.user_party,
        output_party[user_objects.user_active_character].skills.active,
        equip_skills_return_party_total_active(),
        user_objects
    );

    equip_storage_change_trigger(true);
}

function equip_storage_change_load(index) {
    var storage_data = localStorage.getItem("equip_storage_data_" + index);
    equip_storage_load(JSON.parse(storage_data));

    equip_storage_change_trigger(false);
}

function equip_storage_change_delete(index) {
    var storage_count = parseInt(localStorage.getItem("equip_storage_count"));
    localStorage.setItem("equip_storage_count", storage_count - 1);

    if (storage_count != (index + 1)) {
        for (var i = index; i < (storage_count - 1); i++) {
            equip_storage_update_copy_storage(i + 1, i);
        }
    }
    equip_storage_update_delete_storage(storage_count - 1);

    var storage_base = parseInt(localStorage.getItem("equip_storage_base"));
    if (storage_base > -1) {
        if (index == storage_base) {
            localStorage.setItem("equip_storage_base", -1);
        } else if (storage_base > index) {
            localStorage.setItem("equip_storage_base", storage_base-1);
        }
    }
    
    equip_storage_change_trigger(true);
}

function equip_storage_change_party_type() {
    var party_type = localStorage.getItem("equip_storage_party_type");

    if (party_type == "party") {
        localStorage.setItem("equip_storage_party_type", "character");
    } else {
        localStorage.setItem("equip_storage_party_type", "party");
    }

    equip_storage_display_header_type();
    equip_storage_change_trigger(true);
}

function equip_storage_change_comparison_type() {
    var comparison_type = localStorage.getItem("equip_storage_comparison_type");

    if (comparison_type == "avg") {
        localStorage.setItem("equip_storage_comparison_type", "ncrt");
    } else if (comparison_type == "ncrt") {
        localStorage.setItem("equip_storage_comparison_type", "crt");
    } else {
        localStorage.setItem("equip_storage_comparison_type", "avg");
    }

    equip_storage_display_header_type();
    equip_storage_change_trigger(true);
}

function equip_storage_update_set_storage(index, name, active_character, current_party, damage_character, damage_party, storage_data) {
    var party_data = {
        "active_character": active_character,
        "party": []
    }

    for (var i = 0; i < party_size; i++) {
        party_data.party.push(current_party[i].id);
    }

    var damage_data = {
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

    if (name) {
        localStorage.setItem("equip_storage_name_" + index, name);
    }    
    localStorage.setItem("equip_storage_party_" + index, JSON.stringify(party_data));
    localStorage.setItem("equip_storage_damage_" + index, JSON.stringify(damage_data));
    localStorage.setItem("equip_storage_data_" + index, JSON.stringify(storage_data));
}

function equip_storage_update_copy_storage(index_1, index_2) {
    for (var i = 0; i < storage_data_names.length; i++) {
        utils_local_storage_copy("equip_storage_" + storage_data_names[i] + "_" + index_1, "equip_storage_" + storage_data_names[i] + "_" + index_2);
    }
}

function equip_storage_update_delete_storage(index) {
    for (var i = 0; i < storage_data_names.length; i++) {
        localStorage.removeItem("equip_storage_" + storage_data_names[i] + "_" + index);
    }
}

function equip_storage_update_comparison_all() {   
    var storage_base = parseInt(localStorage.getItem("equip_storage_base"));

    if (storage_base > -1) {
        var storage_count = parseInt(localStorage.getItem("equip_storage_count"));
        var comparison_type = localStorage.getItem("equip_storage_comparison_type");
        var party_type = localStorage.getItem("equip_storage_party_type");
        var dmg_obj = JSON.parse(localStorage.getItem("equip_storage_damage_" + storage_base));
        var base_dmg = Number(dmg_obj[party_type][comparison_type]);
        for (var i = 0; i < storage_count; i++) {
            equip_storage_update_comparison(i, base_dmg, comparison_type, party_type);
        }
    }
}

function equip_storage_update_comparison(index, base_dmg, comparison_type, party_type) {
    var dmg_obj = JSON.parse(localStorage.getItem("equip_storage_damage_" + index));
    var index_dmg = Number(dmg_obj[party_type][comparison_type]);
    var dmg_diff = index_dmg / base_dmg - 1;
    localStorage.setItem("equip_storage_comparison_" + index, dmg_diff);
}

function equip_storage_display_header_type() {
    var comparison_type = localStorage.getItem("equip_storage_comparison_type");
    var comparison_header = document.getElementById("storage_text_damage_header");

    if (comparison_type == "crt") {
        comparison_header.innerHTML = "Crit";
    } else if (comparison_type == "ncrt") {
        comparison_header.innerHTML = "Non-Crit";
    } else {
        comparison_header.innerHTML = "Average";
    }

    var party_type = localStorage.getItem("equip_storage_party_type");
    var party_header = document.getElementById("storage_party_container_header");
    var party_icon = document.getElementById("storage_party_active").firstChild;

    if (party_type == "character") {
        party_header.innerHTML = "Character";
        party_icon.className = "img_icon svg svg-account-outline";
    } else {
        party_header.innerHTML = "Party";
        party_icon.className = "img_icon svg svg-account-multiple-outline";
    }
}

function equip_storage_display_active() {
    var party_container = document.getElementById("storage_party_container_active");
    utils_delete_children(party_container, 0);
    equip_storage_display_party(user_objects.user_party, party_container);

    var storage_base = parseInt(localStorage.getItem("equip_storage_base"));
    var comparison_type = localStorage.getItem("equip_storage_comparison_type");
    var party_type = localStorage.getItem("equip_storage_party_type");
    if (party_type == "party") {
        var active_dmg = equip_skills_return_party_total_active();
        active_dmg = active_dmg[comparison_type];
    } else {
        var active_dmg = output_party[user_objects.user_active_character].skills.active[comparison_type];
    }

    var comparison_class = "storage_text storage_text_comparison";
    var comparison_text = "";

    if (storage_base > -1) {
        var dmg_obj = JSON.parse(localStorage.getItem("equip_storage_damage_" + storage_base));
        var base_dmg = Number(dmg_obj[party_type][comparison_type]);
        var comparison = active_dmg / base_dmg - 1;

        comparison_text = utils_number_format((comparison * 100).toFixed(2)) + " %";
        if (comparison > 0) {
            comparison_class += " positive";
            comparison_text = "+" + comparison_text;
        } else if (comparison < 0) {
            comparison_class += " negative";
        }
    }

    var storage_text_damage_active = document.getElementById("storage_text_damage_active");
    storage_text_damage_active.innerHTML = utils_number_format(active_dmg.toFixed(1));

    var storage_text_comparison_active = document.getElementById("storage_text_comparison_active");
    storage_text_comparison_active.className = comparison_class;
    storage_text_comparison_active.innerHTML = comparison_text;

}

function equip_storage_display_all() {
    var parent = document.getElementById("storage_column");
    utils_delete_children(parent, 2);

    var storage_count = parseInt(localStorage.getItem("equip_storage_count"));
    var storage_base = parseInt(localStorage.getItem("equip_storage_base"));
    var comparison_type = localStorage.getItem("equip_storage_comparison_type");
    var party_type = localStorage.getItem("equip_storage_party_type");
    
    for (var i = 0; i < storage_count; i++) {
        parent.appendChild(equip_storage_display(i, comparison_type, party_type, storage_base));
    }
}

function equip_storage_display(index, comparison_type, party_type, storage_base) {

    var old_name = localStorage.getItem("equip_storage_name_" + index);

    var obj = utils_create_obj("div", "storage_row", "storage_row_" + index);

    obj.appendChild(utils_create_img_button_prompt_input("square-edit-outline", "Rename", "storage_rename_" + index, "Enter new name", equip_storage_change_rename, index, old_name, "storage_btn"));

    obj.appendChild(utils_create_obj("div", "storage_text storage_text_name", null, old_name));

    var party_obj = JSON.parse(localStorage.getItem("equip_storage_party_" + index));
    var party_container = utils_create_obj("div", "storage_party_container");
    equip_storage_display_party(party_obj.party, party_container);
    obj.appendChild(party_container);

    var dmg_obj = JSON.parse(localStorage.getItem("equip_storage_damage_" + index));
    obj.appendChild(utils_create_obj("div", "storage_text storage_text_damage", null, utils_number_format(Number(dmg_obj[party_type][comparison_type]).toFixed(1))));
    obj.appendChild(equip_storage_display_comparison(index, storage_base));

    if (storage_base == index) {
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
            var comparison = Number(localStorage.getItem("equip_storage_comparison_" + index));

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
