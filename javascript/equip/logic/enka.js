const enka_stats_transform_table = {
    "FIGHT_PROP_ATTACK": "atk",
    "FIGHT_PROP_ATTACK_PERCENT": "atk%",
    "FIGHT_PROP_DEFENSE": "def",
    "FIGHT_PROP_DEFENSE_PERCENT": "def%",
    "FIGHT_PROP_HP": "hp",
    "FIGHT_PROP_HP_PERCENT": "hp%",
    "FIGHT_PROP_CRITICAL": "crit",
    "FIGHT_PROP_CRITICAL_HURT": "critdmg",
    "FIGHT_PROP_CHARGE_EFFICIENCY": "recharge",
    "FIGHT_PROP_ELEMENT_MASTERY": "elemastery",
    "FIGHT_PROP_WIND_ADD_HURT": "anemo",
    "FIGHT_PROP_ICE_ADD_HURT": "cryo",
    "FIGHT_PROP_GRASS_ADD_HURT": "dendro",
    "FIGHT_PROP_ELEC_ADD_HURT": "electro",
    "FIGHT_PROP_ROCK_ADD_HURT": "geo",
    "FIGHT_PROP_WATER_ADD_HURT": "hydro",
    "FIGHT_PROP_FIRE_ADD_HURT": "pyro",
    "FIGHT_PROP_PHYSICAL_ADD_HURT": "physical",
    "FIGHT_PROP_HEAL_ADD": "healing"
}

const enka_stats_display_table = {
    "2000": "hp",
    "2001": "atk",
    "2002": "def",
    "20": "crit",
    "22": "critdmg",
    "23": "recharge",
    "28": "elemastery",
    "44": "anemo",
    "46": "cryo",
    "43": "dendro",
    "41": "electro",
    "45": "geo",
    "42": "hydro",
    "40": "pyro",
    "30": "physical",
    "26": "healing"
}



function equip_enka_load_last() {
    var user_storage = localStorage.getItem("enka_storage");
    if (user_storage) {
        utils_log_debug("Found saved Enka.");
        equip_setup_enka_objects(JSON.parse(user_storage));
    } else {
        utils_log_debug("No saved Enka.");
    }
}

function equip_enka_save_last() {
    var enka_json = JSON.stringify(enka_objects);
    localStorage.setItem("enka_storage", enka_json);
}

function equip_enka_change_trigger() {
    equip_enka_display_all();
    equip_enka_save_last();
}

function equip_enka_change_load_uid() {
    var uid = document.getElementById("prompt_input_enka").value;
    if (uid) {
        equip_enka_request_uid(uid.trim());
    }    
}

function equip_enka_change_goto_uid() {
    var uid = document.getElementById("prompt_input_enka").value;
    if (uid) {
        window.open("https://enka.network/u/" + uid, "_blank").focus();;
    }
}

function equip_enka_change_load_character(input_obj) {
    equip_character_load(input_obj.party_id, enka_objects.saved_storage[input_obj.index]);
}

function equip_enka_change_save_character(index) {
    var character = structuredClone(enka_objects.saved_storage[index]);
    var hash = utils_hash(JSON.stringify(character))

    for (var i = 0; i < character_storage_objects.saved_characters.length; i++) {
        if (character_storage_objects.saved_characters[i].hash == hash) {
            utils_message("This Character build is already saved!", "automatic_warn")
            return;
        } 
    }
    character.hash = hash;
    character_storage_objects.saved_characters.push(character);
    equip_character_save_last();
}

function equip_enka_update_response(response) {
    try {
        if (response.status == 200) {
            try {
                if (response.response) {
                    var uid = document.getElementById("prompt_input_enka").value;
                    equip_enka_update_data(response.response, uid);
                    equip_enka_change_trigger();
                    utils_loading_hide();
                } else {
                    utils_loading_show_error("Enka response is empty", "Enka response is empty")
                }
            } catch (e) {
                utils_loading_show_error(e, "Parsing Error occured:\n" + e)
            }
            utils_loading_hide();
        } else {
            try {
                var err = JSON.parse(response.responseText);
                utils_loading_show_error(response.status + " - " + err.error, "Enka Error occured:\n" + err.message)
            } catch (e) {
                utils_loading_show_error(response.responseText, "Unknown Enka Error occured:\n" + e)
            }
        }       
    } catch (e) {
        utils_loading_show_error(response, "Parsing Error occured:\n" + e);
    }    
}

function equip_enka_request_uid(uid) {
    utils_loading_show();

    var request = {};
    request.data = {};
    request.data.uid = uid;

    utils_ajax("POST", "endpoints/enka.php", equip_enka_update_response, JSON.stringify(request))
}

function equip_enka_update_data(response_json, uid) {
    var response = JSON.parse(response_json);

    if (uid != response.uid) {
        throw new Error('UID do not match');
    }

    var enka_chars = response.avatarInfoList;

    var characters = [];

    if (enka_chars) {
        for (var i = 0; i < enka_chars.length; i++) {
            characters.push(equip_enka_return_character(uid, enka_chars[i]));
        }
    }

    if ("profile_builds" in response) {
        for (const [key, value] of Object.entries(response.profile_builds)) {
            for (var i = 0; i < value.length; i++) {
                characters.push(equip_enka_return_character(uid, value[i].avatar_data, value[i].name));
            }
        }
    }

    utils_log_debug("Loaded " + characters.length + " characters");
    enka_objects.saved_storage = characters;
    enka_objects.last_uid = uid;
}

function equip_enka_display_all() {
    var parent = document.getElementById("enka_column");
    utils_delete_children(parent, 0);

    for (var i = 0; i < enka_objects.saved_storage.length; i++) {
        if (enka_objects.saved_storage[i].id) {
            parent.appendChild(equip_enka_display(i));
        }       
    }
}

function equip_enka_display(index) {
    var enka_character = enka_objects.saved_storage[index];
    var character = data_characters[enka_character.id];

    var obj = utils_create_obj("div", "char_storage_row", "enka_row_" + index);       
    obj.appendChild(equip_character_storage_display_name(character, enka_character.name));
    obj.appendChild(equip_character_storage_display_data(enka_character));
    obj.appendChild(equip_character_storage_display_equip(enka_character));
    obj.appendChild(equip_character_storage_display_stats(enka_character.display_stats, enka_character.vision_stat));
    obj.appendChild(equip_enka_display_btns(index));

    return obj;
}

function equip_enka_display_btns(index) {
    var btns_obj = utils_create_obj("div", "char_storage_btns", "enka_btns_" + index);

    for (let i = 0; i < party_size; i++) {
        let input_obj = { "party_id": i, "index": index };
        let party_num = i + 1;
        btns_obj.appendChild(utils_create_img_button_prompt_confirm("numeric-" + party_num + "-box-outline", "Load as Party " + party_num, "enka_party_load_" + i + "_" + index, "Load this character as Party " + party_num + "?", equip_enka_change_load_character, input_obj, "char_storage_btn", "active_prompt_enka"))
    }

    btns_obj.appendChild(utils_create_img_button_prompt_confirm("download", "Save Character", "enka_party_save_" + index, "Save this character?", equip_enka_change_save_character, index, "char_storage_btn", "active_prompt_enka"))

    return btns_obj;
}

function equip_enka_return_character(uid, enka_char, custom_name = null) {
    var character = structuredClone(default_enka_character);
    character.uid = uid;
    character.id = utils_dict_lookup_property(data_characters, "enka_id", enka_char.avatarId);
    if (!character.id) {
        return character;
    }
    character.name = data_characters[character.id].name;
    if (custom_name) {
        character.name = character.name + " (" + custom_name + ")";
    }
    character.level = equip_enka_return_level(enka_char.propMap["4001"].val, enka_char.propMap["1002"].val);
    if ("talentIdList" in enka_char) {
        character.constel = enka_char.talentIdList.length;
    } 

    var skill_level = [];
    for (const [key, value] of Object.entries(enka_char.skillLevelMap)) {
        skill_level.push(value - 1);
    }
    while (skill_level.length > attack_level_types.length) {
        skill_level.shift();
    }
    for (var i = 0; i < attack_level_types.length; i++) {
        character["level" + attack_level_types[i]] = skill_level[i];
    }

    for (var i = 0; i < enka_char.equipList.length; i++) {
        var enka_equip = enka_char.equipList[i];
        if (enka_equip.flat.itemType == "ITEM_WEAPON") {
            var weapon_type = data_characters[character.id].weapon;
            character.weapon.id = data_weapons[weapon_type][utils_array_lookup_parameter(data_weapons[weapon_type], "enka_id", enka_equip.itemId, false, true)].id;

            character.weapon.level = equip_enka_return_level(enka_equip.weapon.level, enka_equip.weapon.promoteLevel);

            if (enka_equip.weapon.affixMap) {
                for (const [key, value] of Object.entries(enka_equip.weapon.affixMap)) {
                    character.weapon.refine = value;
                }
            } else {
                character.weapon.refine = 0;
            }
        } else if (enka_equip.flat.itemType == "ITEM_RELIQUARY") {
            var artifact_type = equip_enka_return_artifact_type(enka_equip.flat.equipType);
            var artifact = character.artifacts[artifact_type];
            artifact.id = utils_array_get_by_lookup(data_artifact_sets, "enka_id", enka_equip.flat.icon.split("_")[2]).id;
            artifact.stars = enka_equip.flat.rankLevel;
            artifact.level = enka_equip.reliquary.level - 1;
            artifact.main_stat = enka_stats_transform_table[enka_equip.flat.reliquaryMainstat.mainPropId];

            for (var ii = 0; ii < enka_equip.reliquary.appendPropIdList.length; ii++) {
                var sub = utils_array_get_by_lookup(data_artifact_enka_stats, "id", enka_equip.reliquary.appendPropIdList[ii]);
                var filled_substat = false;
                for (var iii = 0; iii < artifact_sub_stats; iii++) {
                    if (artifact.sub_stats[iii].id == artifact_sub_stats_options[0]) {
                        artifact.sub_stats[iii].id = sub.stat;
                        artifact.sub_stats[iii].value = sub.value;
                        filled_substat = true;
                        break;
                    } else if (artifact.sub_stats[iii].id == sub.stat) {
                        artifact.sub_stats[iii].value += sub.value;
                        filled_substat = true;
                        break;
                    }
                }
                if (filled_substat == false) {
                    throw new Error('More than 4 substats: ' + sub.stat + ' in artifact: ' + artifact.sub_stats);
                }
            }
        }
    }

    for (const [key, value] of Object.entries(enka_char.fightPropMap)) {
        if (key in enka_stats_display_table) {
            if (data_stats[enka_stats_display_table[key]].type == "percent") {
                character.display_stats[enka_stats_display_table[key]] = value * 100;
            } else {
                character.display_stats[enka_stats_display_table[key]] = value;
            }
        }
    }

    character.vision_stat = equip_enka_return_vision_stat(character.id, character.display_stats);

    return character;
}

function equip_enka_return_level(level, asc) {
    if (asc) {
        var result = asc * 2;
    } else {
        var result = 0;
    }
    if (level == level_list_values[result + 1]) {
        result += 1;
    }
    return result;
}

function equip_enka_return_artifact_type(equip_type) {
    for (const [key, value] of Object.entries(data_artifact_vars)) {
        if (value["enka_name"] == equip_type) {
            return key;
        }
    }
}

function equip_enka_return_vision_stat(char_id, enka_stats) {
    var highest_val = 0;
    var highest_stat = data_characters[char_id].vision;

    for (let vision in visions_variables) {
        if (enka_stats[vision] > highest_val) {
            highest_val = enka_stats[vision];
            highest_stat = vision;
        }
    }
    return highest_stat;
}