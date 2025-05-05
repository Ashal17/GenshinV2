function equip_legacy_v1_url_load_url() {
    var url = location.search;

    if (url == "") {
        if (localStorage.getItem("last_url")) {
            url = localStorage.getItem("last_url");            
        }
    }

    if (url != "") {
        url = url.slice(1);
        var character_data = equip_legacy_v1_url_return_character(url);
        equip_character_load(0, character_data);
        utils_url_set("/equip");
        localStorage.removeItem("last_url"); 
        return true;
    } else {        
        return false;
    }
}


async function equip_legacy_v1_account_storage_load(storage_account) {
    if (user_account && user_account.status) {
        if (!storage_account.character_storage_objects && !storage_account.artifact_storage_objects) {
            var response_obj = await utils_handle_get_response(await utils_get("/endpoints/account/get_legacy_storage.php"));
            if (response_obj) {
                return response_obj.message;
            } else {
                return {
                    "setup": null,
                    "artifact_list": null
                };
            }
        } else {
            return {
                "setup": null,
                "artifact_list": null
            };
        }

        
    } else {
        return {
            "setup": null,
            "artifact_list": null
        };
    }   
}

function equip_legacy_v1_character_storage_load_local() {
    var setup_count = parseInt(localStorage.getItem("equip_setup_count"));

    if (setup_count) {
        utils_log_debug("Found legacy Characters locally.");
        for (var i = 0; i < setup_count; i++) {
            var character_data = equip_legacy_v1_url_return_character(localStorage.getItem("equip_setup_url_" + i));
            character_data.name = localStorage.getItem("equip_setup_name_" + i);
            character_data.source = "legacy";
            equip_character_storage_save_character(character_data, false);
        }
        equip_character_storage_save_last();
    }
    equip_legacy_v1_character_storage_clear();
}

function equip_legacy_v1_character_storage_load_account(setups) {
    for (var i = 0; i < setups.length; i++) {
        var character_data = equip_legacy_v1_url_return_character(setups[i].url);
        character_data.name = setups[i].name;
        character_data.source = "legacy";
        equip_character_storage_save_character(character_data, false);
    }
}

function equip_legacy_v1_character_storage_clear() {
    var setup_count = parseInt(localStorage.getItem("equip_setup_count"));

    if (setup_count) {
        for (var i = 0; i < setup_count; i++) {
            for (var ii = 0; ii < const_legacy_setup_local_storage.length; ii++) {
                localStorage.removeItem("equip_setup_" + const_legacy_setup_local_storage[ii] + "_" + i);
            }
        }
    }
    
    localStorage.removeItem("equip_setup_target");
    localStorage.removeItem("equip_setup_filter");
    localStorage.removeItem("equip_setup_count");
    localStorage.removeItem("equip_setup_pin");
}

function equip_legacy_v1_artifacts_storage_load_local() {
    var artifact_list_json = localStorage.getItem("equip_artifact_list");
    if (artifact_list_json) {
        utils_log_debug("Found legacy Artifacts locally.");
        var artifact_list = JSON.parse(artifact_list_json);
        equip_legacy_v1_artifacts_storage_load(artifact_list); 
        equip_artifacts_storage_save_last();
        localStorage.removeItem("equip_artifact_list");
    }
}


function equip_legacy_v1_artifacts_storage_load(artifact_list) {
    for (var i = 0; i < const_artifact_types.length; i++) {
        var artifact_id = const_artifact_types[i];
        for (var ii = 0; ii < artifact_list[artifact_id].length; ii++) {
            var artifact_legacy = artifact_list[artifact_id][ii];
            var artifact = {};
            artifact.id = artifact_legacy.id;
            artifact.stars = artifact_legacy.star;
            artifact.level = artifact_legacy.level;
            artifact.main_stat = artifact_legacy.main;
            artifact.sub_stats = [];
            for (var iii = 0; iii < const_artifact_sub_stats; iii++) {
                var sub_stat = {};
                sub_stat.id = artifact_legacy["sub_" + iii];
                sub_stat.value = artifact_legacy["sub_val_" + iii];
                artifact.sub_stats.push(sub_stat);
            }
            equip_artifacts_storage_save_artifact(artifact_id, artifact, false);
        }
    }
}

function equip_legacy_v1_url_return_character(url) {
    url = decodeURI(url.replace(/%24/g, "$"));
    var url_split = url.split("$");

    var url_patch = Number(url_split[0]);
    var url_equip = utils_url_long(url_split[2]);
    var url_substats = utils_url_long(url_split[3]);

    var character_object = structuredClone(default_storage_character);
    character_object.id = equip_legacy_v1_url_return_character_id(url_split[1]);
    if (character_object.id) {
        character_object = equip_legacy_v1_url_return_character_objects(character_object, utils_base_convert(url_equip, 64, 2), url_patch);
        character_object = equip_legacy_v1_url_return_artifact_substats(character_object, utils_base_convert(url_substats, 64, 2), url_patch);
    }
    character_object.display_stats = equip_stats_return_display_stats(character_object);
    character_object.vision_stat = equip_stats_return_calculated_vision_stat(character_object.id, character_object.display_stats);
    return character_object;
}

function equip_legacy_v1_url_return_character_id(char_url) {
    return utils_dict_lookup_property(data_characters, "id", utils_base_convert(char_url.split("&")[0], 64, 10));
}

function equip_legacy_v1_url_return_character_objects(character_object, url_equip, url_patch) {
    
    var a = 0;
    var b = 4;

    if (url_patch < 4) {
        character_object.level = equip_legacy_v1_return_old_level(utils_base_convert(url_equip.slice(a, b), 2, 10));
    } else {
        character_object.level = utils_base_convert(url_equip.slice(a, b), 2, 10);
    }

    if (url_patch >= 2) {
        a = b; b += 3;
        character_object.constel = utils_base_convert(url_equip.slice(a, b), 2, 10);
    }

    if (url_patch >= 3) {
        for (var i = 0; i < const_attack_level_types.length; i++) {
            a = b; b += 4;
            character_object["level" + const_attack_level_types[i]] = utils_base_convert(url_equip.slice(a, b), 2, 10);
        }
    }

    a = b; b += 8;
    character_object.weapon.id = utils_base_convert(url_equip.slice(a, b), 2, 10);
    a = b; b += 4;
    if (url_patch < 4) {
        character_object.weapon.level = equip_legacy_v1_return_old_level(utils_base_convert(url_equip.slice(a, b), 2, 10));
    } else {
        character_object.weapon.level = utils_base_convert(url_equip.slice(a, b), 2, 10);
    }
    a = b; b += 3;
    character_object.weapon.refine = utils_base_convert(url_equip.slice(a, b), 2, 10);

    for (var i = 0; i < const_artifact_types.length; i++) {

        a = b; b += 6;
        character_object.artifacts[const_artifact_types[i]].id = utils_base_convert(url_equip.slice(a, b), 2, 10);
        a = b; b += 3;
        character_object.artifacts[const_artifact_types[i]].stars = utils_base_convert(url_equip.slice(a, b), 2, 10);
        a = b; b += 5;
        character_object.artifacts[const_artifact_types[i]].level = utils_base_convert(url_equip.slice(a, b), 2, 10);
        a = b; b += 4;
        character_object.artifacts[const_artifact_types[i]].main_stat = data_artifact_vars[const_artifact_types[i]].main_stats[utils_base_convert(url_equip.slice(a, b), 2, 10)];

        for (var ii = 0; ii < const_artifact_sub_stats; ii++) {
            a = b; b += 4;
            character_object.artifacts[const_artifact_types[i]].sub_stats[ii].id = const_artifact_sub_stats_options[utils_base_convert(url_equip.slice(a, b), 2, 10)];
        }
    }

    return character_object;
}

function equip_legacy_v1_url_return_artifact_substats(character_object, url_substats, url_patch) {

    var a = 0;
    var b = 0;
    for (var i = 0; i < const_artifact_types.length; i++) {
        for (var ii = 0; ii < const_artifact_sub_stats; ii++) {
            var sub_stat = character_object.artifacts[const_artifact_types[i]].sub_stats[ii].id;
            a = b;
            if (url_patch >= 7) {
                b += const_legacy_artifact_substats_bitsize[sub_stat];
            } else {
                b += 10;
            }

            if (data_stats[sub_stat].type == "percent") {
                character_object.artifacts[const_artifact_types[i]].sub_stats[ii].value = utils_base_convert(url_substats.slice(a, b), 2, 10) / 10;
            } else if (data_stats[sub_stat].type == "flat") {
                character_object.artifacts[const_artifact_types[i]].sub_stats[ii].value = utils_base_convert(url_substats.slice(a, b), 2, 10);
            }
        }
    }
    return character_object;
}

function equip_legacy_v1_return_old_level(lvl) {
    if (lvl == 0) {
        return 0;
    } else {
        return lvl * 2 - 1;
    }
}