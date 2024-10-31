function equip_effects_update_options_all() {
    for (var i = 0; i < party_size; i++) {
        equip_effects_update_options(i);
    }
}

function equip_effects_update_options(party_id) {

    var effect_list = [];
    equip_effects_update_character_options(effect_list, party_id, false);   
    output_party[party_id].effects.character = effect_list;

    var party_effect_list = [];

    for (var i = 0; i < output_resonances.length; i++) {
        var resonance = utils_array_get_by_lookup(data_resonance, "id", output_resonances[i]);
        for (var ii = 0; ii < resonance.bonus.length; ii++) {
            if (resonance.bonus[ii].apply) {
                equip_effects_update_single_option(party_effect_list, resonance.bonus[ii].apply, 0, false)
            }
        }
    }

    for (var i = 0; i < party_size; i++) {       
        if (i != party_id) {
            equip_effects_update_character_options(party_effect_list, i, true);           
        }
    }
    output_party[party_id].effects.party = party_effect_list;
}

function equip_effects_update_character_options(effect_list, party_id, party) {
    var current_character = data_characters[user_objects.user_party[party_id].id];

    for (var i = 0; i < current_character.attacks.length; i++) {
        if (current_character.attacks[i].apply) {
            equip_effects_update_single_option(effect_list, current_character.attacks[i].apply, party)
        }
    }

    for (var i = 0; i < current_character.passive.length; i++) {
        if (user_objects.user_party[party_id].level >= current_character.passive[i].level && current_character.passive[i].apply) {
            equip_effects_update_single_option(effect_list, current_character.passive[i].apply, party)
        }
    }

    for (var i = 0; i < current_character.const.length; i++) {
        if (user_objects.user_party[party_id].constel > i && current_character.const[i].apply) {
            equip_effects_update_single_option(effect_list, current_character.const[i].apply, party)
        }
    }

    var current_weapon = data_weapons[output_party[party_id].weapon_type][user_objects.user_party[party_id].weapon.id];

    if (current_weapon.apply_effect) {
        equip_effects_update_single_option(effect_list, current_weapon.apply_effect, party, user_objects.user_party[party_id].weapon.refine)
    }

    for (const [key, value] of Object.entries(output_party[party_id].artifacts.sets)) {
        var artifact_set = utils_array_get_by_lookup(data_artifact_sets, "id", key);
        for (var i = 0; i < artifact_set.set_bonus.length; i++) {
            if (value >= artifact_set.set_bonus[i].req && artifact_set.set_bonus[i].apply) {
                equip_effects_update_single_option(effect_list, artifact_set.set_bonus[i].apply, party)
            }
        }
    }
}

function equip_effects_update_single_option(effect_list, apply, party = false, offset = 0) {
    if (Array.isArray(apply)) {
        for (var i = 0; i < apply.length; i++) {
            equip_effects_update_single_option(effect_list, apply[i], party, offset)
        }
    } else {
        if ((!party && !apply.noself) || (party && apply.party)) {
            var offset_val = 0;
            if (apply.offset) {
                offset_val = apply.offset[offset];
            }

            if (apply.option || apply.option === 0) {
                effect_list.push(
                    { "id": apply.id + offset_val, "option": apply.option }
                )
            } else {
                effect_list.push(
                    { "id": apply.id + offset_val, "option": 0 }
                )
            }
        }
        
    }
}