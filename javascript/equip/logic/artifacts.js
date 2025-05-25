function equip_artifacts_storage_load_last(artifacts_storage_account, legacy_artifacts_storage_account) {
    
    if (artifacts_storage_account) {
        utils_log_debug("Found Artifacts at account.");
        equip_setup_artifacts_storage_objects(artifacts_storage_account);
    } else {
        var artifacts_storage_local = localStorage.getItem("artifacts_storage");
        if (artifacts_storage_local) {
            utils_log_debug("Found Artifacts locally.");
            equip_setup_artifacts_storage_objects(JSON.parse(artifacts_storage_local));
        }
    }

    if (legacy_artifacts_storage_account) {
        utils_log_debug("Found legacy Artifacts at account.");
        equip_legacy_v1_artifacts_storage_load(legacy_artifacts_storage_account);
    }

    if (!artifacts_storage_account && user_account && user_account.status) {
        utils_log_debug("Saving Artifacts to account");
        equip_artifacts_storage_save_last();
    }
    equip_legacy_v1_artifacts_storage_load_local();
}

function equip_artifacts_storage_save_last() {
    var artifacts_json = JSON.stringify(artifact_storage_objects);
    if (user_account && user_account.status) {
        equip_account_artifact_storage_save(artifacts_json);
    } else {
        localStorage.setItem("artifacts_storage", artifacts_json);
    }
}

function equip_artifacts_storage_change_trigger(artifact_id) {

    equip_artifacts_storage_display_header(artifact_id);
    equip_artifacts_storage_display_all(artifact_id);
    equip_artifacts_storage_save_last();
}

function equip_artifacts_change_trigger(artifact_id, change_set = false) {
    if (change_set) {
        equip_artifacts_update_set(user_objects.user_active_character);
    }
    equip_artifacts_update(user_objects.user_active_character, artifact_id);
    
    equip_stats_update_total_all();
    equip_effects_update_options_all();
    equip_effects_update_stats_all();
    equip_stats_update_total_all();
    equip_skills_update_all();

    equip_effects_display_all();
    equip_skills_display_all();
    if (change_set) {        
        equip_artifacts_display_all();
    } else {
        equip_artifacts_display(artifact_id);
    }
    equip_stats_display();
    equip_storage_save_last();
}

function equip_artifacts_change(i, artifact_id) {

    var prev_artifact = utils_array_get_by_lookup(data_artifact_sets, "id", user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id].id);
    var prev_stars = prev_artifact.stars;

    var new_artifact = utils_array_get_by_lookup(data_artifact_sets, "id", i);
    var new_stars = new_artifact.stars;

    user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id].id = i;

    if (prev_stars != new_stars) {
        equip_artifacts_change_stars(0, artifact_id, true);
    }
   
    equip_artifacts_change_trigger(artifact_id, true);
}

function equip_artifacts_change_level(i, artifact_id, skip_trigger = false) {

    user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id].level = i;

    if (!skip_trigger) {
        equip_artifacts_verify_sub_value_all(artifact_id);
        equip_artifacts_change_trigger(artifact_id);
    }
    
}

function equip_artifacts_change_stars(i, artifact_id, skip_trigger = false) {

    var current_artifact = user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id];
    var artifact = utils_array_get_by_lookup(data_artifact_sets, "id", current_artifact.id);

    var prev_stars = user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id].stars;
    var new_stars = artifact.stars[i];
    var prev_level = user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id].level;

    user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id].stars = artifact.stars[i];

    if (prev_level > const_artifact_max_levels[new_stars]) {
        equip_artifacts_change_level(const_artifact_max_levels[new_stars], artifact_id, true);
    } else if (new_stars > prev_stars) {
        equip_artifacts_change_level(const_artifact_max_levels[new_stars] - (const_artifact_max_levels[prev_stars] - prev_level), artifact_id, true);
    } 

    equip_artifacts_verify_sub_value_all(artifact_id);
    if (!skip_trigger) {
        equip_artifacts_change_trigger(artifact_id);
    }    
}

function equip_artifacts_change_main(id, artifact_id) {
    user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id].main_stat = id;

    equip_artifacts_verify_main_stat(artifact_id);

    equip_artifacts_change_trigger(artifact_id)
}

function equip_artifacts_change_sub(id, artifact_sub_id) {
    var sub_id = artifact_sub_id.slice(-1);
    var artifact_id = artifact_sub_id.slice(0, -1);
    var artifact = user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id];

    artifact.sub_stats[sub_id].id = id;
    artifact.sub_stats[sub_id].value = equip_artifacts_verify_sub_value(artifact.sub_stats[sub_id].value, artifact, sub_id);

    equip_artifacts_change_trigger(artifact_id)
}

function equip_artifacts_change_sub_value(value, artifact_sub_id) {
    var sub_id = artifact_sub_id.slice(-1);
    var artifact_id = artifact_sub_id.slice(0, -1);

    var artifact = user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id];
    value = equip_artifacts_verify_sub_value(value, artifact, sub_id)
    if (value != null) {
        artifact.sub_stats[sub_id].value = value;

        equip_artifacts_change_trigger(artifact_id)
    }
}

function equip_artifacts_storage_change_save(artifact_id) {
    var artifact = structuredClone(user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id]);
    if (equip_artifacts_storage_save_artifact(artifact_id, artifact)) {
        equip_artifacts_storage_change_trigger(artifact_id);
    }    
}

function equip_artifacts_storage_change_delete(artifact_id, index) {
    artifact_storage_objects.artifacts[artifact_id].splice(index, 1);
    equip_artifacts_storage_change_trigger(artifact_id);
}

function equip_artifacts_storage_change_load(artifact_id, index) {
    var artifact = structuredClone(artifact_storage_objects.artifacts[artifact_id][index]);
    delete artifact.hash;
    user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id] = artifact;
    equip_artifacts_change_trigger(artifact_id, true);
    equip_artifacts_storage_change_trigger(artifact_id);
}

function equip_artifacts_storage_change_filter_set(artifact_id, set_id) {
    var filter_sets = artifact_storage_objects.filters[artifact_id].sets;
    if (filter_sets.includes(set_id)) {
        var index = filter_sets.indexOf(set_id);
        filter_sets.splice(index, 1);
    } else {
        filter_sets.push(set_id);
    }

    equip_artifacts_storage_change_trigger(artifact_id);
}

function equip_artifacts_storage_change_filter_main(stat_id, artifact_id) {
    var filter_main = artifact_storage_objects.filters[artifact_id].main_stat;
    if (filter_main.includes(stat_id)) {
        var index = filter_main.indexOf(stat_id);
        filter_main.splice(index, 1);
    } else {
        filter_main.push(stat_id);
    }

    equip_artifacts_storage_change_trigger(artifact_id);
}

function equip_artifacts_storage_change_filter_sub(stat_id, artifact_id) {
    var filter_sub = artifact_storage_objects.filters[artifact_id].sub_stats;
    var index = utils_array_lookup_parameter(filter_sub, "id", stat_id);
    if (index >= 0) {
        filter_sub.splice(index, 1);
    } else {
        filter_sub.push({ "id": stat_id, "value": 0 })
    }

    equip_artifacts_storage_change_trigger(artifact_id);
}

function equip_artifacts_storage_change_filter_sub_value(value, artifact_stat_id) {
    var artifact_stat_split = artifact_stat_id.split("|");
    var artifact_id = artifact_stat_split[0];
    var stat_id = artifact_stat_split[1];
    var filter_sub = artifact_storage_objects.filters[artifact_id].sub_stats;
    var index = utils_array_lookup_parameter(filter_sub, "id", stat_id);
    if (index >= 0) {
        value = utils_number_verify(value, 2, 0, 9999);
        if (value != null) {
            filter_sub[index].value = value;
            equip_artifacts_storage_change_trigger(artifact_id);
        }
        
    }     
}

function equip_artifacts_storage_change_filter_sub_move(index, artifact_id, direction) {
    var filter_sub = artifact_storage_objects.filters[artifact_id].sub_stats;
    if (utils_array_swap(filter_sub, index, index+direction)) {
        equip_artifacts_storage_change_trigger(artifact_id);
    }   
}

function equip_artifacts_storage_save_artifact(artifact_id, artifact, show_warns = true) {

    if (user_account && user_account.status) {
        if (artifact_storage_objects.artifacts[artifact_id].length > 10000) {
            utils_message("Maximum of 10 000 Artifacts per type for logged in users!", "automatic_warn");
            return false;
        }        
    } else if (artifact_storage_objects.artifacts[artifact_id].length > 500) {
        utils_message("Maximum of 500 Artifacts per type for unlogged users!", "automatic_warn");
        return false;
    }

    var hash = utils_hash(JSON.stringify(artifact));

    for (var i = 0; i < artifact_storage_objects.artifacts[artifact_id].length; i++) {
        if (artifact_storage_objects.artifacts[artifact_id][i].hash == hash) {
            if (show_warns) {
                utils_message("This Artifact is already saved!", "automatic_warn");
            }
            return false;
        }
    }
    artifact.hash = hash;
    artifact_storage_objects.artifacts[artifact_id].push(artifact);
    return true;
}

function equip_artifacts_update_stats(party_id) {

    output_party[party_id].stats.artifacts = equip_stats_return_artifacts_stats(
        user_objects.user_party[party_id].artifacts, output_party[party_id].artifacts.sets);

}

function equip_artifacts_update_relative_values(party_id, artifact_id) {
    var artifact = user_objects.user_party[party_id].artifacts[artifact_id];
    var stars = artifact.stars;
    for (var i = 0; i < const_artifact_sub_stats; i++) {
        output_party[party_id].artifacts[artifact_id].relative_values[i] = equip_artifacts_return_relative_value(artifact.sub_stats[i].id, artifact.sub_stats[i].value, stars);       
    }
}

function equip_artifacts_update_all_all() {
    for (var i = 0; i < const_party_size; i++) {
        equip_artifacts_update_all(i);
    }
}

function equip_artifacts_update_all(party_id) {
    for (var i = 0; i < const_artifact_types.length; i++) {
        equip_artifacts_update_relative_values(party_id, const_artifact_types[i]);
    }
    equip_artifacts_update_set(party_id);
    equip_artifacts_update_stats(party_id);
}

function equip_artifacts_update(party_id, artifact_id) {
    equip_artifacts_update_relative_values(party_id, artifact_id);
    equip_artifacts_update_stats(party_id);
}

function equip_artifacts_update_set(party_id) {

    output_party[party_id].artifacts.sets = equip_artifacts_return_active_sets(user_objects.user_party[party_id].artifacts);
}

function equip_artifacts_display_all() {
    for (var i = 0; i < const_artifact_types.length; i++) {
        equip_artifacts_display(const_artifact_types[i]);
    }
}

function equip_artifacts_display(artifact_id) {

    var current_artifact = user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id];
    var artifact = utils_array_get_by_lookup(data_artifact_sets, "id", current_artifact.id);
    var name = document.getElementById("artifact_name_" + artifact_id);
    var icon = document.getElementById("artifact_icon_" + artifact_id);
    var img = document.getElementById("artifact_img_" + artifact_id);
    var level = document.getElementById("artifact_level_" + artifact_id);
    var level_text = document.getElementById("artifact_level_text_" + artifact_id);
    var stars = document.getElementById("artifact_stars_" + artifact_id);
    var stars_text = document.getElementById("artifact_stars_text_" + artifact_id);
    var main_text = document.getElementById("artifact_main_text_" + artifact_id);
    var set_text = document.getElementById("artifact_set_text_" + artifact_id);
    var set_description = document.getElementById("artifact_set_description_" + artifact_id);

    name.innerHTML = artifact[artifact_id];
    icon.className = "equipment_icon img_stars_" + current_artifact.stars;
    img.src = "/images/icons/artifact/" + artifact_id + "/" + artifact.icon + ".png";
    level.className = "icon_selects artifact_level l" + current_artifact.level;
    level_text.innerHTML = "+ " + current_artifact.level;
    stars.className = "icon_selects artifact_stars s" + current_artifact.stars;
    stars_text.innerHTML = current_artifact.stars + " &#9733;";
    main_text.innerHTML = equip_artifacts_return_main_text(current_artifact.main_stat, artifact_id);
    
    set_text.innerHTML = "&times;" + output_party[user_objects.user_active_character].artifacts.sets[current_artifact.id];
    equip_artifacts_display_set_description(set_description, artifact, false);
    if (current_artifact.id == 0) {
        set_text.className = "artifact_set_text hidden";
    } else {
        set_text.className = "artifact_set_text";
    }

    for (var i = 0; i < const_artifact_sub_stats; i++) {
        var sub = document.getElementById("artifact_sub_" + artifact_id + i);       
        var sub_text = document.getElementById("artifact_sub_text_" + artifact_id + i);
        var sub_stat = current_artifact.sub_stats[i].id;
        sub.className = "icon_selects artifact_sub select_gradient rv" + Math.ceil(output_party[user_objects.user_active_character].artifacts[artifact_id].relative_values[i]) + " " + sub_stat;
        sub_text.innerHTML = data_stats[sub_stat].name;

        var sub_val = document.getElementById("artifact_sub_val_text_" + artifact_id + i);
        sub_val.innerHTML = utils_number_round(current_artifact.sub_stats[i].value, 2);

        var rel_val = document.getElementById("artifact_rel_val_text_" + artifact_id + i);
        rel_val.innerHTML = output_party[user_objects.user_active_character].artifacts[artifact_id].relative_values[i];
    }
}

function equip_artifacts_display_set_description(set_description, artifact, ignore_active_bonus=true) {
    utils_delete_children(set_description, 0);

    set_description.appendChild(utils_create_obj("div", "container_name", null, artifact.name));

    for (var i = 0; i < artifact.set_bonus.length; i++) {
        if (!ignore_active_bonus && artifact.set_bonus[i].req > output_party[user_objects.user_active_character].artifacts.sets[artifact.id]) {
            set_description.appendChild(utils_create_bonus(artifact.set_bonus[i], "inactive"));
        } else {
            set_description.appendChild(utils_create_bonus(artifact.set_bonus[i]));
        }        
    }
}

function equip_artifacts_display_tooltip(artifact_id, display_artifact) {
    var artifact = utils_array_get_by_lookup(data_artifact_sets, "id", display_artifact.id);
    var tooltip = utils_create_obj("div", "tooltip_hover tooltip_bottom tooltip_artifact");
    var nameline = utils_create_obj("div", "prompt_header");
    nameline.appendChild(equip_display_equipment_icon("/images/icons/artifact/" + artifact_id + "/" + artifact.icon + ".png", display_artifact.stars, null, display_artifact.level));
    nameline.appendChild(utils_create_obj("div", "tooltip_header_text", null, artifact[artifact_id]))
    tooltip.appendChild(nameline);
    tooltip.appendChild(utils_create_stat(display_artifact.main_stat, equip_artifacts_return_main_value(display_artifact), "artifact_main"));
    for (var i = 0; i < const_artifact_sub_stats; i++) {
        tooltip.appendChild(utils_create_stat(display_artifact.sub_stats[i].id, display_artifact.sub_stats[i].value));
    }

    return tooltip;
}

function equip_artifacts_storage_display_header(artifact_id) {
    var parent = document.getElementById("artifact_storage_header_column");
    utils_delete_children(parent, 0);

    parent.appendChild(equip_artifacts_storage_display_filter_set(artifact_id));
    if (data_artifact_vars[artifact_id].main_stats.length > 1) {
        parent.appendChild(equip_artifacts_storage_display_filter_main_stat(artifact_id));
    }    
    parent.appendChild(equip_artifacts_storage_display_filter_sub_stats(artifact_id));

}

function equip_artifacts_storage_display_filter_set(artifact_id) {
    var container = utils_create_obj("div", "artifact_storage_filter_container");
    container.appendChild(utils_create_obj("div", "artifact_storage_filter_header", null, "Set Filter"));
    var obj = utils_create_obj("div", "artifact_storage_filter_set", "artifact_storage_filter_set");

    for (var i = 0; i < artifact_storage_objects.filters[artifact_id].sets.length; i++) {
        let artifact = utils_array_get_by_lookup(data_artifact_sets, "id", artifact_storage_objects.filters[artifact_id].sets[i]);
        var artifact_set = equip_display_equipment_icon(
            "/images/icons/artifact/" + artifact_id + "/" + artifact.icon + ".png", artifact.stars.join("_"), equip_artifacts_storage_display_tooltip(artifact)
        );
        artifact_set.onclick = function (event) { equip_artifacts_storage_change_filter_set(artifact_id, artifact.id); event.preventDefault(); };
        obj.appendChild(artifact_set);
    }
    if (artifact_storage_objects.filters[artifact_id].sets.length < 5) {
        var new_btn_container = utils_create_obj("div", "container new_button_container");
        var new_btn = utils_create_obj("div", "new_button", "artifact_storage_filter_set_new_button");
        new_btn.onclick = function (event) { equip_artifacts_storage_display_filter_set_artifacts_select(artifact_id, new_btn); event.preventDefault(); };
        new_btn_container.appendChild(new_btn);
        obj.appendChild(new_btn_container);
    }

    container.appendChild(obj);    
    return container;
}

function equip_artifacts_storage_display_filter_set_artifacts_select(artifact_id, icon) {
    var options = [];

    for (var i = 1; i < data_artifact_sets.length; i++) {
        if (Object.hasOwn(data_artifact_sets[i], artifact_id) && !artifact_storage_objects.filters[artifact_id].sets.includes(data_artifact_sets[i].id)) {
            options.push(equip_artifacts_storage_display_filter_set_artifact(i, artifact_id));
        }
    }

    options = utils_array_sort(options, ["name", "rarity"]);

    utils_create_prompt_select("Select Set Filter", icon.id, "prompt_equipment_select", options, "artifact_storage_header_column", null, null, "active_prompt_artifact_storage");    
}
function equip_artifacts_storage_display_filter_set_artifact(index, artifact_id) {
    var artifact = data_artifact_sets[index];
    var icon = equip_control_create_artifact_icon(artifact, artifact_id);
    icon.onclick = function (event) { equip_artifacts_storage_change_filter_set(artifact_id, artifact.id); utils_destroy_current_prompt("active_prompt_artifact_storage"); event.preventDefault(); };

    return icon;
}

function equip_artifacts_storage_display_filter_main_stat(artifact_id) {
    var container = utils_create_obj("div", "artifact_storage_filter_container");
    container.appendChild(utils_create_obj("div", "artifact_storage_filter_header", null, "Main Stat Filter"));
    var obj = utils_create_obj("div", "artifact_storage_filter_main_stat", "artifact_storage_filter_main_stat");

    for (let i = 0; i < artifact_storage_objects.filters[artifact_id].main_stat.length; i++) {
        let stat_id = artifact_storage_objects.filters[artifact_id].main_stat[i];
        let stat_container = utils_create_obj("div", "artifact_storage_filter_stat_container", "artifact_storage_filter_stat_container_" + artifact_id + i);
        let stat_obj = utils_create_img_btn(
            stat_id,
            null,
            data_stats[stat_id].name,
            "artifact_storage_filter_main_stat_" + stat_id,
            "artifact_storage_filter_stat_icon"
        )
        stat_obj.firstChild.onclick = function (event) { equip_artifacts_storage_change_filter_main(stat_id, artifact_id); event.preventDefault(); },
        stat_container.appendChild(stat_obj);
        obj.appendChild(stat_container);
    }
    if (artifact_storage_objects.filters[artifact_id].main_stat.length < 3) {
        var new_btn_container = utils_create_obj("div", "container new_button_container");
        var new_btn = utils_create_obj("div", "new_button", "artifact_storage_filter_main_new_button");
        new_btn.onclick = function (event) { utils_create_prompt_values(new_btn.id, equip_artifacts_storage_change_filter_main, equip_artifacts_return_main_stats(artifact_id), artifact_id, new_btn_container, "active_prompt_artifact_storage"); event.preventDefault(); };
        new_btn_container.appendChild(new_btn);
        obj.appendChild(new_btn_container);
    }
    
    container.appendChild(obj);
    return container;
}

function equip_artifacts_storage_display_filter_sub_stats(artifact_id) {
    var container = utils_create_obj("div", "artifact_storage_filter_container");
    container.appendChild(utils_create_obj("div", "artifact_storage_filter_header", null, "Sub Stats Filter"));
    var obj = utils_create_obj("div", "artifact_storage_filter_sub_stats", "artifact_storage_filter_sub_stats");

    for (let i = 0; i < artifact_storage_objects.filters[artifact_id].sub_stats.length; i++) {
        let stat_id = artifact_storage_objects.filters[artifact_id].sub_stats[i].id;
        let stat_container = utils_create_obj("div", "artifact_storage_filter_stat_container", "artifact_storage_filter_stat_container_" + artifact_id + i);
        let stat_obj = utils_create_img_btn(
            stat_id,
            null,
            data_stats[stat_id].name,
            "artifact_storage_filter_sub_stat_" + stat_id,
            "artifact_storage_filter_stat_icon"
        )
        stat_obj.firstChild.onclick = function (event) { equip_artifacts_storage_change_filter_sub(stat_id, artifact_id); event.preventDefault(); };
        stat_container.appendChild(stat_obj);
        
        let sub_val_container = utils_create_obj("div", "artifact_filter_sub_val_container", "artifact_filter_sub_val_container_" + artifact_id + i);
        let sub_val_move = utils_create_obj("div", "artifact_filter_sub_val_move", "artifact_filter_sub_move_container_" + artifact_id + i);
        sub_val_move.appendChild(utils_create_img_btn(
            "chevron-left",
            function () { equip_artifacts_storage_change_filter_sub_move(i, artifact_id, -1); },
            "Higher Priority",
            "artifact_filter_sub_move_left_" + artifact_id + i)
        );
        sub_val_move.appendChild(utils_create_img_btn(
            "chevron-right",
            function () { equip_artifacts_storage_change_filter_sub_move(i, artifact_id, 1); },
            "Lower Priority",
            "artifact_filter_sub_move_right_" + artifact_id + i)
        );
        sub_val_container.appendChild(sub_val_move);
        let sub_val = utils_create_obj("div", "icon_selects artifact_filter_sub_val", "artifact_filter_sub_val_" + artifact_id + i);
        sub_val.innerHTML = utils_number_round(artifact_storage_objects.filters[artifact_id].sub_stats[i].value, 2);
        sub_val.onclick = function (event) { utils_create_prompt_input(null, sub_val.id, equip_artifacts_storage_change_filter_sub_value, artifact_id + "|" + stat_id, utils_number_round(artifact_storage_objects.filters[artifact_id].sub_stats[i].value, 2), sub_val_container, "active_prompt_artifact_storage"); event.preventDefault(); };
        sub_val_container.appendChild(sub_val);
        stat_container.appendChild(sub_val_container);
        obj.appendChild(stat_container);
    }

    if (artifact_storage_objects.filters[artifact_id].sub_stats.length < 5) {
        var new_btn_container = utils_create_obj("div", "container new_button_container");
        var new_btn = utils_create_obj("div", "new_button", "artifact_storage_filter_sub_new_button");
        new_btn.onclick = function (event) { utils_create_prompt_values(new_btn.id, equip_artifacts_storage_change_filter_sub, equip_artifacts_return_sub_filter_options(), artifact_id, new_btn_container, "active_prompt_artifact_storage"); event.preventDefault(); };
        new_btn_container.appendChild(new_btn);
        obj.appendChild(new_btn_container);
    }    

    container.appendChild(obj);
    return container;
}

function equip_artifacts_storage_display_all(artifact_id) {
    var parent = document.getElementById("artifact_storage_column");
    utils_delete_children(parent, 0);

    var filter_sub_rv = [];
    var filter_sub_simple = [];
    for (var i = 0; i < artifact_storage_objects.filters[artifact_id].sub_stats.length; i++) {
        if (artifact_storage_objects.filters[artifact_id].sub_stats[i].id == "critvalue") {
            filter_sub_rv.push("crit");
            filter_sub_rv.push("critdmg");
        } else if (artifact_storage_objects.filters[artifact_id].sub_stats[i].id != "rollvalue") {
            filter_sub_rv.push(artifact_storage_objects.filters[artifact_id].sub_stats[i].id);
        }
        filter_sub_simple.push(artifact_storage_objects.filters[artifact_id].sub_stats[i].id);
    }
    if (filter_sub_simple.includes("critvalue")) {
        if (!filter_sub_simple.includes("crit")) {
            filter_sub_simple.push("crit");
        }
        if (!filter_sub_simple.includes("critdmg")) {
            filter_sub_simple.push("critdmg");
        }
    }    
    
    var active_artifact = user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id];
    var active_stats = equip_artifacts_storage_return_filtered_artifact(artifact_id, active_artifact, filter_sub_rv, true);
    parent.appendChild(equip_artifacts_storage_display(artifact_id, active_artifact, null, active_stats, active_stats, filter_sub_simple));

    var artifact_objects = [];
    for (var i = 0; i < artifact_storage_objects.artifacts[artifact_id].length; i++) {
        var display_artifact = artifact_storage_objects.artifacts[artifact_id][i];
        var filter_stats = equip_artifacts_storage_return_filtered_artifact(artifact_id, display_artifact, filter_sub_rv, false);
        if (filter_stats) {
            artifact_objects.push(equip_artifacts_storage_display(artifact_id, display_artifact, i, filter_stats, active_stats, filter_sub_simple));
        }
    }
    var filter_sub = artifact_storage_objects.filters[artifact_id].sub_stats
    if (filter_sub.length > 0) {
        var sort = [];
        for (var i = filter_sub.length; i > 0; i--) {
            sort.push("filter_stats." + filter_sub[i-1].id);
        }
        artifact_objects = utils_array_sort(artifact_objects, sort);
        artifact_objects.reverse();
    }

    for (var i = 0; i < artifact_objects.length; i++) {
        parent.appendChild(artifact_objects[i]);
    }
}

function equip_artifacts_storage_display(artifact_id, display_artifact, index, filter_stats, active_stats, filter_sub_simple) {
    var obj = utils_create_obj("div", "artifact_storage_row", "artifact_storage_row_" + index);
    var artifact = utils_array_get_by_lookup(data_artifact_sets, "id", display_artifact.id);

    obj.appendChild(equip_display_equipment_icon(
        "/images/icons/artifact/" + artifact_id + "/" + artifact.icon + ".png", display_artifact.stars, equip_artifacts_storage_display_tooltip(artifact), display_artifact.level
    ));
    obj.appendChild(utils_create_obj("p", "artifact_storage_name", null, artifact[artifact_id]));
    
    var stat_col = utils_create_obj("div", "artifact_storage_stats");
    stat_col.appendChild(utils_create_stat_img(display_artifact.main_stat, equip_artifacts_return_main_value(display_artifact)));

    var sub_stats = utils_create_obj("div", "artifact_storage_sub_stats");

    for (var i = 0; i < filter_sub_simple.length; i++) {
        for (var ii = 0; ii < const_artifact_sub_stats; ii++) {
            if (filter_sub_simple[i] == display_artifact.sub_stats[ii].id) {
                sub_stats.appendChild(utils_create_stat_img(display_artifact.sub_stats[ii].id, display_artifact.sub_stats[ii].value));
                break;
            }
        }
    }
    var line_class = null;
    if (filter_sub_simple.length > 0) {
        line_class = "diminish"
    }
    for (var i = 0; i < const_artifact_sub_stats; i++) {
        if (!filter_sub_simple.includes(display_artifact.sub_stats[i].id)) {
            sub_stats.appendChild(utils_create_stat_img(display_artifact.sub_stats[i].id, display_artifact.sub_stats[i].value, line_class));
        }      
    }
    if (filter_sub_simple.includes("critvalue")) {
        sub_stats.appendChild(utils_create_stat_img("critvalue", filter_stats.critvalue));
    } else {
        sub_stats.appendChild(utils_create_stat_img("critvalue", filter_stats.critvalue, line_class));
    }
    if (filter_sub_simple.includes("rollvalue")) {
        sub_stats.appendChild(utils_create_stat_img("rollvalue", filter_stats.rollvalue * 100));
    } else {
        sub_stats.appendChild(utils_create_stat_img("rollvalue", filter_stats.rollvalue * 100, line_class));
    }

    obj.filter_stats = filter_stats;

    var compare_stats = utils_create_obj("div", "artifact_storage_compare");
    for (var i = 0; i < filter_sub_simple.length; i++) {
        var difference = filter_stats[filter_sub_simple[i]] - active_stats[filter_sub_simple[i]];
        var diff_class = "neutral";
        if (difference > 0.05) {
            diff_class = "positive";
        } else if (difference < -0.05) {
            diff_class = "negative";
        }
        compare_stats.appendChild(utils_create_stat_img(filter_sub_simple[i], difference, diff_class, true));
    }
    sub_stats.appendChild(compare_stats);
    stat_col.appendChild(sub_stats);
    obj.appendChild(stat_col);
    obj.appendChild(equip_artifacts_storage_display_btns(artifact_id, index));
    
    return obj;
}

function equip_artifacts_storage_display_btns(artifact_id, index) {
    var btns_obj = utils_create_obj("div", "artifact_storage_btns", "artifact_storage_btns_" + index);
    if (index == undefined) {
        var btn_save = utils_create_img_btn("download", null, "Save Artifact", "char_storage_save_" + index, "artifact_storage_btn");
        btn_save.onclick = function (event) { equip_artifacts_storage_change_save(artifact_id); event.preventDefault(); };
        btns_obj.appendChild(btn_save);
    } else {
        var btn_load = utils_create_img_btn("upload", null, "Load Artifact", "char_storage_load_" + index, "artifact_storage_btn");
        btn_load.onclick = function (event) { equip_artifacts_storage_change_load(artifact_id, index); event.preventDefault(); };
        btns_obj.appendChild(btn_load);

        var btn_delete = utils_create_img_btn("delete-forever", null, "Delete Artifact", "char_storage_delete_" + index, "artifact_storage_btn");
        btn_delete.onclick = function (event) { equip_artifacts_storage_change_delete(artifact_id, index); event.preventDefault(); };
        btns_obj.appendChild(btn_delete);
    }

    return btns_obj;
}

function equip_artifacts_storage_display_tooltip(artifact) {
    var tooltip = utils_create_obj("div", "artifact_set_description tooltip_hover");
    equip_artifacts_display_set_description(tooltip, artifact);
    return tooltip;
}

function equip_artifacts_verify_main_stat(artifact_id) {
    var artifact = user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id];
    var main_stat = artifact.main_stat;

    for (var i = 0; i < const_artifact_sub_stats; i++) {
        if (artifact.sub_stats[i].id == main_stat) {
            artifact.sub_stats[i].id = const_artifact_sub_stats_options[0];
            artifact.sub_stats[i].value = 0;
        }
    }
}

function equip_artifacts_verify_sub_value(value, artifact, sub_id) {
    var stat_id = artifact.sub_stats[sub_id].id;
    var max_rolls = 1 + Math.floor(artifact.level / 4);
    var max = data_artifact_stats[artifact.stars].sub_stats[stat_id].slice(-1)[0] * max_rolls;
    return utils_number_verify(value, 2, 0, max);
}

function equip_artifacts_verify_sub_value_all(artifact_id) {
    var artifact = user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id];
    for (var i = 0; i < const_artifact_sub_stats; i++) {
        artifact.sub_stats[i].value = equip_artifacts_verify_sub_value(artifact.sub_stats[i].value, artifact, i);
    }
}

function equip_artifacts_return_level_options(artifact_id) {
    return utils_array_create_range(0, const_artifact_max_levels[user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id].stars]);
}

function equip_artifacts_return_stars_options(artifact_id) {
    return utils_array_get_parameter_by_lookup(data_artifact_sets, "id", user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id].id, "stars")
}

function equip_artifacts_return_main_stats(artifact_id) {
    var options = [];
    for (var i = 0; i < data_artifact_vars[artifact_id].main_stats.length; i++) {
        let option = {};
        option.text = data_stats[data_artifact_vars[artifact_id].main_stats[i]].name;
        option.id = data_artifact_vars[artifact_id].main_stats[i];
        options.push(option);
    }
    return options;
}

function equip_artifacts_return_main_options(artifact_id) {
    var options = [];
    for (var i = 0; i < data_artifact_vars[artifact_id].main_stats.length; i++) {
        let option = {};
        option.text = equip_artifacts_return_main_text(data_artifact_vars[artifact_id].main_stats[i], artifact_id);
        option.id = data_artifact_vars[artifact_id].main_stats[i];
        options.push(option);
    }
    return options;
}

function equip_artifacts_return_main_text(stat_id, artifact_id) {
    var current_artifact = user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id];
    var value = equip_artifacts_return_main_value(current_artifact, stat_id);
    var stat = data_stats[stat_id];
    var value_text = utils_format_stat_value(stat, value);
    return '<span class="left">' + stat.name + '</span><span class="right">' + value_text + '</span>';
}

function equip_artifacts_return_main_value(artifact, stat_id = null) {
    if (stat_id) {
        return data_artifact_stats[artifact.stars].main_stats[stat_id][artifact.level];
    } else {
        return data_artifact_stats[artifact.stars].main_stats[artifact.main_stat][artifact.level];
    }
}

function equip_artifacts_return_sub_options(sub_id, artifact_id) {
    var current_stats = [];

    current_stats.push(user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id].main_stat);
    for (var i = 0; i < const_artifact_sub_stats; i++) {
        if (i != sub_id && user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id].sub_stats[i].id != "blank") {
            current_stats.push(user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id].sub_stats[i].id);
        }
    }
       
    var options = [];
    for (var i = 0; i < const_artifact_sub_stats_options.length; i++) {
        if (!current_stats.includes(const_artifact_sub_stats_options[i])) {
            var stat = data_stats[const_artifact_sub_stats_options[i]];
            let option = {};
            option.text = stat.name;
            option.id = const_artifact_sub_stats_options[i];
            options.push(option);
        }
    }

    return options;
}

function equip_artifacts_return_sub_filter_options() {
    var options = [];
    for (var i = 1; i < const_artifact_sub_stats_options.length; i++) {
        var stat = data_stats[const_artifact_sub_stats_options[i]];
        let option = {};
        option.text = stat.name;
        option.id = const_artifact_sub_stats_options[i];
        options.push(option);
    }
    options.push({ "text": "Crit Value", "id": "critvalue" });
    options.push({ "text": "Roll Value", "id": "rollvalue" });

    return options;
}

function equip_artifacts_return_active_sets(artifacts) {
    var active_sets = {};

    for (var i = 0; i < const_artifact_types.length; i++) {
        utils_object_create_add_key(active_sets, artifacts[const_artifact_types[i]].id, 1);
    }

    return active_sets;
}

function equip_artifacts_return_all_stats(display_artifact, filter_sub_rv) {
    var stats = {};
    for (var i = 1; i < const_artifact_sub_stats_options.length; i++) {
        stats[const_artifact_sub_stats_options[i]] = 0;
    }
    stats.rollvalue = 0;
    for (var i = 0; i < const_artifact_sub_stats; i++) {
        var stat_id = display_artifact.sub_stats[i].id;
        var value = display_artifact.sub_stats[i].value
        stats[stat_id] = value;
        if (filter_sub_rv.length == 0 || filter_sub_rv.includes(stat_id)) {
            stats.rollvalue += equip_artifacts_return_relative_value(stat_id, value, display_artifact.stars)
        }        
    }
    stats.critvalue = stats.crit * 2 + stats.critdmg;

    stats[display_artifact.main_stat] = equip_artifacts_return_main_value(display_artifact);
    return stats;
}

function equip_artifacts_return_relative_value(stat_id, value, stars) {
    if (value) {
        var single_roll = data_artifact_stats[stars].sub_stats[stat_id].slice(-1)[0];
        return Math.round(value / single_roll * 10) / 10;
    } else {
        return 0;
    }
}

function equip_artifacts_storage_return_filtered_artifact(artifact_id, artifact, filter_sub_rv, always) {
    var filter_sets = artifact_storage_objects.filters[artifact_id].sets;
    var filter_main = artifact_storage_objects.filters[artifact_id].main_stat;
    var filter_sub = artifact_storage_objects.filters[artifact_id].sub_stats;
    if (!always && filter_sets.length > 0 && !filter_sets.includes(artifact.id)) {
        return false;
    } else if (!always && filter_main.length > 0 && !filter_main.includes(artifact.main_stat)) {
        return false;
    } else {
        var stats = equip_artifacts_return_all_stats(artifact, filter_sub_rv);
        if (!always) {
            for (var i = 0; i < filter_sub.length; i++) {
                if (filter_sub[i].value > stats[filter_sub[i].id]) {
                    return false;
                }
            }
        }               
        return stats;
    }
}

