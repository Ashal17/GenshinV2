function equip_control_display_all() {

    for (var i = 0; i < party_size; i++) {
        if (i == user_objects.user_active_character) {
            document.getElementById("container_character_" + i).className = "container_object container_character active_character";
        } else {
            document.getElementById("container_character_" + i).className = "container_object container_character";
        }
    }

}

function equip_control_create_character_select(party_id, icon) {
    var options = [];


    for (var key in data_characters) {
        options.push(equip_control_create_character(key, party_id));
    }

    options = utils_array_sort(options, "name");

    options.unshift(options.splice(options.findIndex(item => item.id === "prompt_option_none"), 1)[0]);

    utils_create_prompt_select("Select Party Member " + (party_id + 1), icon.id, options, "frame_party_content");
}

function equip_control_create_character(character_id, party_id) {
    var character = data_characters[character_id];

    var icon = utils_create_obj("div", "character_icon " + character.vision, "prompt_option_" + character_id);
    var icon_container = utils_create_obj("div", "character_img");
    icon_container.appendChild(utils_create_img(null, null, "images/icons/character/" + character_id + "/char.png"));
    icon_container.onclick = function () { equip_character_change(character_id, party_id); utils_destroy_current_prompt(); };
    icon.appendChild(icon_container);
    
    icon.name = character.name;

    if (character.short_name) {
        var char_name = character.short_name;
    } else {
        var char_name = character.name;
    }

    var label_name = utils_create_obj("p", "character_img_label", null, char_name);
    icon.appendChild(label_name);

    if (character.unreleased) {
        icon.appendChild(utils_create_obj("div", "character_ribbon ribbon_left_top",null , "Beta"));
    }

    

    return icon;
}

function equip_control_create_enemy_select(icon) {
    var options = [];

    for (var i = 0; i < data_enemies.length; i++) {
        options.push(equip_control_create_enemy(i));
    }

    utils_create_prompt_select("Select Enemy", icon.id, options, "frame_party_content");
}

function equip_control_create_enemy(index) {
    var enemy = data_enemies[index];

    var icon = utils_create_obj("div", "character_icon " + enemy.vision, "prompt_option_" + index);
    var icon_container = utils_create_obj("div", "character_img");
    icon.name = enemy.name;
    icon_container.onclick = function () { equip_enemy_change(enemy.id); utils_destroy_current_prompt(); };
    icon.appendChild(icon_container);
    icon_container.appendChild(utils_create_img(null, null, "images/icons/enemy/" + enemy.icon + ".png"));

    var label_name = utils_create_obj("p", "character_img_label enemy_img_label", null, enemy.name);
    icon.appendChild(label_name);

    
    return icon;
}

function equip_control_create_weapon_select(icon) {
    var weapon_type = output_party[user_objects.user_active_character].weapon_type;
    var options = [];

    for (var i = 0; i < data_weapons[weapon_type].length; i++) {
        if (data_weapons[weapon_type][i].icon) {
            options.push(equip_control_create_weapon(i, weapon_type));
        }
        
    }

    options = utils_array_sort(options, "name");
    options = utils_array_sort(options, "rarity");

    utils_create_prompt_select("Select Weapon ", icon.id, options, "frame_equipment_content");
}

function equip_control_create_weapon(index, weapon_type) {
    var weapon = data_weapons[weapon_type][index];

    var icon = utils_create_obj("div", "equipment_icon img_stars_" + weapon.rarity, "prompt_option_" + weapon.id);
    var icon_container = utils_create_obj("div", "equipment_img");
    icon.name = weapon.name;
    icon.rarity = weapon.rarity;
    icon.appendChild(icon_container);
    icon_container.appendChild(utils_create_img(null, null, "images/icons/weapon/" + weapon_type +"/"+ weapon.icon + ".png"));

    var label_name = utils_create_obj("p", "equipment_img_label", null, weapon.name);
    icon.appendChild(label_name);

    icon.onclick = function () { equip_weapon_change(weapon.id); utils_destroy_current_prompt(); };

    return icon;
}

function equip_control_create_artifacts_select(artifact_id, icon) {
    var options = [];

    for (var i = 0; i < data_artifact_sets.length; i++) {
        if (Object.hasOwn(data_artifact_sets[i], artifact_id) ) {
            options.push(equip_control_create_artifact(i, artifact_id));
        }
    }

    options = utils_array_sort(options, "name");
    options = utils_array_sort(options, "rarity");

    utils_create_prompt_select("Select " + data_artifact_vars[artifact_id].name, icon.id, options, "frame_equipment_content");
}

function equip_control_create_artifact(index, artifact_id) {
    var artifact = data_artifact_sets[index];

    var icon = utils_create_obj("div", "equipment_icon img_stars_" + artifact.stars.join("_"), "prompt_option_" + artifact.id);
    var icon_container = utils_create_obj("div", "equipment_img");
    icon.name = artifact.icon;
    icon.rarity = artifact.stars[0];
    icon.appendChild(icon_container);
    icon_container.appendChild(utils_create_img(null, null, "images/icons/artifact/" + artifact_id + "/" + artifact.icon + ".png"));

    var label_name = utils_create_obj("p", "equipment_img_label", null, artifact[artifact_id]);
    icon.appendChild(label_name);

    icon.onclick = function () { equip_artifacts_change(artifact.id, artifact_id); utils_destroy_current_prompt(); };

    return icon;
}
