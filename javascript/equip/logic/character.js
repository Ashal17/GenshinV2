
const party_size = 4;
const level_list = ["1", "20", "20+", "40", "40+", "50", "50+", "60", "60+", "70", "70+", "80", "80+", "90"];
const level_list_values = [1, 20, 20, 40, 40, 50, 50, 60, 60, 70, 70, 80, 80, 90];
const constel_list = [0, 1, 2, 3, 4, 5, 6];
const character_visions = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"];

function equip_character_change_simple_trigger(party_id) {
    equip_character_update_stats(party_id);
    equip_effects_update_options_all();
    equip_stats_update_total(party_id);
    equip_character_display(party_id);
    equip_stats_display();
    equip_storage_save_last();
}

function equip_character_change_trigger(party_id) {
    equip_character_update_all(true);
    equip_effects_update_options_all();
    equip_stats_update_total_all();

    equip_character_display(party_id);
    equip_character_display_resonance();
    equip_stats_display();
    equip_storage_save_last();
}

function equip_enemy_change_trigger() {
    for (var i = 0; i < party_size; i++) {
        equip_character_update_stats(i);
        equip_stats_update_total(i);
    }
    equip_enemy_display();
    equip_stats_display();
    equip_storage_save_last();
}

function equip_active_character_change(party_id) {
    if (user_objects.user_active_character != party_id) {
        user_objects.user_active_character = party_id;
              
        equip_control_display_all();
        equip_weapon_display();
        equip_artifacts_display_all();
        equip_stats_display();
        equip_storage_save_last();
    }
}

function equip_character_change(character_id, party_id) {

    for (var i = 0; i < user_objects.user_party.length; i++) {
        if (character_id != "none" && character_id == user_objects.user_party[i].id) {
            utils_message("Each character can be present only once in party!", "automatic_warn")
            return;
        }
    }
    user_objects.user_party[party_id].id = character_id;

    equip_character_change_trigger(party_id);
   
    equip_weapon_display();
}

function equip_character_change_level(i, party_id) {
    user_objects.user_party[party_id].level = i;

    equip_character_change_simple_trigger(party_id)
}

function equip_character_change_constel(i, party_id) {
    user_objects.user_party[party_id].constel = i;

    equip_character_change_simple_trigger(party_id)
}

function equip_enemy_change(enemy_id) {
    user_objects.user_enemy.id = enemy_id;

    equip_enemy_change_trigger();
}

function equip_enemy_change_level(level) {
    level = utils_number_verify(level, 0, 0, 103);
    if (level != null) {
        user_objects.user_enemy.level = level;
        equip_enemy_change_trigger();
    }
    
}

function equip_character_update_all(manual = false) {
    
    equip_character_update_resonance();

    for (var i = 0; i < party_size; i++) {
        equip_character_update(i, manual);
        equip_character_update_stats(i);
    }
}

function equip_character_update(party_id, manual = false) {

    var new_weapon_type = data_characters[user_objects.user_party[party_id].id].weapon;

    if (manual && output_party[party_id].weapon_type != new_weapon_type) {        
        user_objects.user_party[party_id].weapon.id = 0;
        user_objects.user_party[party_id].weapon.level = 0;
        user_objects.user_party[party_id].weapon.refine = 0;
    }

    output_party[party_id].weapon_type = new_weapon_type;
    
}

function equip_character_update_stats(party_id) {

    var stats = [];

    var character = data_characters[user_objects.user_party[party_id].id];
    var level = user_objects.user_party[party_id].level;

    for (var i = 0; i < character.stats.length; i++) {
        stats.push(
            { "id": character.stats[i].stat, "value": character.stats[i].values[level] }
        );
    }

    for (var i = 0; i < user_objects.user_party[party_id].constel; i++) {
        if (character.const[i].hasOwnProperty("bonus")) {
            for (var ii = 0; ii < character.const[i].bonus.length; ii++) {
                stats.push(
                    { "id": character.const[i].bonus[ii].stat, "value": character.const[i].bonus[ii].value }
                );
            }            
        }
    }

    for (var i = 0; i < output_resonances.length; i++) {
        var resonance = utils_array_get_by_lookup(data_resonance, "id", output_resonances[i]);
        for (var ii = 0; ii < resonance.bonus.length; ii++) {
            if (resonance.bonus[ii].stat) {
                stats.push(
                    { "id": resonance.bonus[ii].stat, "value": resonance.bonus[ii].value }
                );
            }
        }
        
    }

    var enemy = utils_array_get_by_lookup(data_enemies, "id", user_objects.user_enemy.id);

    for (var i = 0; i < enemy.stats.length; i++) {
        stats.push(
            { "id": enemy.stats[i].id, "value": enemy.stats[i].value }
        );
    }

    if (user_objects.user_enemy.level > 0) {
        var defense = 5 * user_objects.user_enemy.level + 500;
    } else {
        var defense = 0;
    }

    stats.push(
        { "id": "enemydef", "value": defense }
    );

    output_party[party_id].stats.basic = stats;
}

function equip_character_update_resonance() {
    var active_resonances = [];
    var visions = [];

    for (var i = 0; i < party_size; i++) {
        if (data_characters[user_objects.user_party[i].id].vision) {
            visions.push(data_characters[user_objects.user_party[i].id].vision);
        }
    }

    for (var i = 0; i < data_resonance.length; i++) {
        if (data_resonance[i].vision) {
            if (visions.length == party_size && utils_array_count(visions, data_resonance[i].vision) >= data_resonance[i].req) {
                active_resonances.push(data_resonance[i].id);
            }
        }
    }

    for (var i = 0; i < data_resonance.length; i++) {
        if (!data_resonance[i].vision) {
            if (visions.length == party_size && active_resonances.length == 0) {
                active_resonances.push(data_resonance[i].id);
            } 
        }
    }

    output_resonances = active_resonances;
}

function equip_character_display_all() {
    for (var i = 0; i < party_size; i++) {
        equip_character_display(i);
    }
}

function equip_character_display(party_id) {

    var character_id = user_objects.user_party[party_id].id;
    var character = data_characters[character_id];
    var name = document.getElementById("character_name_" + party_id);
    var icon = document.getElementById("character_icon_" + party_id);
    var img = document.getElementById("character_img_" + party_id);
    var level = document.getElementById("character_level_" + party_id);
    var level_text = document.getElementById("character_level_text_" + party_id);
    var constel = document.getElementById("character_constel_" + party_id);
    var constel_text = document.getElementById("character_constel_text_" + party_id);

    name.innerHTML = character.name;
    name.className = "container_name " + character.vision;
    icon.className = "character_icon " + character.vision;
    img.src = "/images/icons/character/" + character_id + "/char.png";
    level.className = "icon_selects character_level l" + user_objects.user_party[party_id].level;
    level_text.innerHTML = level_list[user_objects.user_party[party_id].level];
    constel.className = "icon_selects character_constel c" + user_objects.user_party[party_id].constel;
    constel_text.innerHTML = "C" + constel_list[user_objects.user_party[party_id].constel];
}

function equip_character_display_resonance() {

    for (var i = 0; i < data_resonance.length; i++) {
        if (output_resonances.includes(data_resonance[i].id)) {
            document.getElementById("resonance_" + i).className = "resonance tooltip_trigger active";
        } else {
            document.getElementById("resonance_" + i).className = "resonance tooltip_trigger";
        }
    }
}

function equip_enemy_display() {
    var enemy_id = user_objects.user_enemy.id;
    var enemy = utils_array_get_by_lookup(data_enemies, "id", enemy_id);
    var name = document.getElementById("enemy_name");
    var icon = document.getElementById("enemy_icon");
    var img = document.getElementById("enemy_img");
    var level = document.getElementById("enemy_level_text");

    name.innerHTML = enemy.name;
    name.className = "container_name " + enemy.vision;
    icon.className = "character_icon " + enemy.vision;
    img.src = "/images/icons/enemy/" + enemy.icon + ".png";
    level.innerHTML = user_objects.user_enemy.level;
}
