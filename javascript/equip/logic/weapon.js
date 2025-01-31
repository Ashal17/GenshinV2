const weapon_types = ["bow", "catalyst", "claymore", "polearm", "sword"];
const refine_list = [1, 2, 3, 4, 5];
const weapon_max_levels = [0, 9, 9, 13, 13, 13];

function equip_weapon_change_trigger() {
    equip_weapon_update(user_objects.user_active_character);

    equip_stats_update_total_all();
    equip_effects_update_options_all();
    equip_effects_update_stats_all();
    equip_stats_update_total_all();
    equip_skills_update_all();

    equip_effects_display_all();
    equip_skills_display_all();
    equip_weapon_display();
    equip_stats_display();
    equip_storage_save_last();
}

function equip_weapon_change(i) {

    var current_weapon = user_objects.user_party[user_objects.user_active_character].weapon;
    current_weapon.id = i;

    var weapon_type = output_party[user_objects.user_active_character].weapon_type;
    var weapon = utils_array_get_by_lookup(data_weapons[weapon_type], "id", i);

    if (current_weapon.level > weapon_max_levels[weapon.rarity]) {
        equip_weapon_change_level(weapon_max_levels[weapon.rarity], true);
    }

    equip_weapon_change_trigger();
}

function equip_weapon_change_level(i, skip_trigger = false) {
    user_objects.user_party[user_objects.user_active_character].weapon.level = i;

    if (!skip_trigger) {
        equip_weapon_change_trigger();
    }     
}

function equip_weapon_change_refine(i) {
    user_objects.user_party[user_objects.user_active_character].weapon.refine = i;

    equip_weapon_change_trigger();
}

function equip_weapon_update_all() {
    for (var i = 0; i < party_size; i++) {
        equip_weapon_update(i);
    }
}

function equip_weapon_update(party_id) {

    var stats = [];
  
    var current_weapon = user_objects.user_party[party_id].weapon;
    var weapon_type = output_party[party_id].weapon_type;
    var weapon = utils_array_get_by_lookup(data_weapons[weapon_type], "id", current_weapon.id);  

    stats.push(
        { "id": "atk_base", "value": data_weapon_stats.primary[weapon.atk_base][current_weapon.level] }
    );

    for (var i = 0; i < weapon.stats.length; i++) {
        var stat_id = weapon.stats[i].stat;
        var value = 0;

        if (weapon.stats[i].type == "refine") {
            value = weapon.stats[i].value[current_weapon.refine];
        } else if (weapon.stats[i].type == "level") {
            value = data_weapon_stats.secondary[weapon.stats[i].value][Math.round(current_weapon.level / 2)];
        } else if (weapon.stats[i].type == "flat") {
            value = weapon.stats[i].value;
        }

        stats.push(
            { "id": stat_id, "value": value }
        );
    }

    output_party[party_id].stats.weapon = stats;
}

function equip_weapon_display() {

    var current_weapon = user_objects.user_party[user_objects.user_active_character].weapon;
    var weapon_type = output_party[user_objects.user_active_character].weapon_type;
    var weapon = utils_array_get_by_lookup(data_weapons[weapon_type], "id", current_weapon.id);    
    var name = document.getElementById("weapon_name");
    var icon = document.getElementById("weapon_icon");
    var img = document.getElementById("weapon_img");
    var level = document.getElementById("weapon_level");
    var level_text = document.getElementById("weapon_level_text");
    var refine = document.getElementById("weapon_refine");
    var refine_text = document.getElementById("weapon_refine_text");

    name.innerHTML = weapon.name;
    icon.className = "equipment_icon img_stars_" + weapon.rarity;
    img.src = "/images/icons/weapon/" + weapon_type + "/" + weapon.icon + ".png";
    level.className = "icon_selects weapon_level l" + current_weapon.level;
    level_text.innerHTML = level_list[current_weapon.level];
    refine.className = "icon_selects weapon_refine r" + current_weapon.refine;
    refine_text.innerHTML = "R" + refine_list[current_weapon.refine];

    var stats = document.getElementById("weapon_stats");
    utils_delete_children(stats, 0);
    
    stats.appendChild(utils_create_stat("atk_base", data_weapon_stats.primary[weapon.atk_base][current_weapon.level]));
    for (var i = 0; i < weapon.stats.length; i++) {
        if (weapon.stats[i].type == "refine") {
            stats.appendChild(utils_create_stat(weapon.stats[i].stat, weapon.stats[i].value[current_weapon.refine]));
        } else if (weapon.stats[i].type == "level") {
            stats.appendChild(utils_create_stat(weapon.stats[i].stat, data_weapon_stats.secondary[weapon.stats[i].value][Math.round(current_weapon.level/2)]));
        } else if (weapon.stats[i].type == "flat") {
            stats.appendChild(utils_create_stat(weapon.stats[i].stat, weapon.stats[i].value));
        }
    }
  
    var effects_text = "";

    for (var i = 0; i < weapon.display_effects.length; i++) {
        var effectsobj = weapon.display_effects[i]
        if (effectsobj.type == "refine") {
            effects_text += " <span class='highlight'>"
            effects_text += effectsobj.value[current_weapon.refine];
            if (effectsobj.post) {
                effects_text += effectsobj.post;
            }
            effects_text += "</span>"
        } else if (effectsobj.type == "text") {
            effects_text += effectsobj.value;
        }
    }

    if (effects_text) {
        var effects_trigger = utils_create_obj("div", "tooltip_trigger", null, weapon.effect_name);

        var effects_tooltip = utils_create_obj("div", "tooltip_hover");
        effects_trigger.append(effects_tooltip)
        var effects_container = utils_create_obj("div");
        effects_tooltip.appendChild(effects_container);
        effects_container.appendChild(utils_create_obj("p", null, null, effects_text));

        stats.appendChild(effects_trigger);
    }  

}

function equip_weapon_return_level_options() {
    var current_weapon = user_objects.user_party[user_objects.user_active_character].weapon;
    var weapon_type = output_party[user_objects.user_active_character].weapon_type;
    var weapon = utils_array_get_by_lookup(data_weapons[weapon_type], "id", current_weapon.id);    

    var options = [];

    for (var i = 0; i <= weapon_max_levels[weapon.rarity]; i++) {
        options.push(level_list[i])
    }

    return options;
}

