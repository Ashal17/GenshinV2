const artifact_types = ["flower", "plume", "sands", "goblet", "circlet"];
const artifact_max_levels = [0, 4, 4, 12, 16, 20];
const artifact_sub_stats = 4;
const artifact_sub_stats_options = ["blank", "atk", "atk%", "hp", "hp%", "def", "def%", "crit", "critdmg", "elemastery", "recharge"];

function equip_artifacts_change_trigger(artifact_id) {
    equip_artifacts_update(user_objects.user_active_character, artifact_id);

    equip_stats_update_total_all();
    equip_effects_update_options_all();
    equip_effects_update_stats_all();
    equip_stats_update_total_all();
    equip_skills_update_all();

    equip_effects_display_all();
    equip_skills_display_all();
    equip_artifacts_display(artifact_id);
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

    equip_artifacts_update_set(user_objects.user_active_character);
    equip_artifacts_change_trigger(artifact_id);
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

    if (prev_level > artifact_max_levels[new_stars]) {
        equip_artifacts_change_level(artifact_max_levels[new_stars], artifact_id, true);
    } else if (new_stars > prev_stars) {
        equip_artifacts_change_level(artifact_max_levels[new_stars] - (artifact_max_levels[prev_stars] - prev_level), artifact_id, true);
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

function equip_artifacts_update_stats(party_id) {

    var stats = [];

    for (var i = 0; i < artifact_types.length; i++) {
        var artifact_id = artifact_types[i];
        var current_artifact = user_objects.user_party[party_id].artifacts[artifact_id];

        stats.push(
            { "id": current_artifact.main_stat, "value": equip_artifacts_return_main_value(party_id, current_artifact.main_stat, artifact_id) }
        );

        for (var ii = 0; ii < artifact_sub_stats; ii++) {
            stats.push(
                { "id": current_artifact.sub_stats[ii].id, "value": current_artifact.sub_stats[ii].value }
            );
        }
    }

    for (const [key, value] of Object.entries(output_party[party_id].artifacts.sets)) {
        var artifact_set = utils_array_get_by_lookup(data_artifact_sets, "id", key);
        for (var i = 0; i < artifact_set.set_bonus.length; i++) {
            if (value >= artifact_set.set_bonus[i].req && artifact_set.set_bonus[i].stat) {
                stats.push(
                    { "id": artifact_set.set_bonus[i].stat, "value": artifact_set.set_bonus[i].value }
                );
            }
        }
    }

    output_party[party_id].stats.artifacts = stats;

}

function equip_artifacts_update_relative_values(party_id, artifact_id) {
    var artifact = user_objects.user_party[party_id].artifacts[artifact_id];
    var stars = artifact.stars;
    for (var i = 0; i < artifact_sub_stats; i++) {
        var stat_id = artifact.sub_stats[i].id;
        var value = artifact.sub_stats[i].value;
        if (value) {
            var single_roll = data_artifact_stats[stars].sub_stats[stat_id].slice(-1)[0];
            var relative_value = Math.round(value / single_roll * 10) / 10;
            output_party[party_id].artifacts[artifact_id].relative_values[i] = relative_value;
        } else {
            output_party[party_id].artifacts[artifact_id].relative_values[i] = 0;
        }
        
    }
}

function equip_artifacts_update_all_all() {
    for (var i = 0; i < party_size; i++) {
        equip_artifacts_update_all(i);
    }
}

function equip_artifacts_update_all(party_id) {
    for (var i = 0; i < artifact_types.length; i++) {
        equip_artifacts_update_relative_values(party_id, artifact_types[i]);
    }
    equip_artifacts_update_set(party_id);
    equip_artifacts_update_stats(party_id);
}

function equip_artifacts_update(party_id, artifact_id) {
    equip_artifacts_update_relative_values(party_id, artifact_id);
    equip_artifacts_update_stats(party_id);
}

function equip_artifacts_update_set(party_id) {

    var active_sets = {};

    for (var i = 0; i < artifact_types.length; i++) {
        utils_object_create_add_key(active_sets, user_objects.user_party[party_id].artifacts[artifact_types[i]].id, 1);
    }

    output_party[party_id].artifacts.sets = active_sets;
}

function equip_artifacts_display_all() {
    for (var i = 0; i < artifact_types.length; i++) {
        equip_artifacts_display(artifact_types[i]);
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

    name.innerHTML = artifact[artifact_id];
    icon.className = "equipment_icon img_stars_" + current_artifact.stars;
    img.src = "/images/icons/artifact/" + artifact_id + "/" + artifact.icon + ".png";
    level.className = "icon_selects artifact_level l" + current_artifact.level;
    level_text.innerHTML = "+ " + current_artifact.level;
    stars.className = "icon_selects artifact_stars s" + current_artifact.stars;
    stars_text.innerHTML = current_artifact.stars + " &#9733;";
    main_text.innerHTML = equip_artifacts_return_main_text(current_artifact.main_stat, artifact_id);

    for (var i = 0; i < artifact_sub_stats; i++) {
        var sub = document.getElementById("artifact_sub_" + artifact_id + i);       
        var sub_text = document.getElementById("artifact_sub_text_" + artifact_id + i);
        var sub_stat = current_artifact.sub_stats[i].id;
        sub.className = "icon_selects artifact_sub rv" + Math.ceil(output_party[user_objects.user_active_character].artifacts[artifact_id].relative_values[i]) + " " + sub_stat;
        sub_text.innerHTML = data_stats[sub_stat].name;

        var sub_val = document.getElementById("artifact_sub_val_text_" + artifact_id + i);
        sub_val.innerHTML = current_artifact.sub_stats[i].value;

        var rel_val = document.getElementById("artifact_rel_val_text_" + artifact_id + i);
        rel_val.innerHTML = output_party[user_objects.user_active_character].artifacts[artifact_id].relative_values[i];
    }
}

function equip_artifacts_verify_main_stat(artifact_id) {
    var artifact = user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id];
    var main_stat = artifact.main_stat;

    for (var i = 0; i < artifact_sub_stats; i++) {
        if (artifact.sub_stats[i].id == main_stat) {
            artifact.sub_stats[i].id = artifact_sub_stats_options[0];
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
    for (var i = 0; i < artifact_sub_stats; i++) {
        artifact.sub_stats[i].value = equip_artifacts_verify_sub_value(artifact.sub_stats[i].value, artifact, i);
    }
}

function equip_artifacts_return_level_options(artifact_id) {
    return utils_array_create_range(0, artifact_max_levels[user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id].stars]);
}

function equip_artifacts_return_stars_options(artifact_id) {
    return utils_array_get_parameter_by_lookup(data_artifact_sets, "id", user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id].id, "stars")
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
    var value = equip_artifacts_return_main_value(user_objects.user_active_character, stat_id, artifact_id);
    var stat = data_stats[stat_id];
    var value_text = utils_format_stat_value(stat, value);
    return '<span class="left">' + stat.name + '</span><span class="right">' + value_text + '</span>';
}

function equip_artifacts_return_main_value(party_id, stat_id, artifact_id) {
    var current_artifact = user_objects.user_party[party_id].artifacts[artifact_id];
    return data_artifact_stats[current_artifact.stars].main_stats[stat_id][current_artifact.level];
}

function equip_artifacts_return_sub_options(sub_id, artifact_id) {
    var current_stats = [];

    current_stats.push(user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id].main_stat);

    for (var i = 0; i < artifact_sub_stats; i++) {
        if (i != sub_id && user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id].sub_stats[i].id != "blank") {
            current_stats.push(user_objects.user_party[user_objects.user_active_character].artifacts[artifact_id].sub_stats[i].id);
        }     
    }

    var options = [];
    for (var i = 0; i < artifact_sub_stats_options.length; i++) {
        if (!current_stats.includes(artifact_sub_stats_options[i])) {
            var stat = data_stats[artifact_sub_stats_options[i]];
            let option = {};
            option.text = stat.name;
            option.id = artifact_sub_stats_options[i];
            options.push(option);
        }
    }

    return options;
}


