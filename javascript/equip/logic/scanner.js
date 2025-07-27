function equip_scanner_change_trigger() {
    equip_scanner_display_all();
}

function equip_scanner_change_load_good(event) {
    var input = event.target;
    var inputfile_label = document.getElementById("scanner_label");

    var reader = new FileReader();
    reader.onload = function () {
        var custom_error = false;
        try {
            if (input.files[0].name.toLowerCase().endsWith('.json')) {
                var scanner_result = JSON.parse(reader.result);
            } else {
                custom_error = true;
                throw "Unsupported file type. Only JSON files are supported.";
            }

            if (scanner_result.format == "GOOD") {
                equip_scanner_update_data(scanner_result);
                equip_scanner_change_trigger();
            } else {
                custom_error = true;
                throw "Unsupported format of JSON file. Only files in GOOD format are supported.";
            }
            scanner_objects.file = input.files[0].name;

        } catch (e) {
            scanner_objects.file = null;
            if (custom_error) {
                utils_message(e, "automatic_warn");
            } else {
                utils_loading_show_error(e, "Parsing Error occured:\n" + e);
            }
        } finally {
            if (scanner_objects.file) {
                inputfile_label.innerHTML = scanner_objects.file;
            } else {
                inputfile_label.innerHTML = "Choose File...";
            } 
        }
    };

    reader.readAsText(input.files[0]);       
}

function equip_scanner_change_save_all() {
    var saved_artifacts = 0;

    for (var i = 0; i < const_artifact_types.length; i++) {
        for (var ii = 0; ii < scanner_objects.artifacts[const_artifact_types[i]].length; ii++) {
            var artifact = structuredClone(scanner_objects.artifacts[const_artifact_types[i]][ii]);

            if (equip_artifacts_storage_save_artifact(const_artifact_types[i], artifact, false)) {
                saved_artifacts++;
            }
        }
    }    

    if (saved_artifacts > 0) {
        equip_artifacts_storage_save_last();
        utils_message(saved_artifacts + " Artifacts were saved.", "automatic_success");
    } else {
        utils_message("No artifact was saved.", "automatic_alert");
    }
}

function equip_scanner_change_save_artifact_all(artifact_id) {
    var saved_artifacts = 0;
    for (var i = 0; i < scanner_objects.artifacts[artifact_id].length; i++) {
        var artifact = structuredClone(scanner_objects.artifacts[artifact_id][i]);

        if (equip_artifacts_storage_save_artifact(artifact_id, artifact, false)) {
            saved_artifacts++;
        }
    }

    if (saved_artifacts > 0) {
        equip_artifacts_storage_save_last();
        utils_message(saved_artifacts + " Artifacts were saved.", "automatic_success");
    } else {
        utils_message("No artifact was saved.", "automatic_alert");
    }
}

function equip_scanner_change_save_artifact(artifact_id, index) {

    var artifact = structuredClone(scanner_objects.artifacts[artifact_id][index]);
    if (equip_artifacts_storage_save_artifact(artifact_id, artifact)) {
        equip_artifacts_storage_save_last();
    }
}

function equip_scanner_update_data(scanner_result) {
    var artifacts = {};
    for (var i = 0; i < const_artifact_types.length; i++) {
        artifacts[const_artifact_types[i]] = [];
    }

    for (var i = 0; i < scanner_result.artifacts.length; i++) {
        var scanner_artifact = scanner_result.artifacts[i];

        if (scanner_artifact.level == const_artifact_max_levels[scanner_artifact.rarity]) {
            var artifact = structuredClone(default_artifact);
            artifact.id = utils_array_get_parameter_by_lookup(data_artifact_sets, "scanner_key", scanner_artifact.setKey, "id", true)
            artifact.stars = scanner_artifact.rarity;
            artifact.level = scanner_artifact.level;
            artifact.main_stat = const_scanner_stats_transform_table[scanner_artifact.mainStatKey];
            for (var ii = 0; ii < scanner_artifact.substats.length; ii++) {
                if (scanner_artifact.substats[ii].key) {
                    artifact.sub_stats[ii].id = const_scanner_stats_transform_table[scanner_artifact.substats[ii].key];
                    artifact.sub_stats[ii].value = scanner_artifact.substats[ii].value;
                }                
            }
            artifacts[scanner_artifact.slotKey].push(artifact);
        }
        
    }
    scanner_objects.artifacts = artifacts;
}


function equip_scanner_display_all() {
    var parent = document.getElementById("artifact_scanner_column");
    utils_delete_children(parent, 0);

    var total_count = 0;

    for (var i = 0; i < const_artifact_types.length; i++) {
        if (scanner_objects.artifacts[const_artifact_types[i]]) {
            total_count += scanner_objects.artifacts[const_artifact_types[i]].length;
        }        
    }
    if (total_count > 0) {
        parent.appendChild(equip_scanner_display_header(total_count));

        for (var i = 0; i < const_artifact_types.length; i++) {
            if (scanner_objects.artifacts[const_artifact_types[i]]) {
                parent.appendChild(equip_scanner_display_artifact_header(const_artifact_types[i]));
                for (var ii = 0; ii < scanner_objects.artifacts[const_artifact_types[i]].length; ii++) {
                    parent.appendChild(equip_scanner_display_artifact(const_artifact_types[i], ii));
                }
            }
        }
    }
    

}

function equip_scanner_display_header(artifact_count) {
    var obj = utils_create_obj("div", "scanner_header", "scanner_header");

    obj.appendChild(utils_create_obj("p", "scanner_header_name", null, "All Artifacts"));
    obj.appendChild(utils_create_obj("p", "scanner_header_count", null, artifact_count));
    var btns_obj = utils_create_obj("div", "scanner_btns", "scanner_btns");
    btns_obj.appendChild(utils_create_img_button_prompt_confirm("download-multiple", "Save All Artifacts", "scanner_save", "Save All Aretifactss?", equip_scanner_change_save_all, null, "artifact_storage_btn", "active_prompt_scanner"));
    obj.appendChild(btns_obj);

    return obj;
}

function equip_scanner_display_artifact_header(artifact_id) {
    var obj = utils_create_obj("div", "scanner_header", "scanner_header_" + artifact_id);

    obj.appendChild(utils_create_obj("p", "scanner_header_name", null, data_artifact_vars[artifact_id].name));
    obj.appendChild(utils_create_obj("p", "scanner_header_count", null, scanner_objects.artifacts[artifact_id].length));
    var btns_obj = utils_create_obj("div", "scanner_btns", "scanner_btns_" + artifact_id);
    btns_obj.appendChild(utils_create_img_button_prompt_confirm("download-multiple", "Save All " + data_artifact_vars[artifact_id].name, "scanner_save_" + artifact_id, "Save All " + data_artifact_vars[artifact_id].name + "s?", equip_scanner_change_save_artifact_all, artifact_id, "artifact_storage_btn", "active_prompt_scanner"));
    obj.appendChild(btns_obj);

    return obj;
}

function equip_scanner_display_artifact(artifact_id, index) {
    var display_artifact = scanner_objects.artifacts[artifact_id][index];

    var obj = utils_create_obj("div", "scanner_row", "scanner_row_" + artifact_id + "_" + index);
    var artifact = utils_array_get_by_lookup(data_artifact_sets, "id", display_artifact.id);

    obj.appendChild(equip_display_equipment_icon(
        "/images/icons/artifact/" + artifact_id + "/" + artifact.icon + ".png", display_artifact.stars, equip_artifacts_storage_display_tooltip(artifact), display_artifact.level
    ));
    obj.appendChild(utils_create_obj("p", "artifact_storage_name", null, artifact[artifact_id]));

    var stat_col = utils_create_obj("div", "artifact_storage_stats");
    stat_col.appendChild(utils_create_stat_img(display_artifact.main_stat, equip_artifacts_return_main_value(display_artifact)));

    var sub_stats = utils_create_obj("div", "artifact_storage_sub_stats");

    for (var i = 0; i < const_artifact_sub_stats; i++) {
        sub_stats.appendChild(utils_create_stat_img(display_artifact.sub_stats[i].id, display_artifact.sub_stats[i].value));
    }
    stat_col.appendChild(sub_stats);
    obj.appendChild(stat_col);

    obj.appendChild(equip_scanner_display_btns(artifact_id, index));

    return obj;
}

function equip_scanner_display_btns(artifact_id, index) {
    var btns_obj = utils_create_obj("div", "scanner_btns", "scanner_btns_" + artifact_id + "_" + index);

    var btn_save = utils_create_img_btn("download", null, "Save Artifact", "scanner_save_" + artifact_id + "_" + index, "artifact_storage_btn");
    btn_save.onclick = function (event) { equip_scanner_change_save_artifact(artifact_id, index); event.preventDefault(); };
    btns_obj.appendChild(btn_save);
    
    return btns_obj;
}

