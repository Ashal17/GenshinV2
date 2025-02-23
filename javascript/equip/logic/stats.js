const output_party_stat_objects = ["basic", "weapon", "artifacts", "effects"];
const visions_variables = {
    "anemo": {
        "name": "Anemo",
        "reactions": ["swirlcryo", "swirlelectro", "swirlhydro", "swirlpyro"],
        "reactions_mod": []
    },
    "cryo": {
        "name": "Cryo",
        "reactions": ["melt", "superconduct", "swirlcryo"],
        "reactions_mod": ["melt"]
    },
    "dendro": {
        "name": "Dendro",
        "reactions": ["burning", "rupture", "spread"],
        "reactions_mod": ["spread"]
    },
    "electro": {
        "name": "Electro",
        "reactions": ["superconduct", "electrocharged", "overload", "swirlelectro", "hyperbloom", "aggravate"],
        "reactions_mod": ["aggravate"]
    },
    "geo": {
        "name": "Geo",
        "reactions": ["crystalize"],
        "reactions_mod": []
    },
    "hydro": {
        "name": "Hydro",
        "reactions": ["vaporize", "electrocharged", "swirlhydro", "rupture"],
        "reactions_mod": ["vaporize"]
    },
    "pyro": {
        "name": "Pyro",
        "reactions": ["melt", "vaporize", "overload", "swirlpyro", "burning", "burgeon"],
        "reactions_mod": ["melt", "vaporize"]
    },
    "physical": {
        "name": "Physical",
        "reactions": [],
        "reactions_mod": []
    },
    "healing": {
        "name": "Healing",
        "reactions": [],
        "reactions_mod": []
    }
}

const reactions_variables = {
    "melt": {
        "name": "Melt",
        "type": "elemasterymult",
        "multiplier": {
            "pyro": 2,
            "cryo": 1.5
        },
        "combination": {
            "pyro": "cryo",
            "cryo": "pyro"
        }
    },
    "vaporize": {
        "name": "Vaporize",
        "type": "elemasterymult",
        "multiplier": {
            "pyro": 1.5,
            "hydro": 2
        },
        "combination": {
            "pyro": "hydro",
            "hydro": "pyro"
        }
    },
    "swirlcryo": {
        "name": "Swirl - Cryo",
        "type": "elemasteryadd",
        "multiplier": 0.6,
        "vision": "cryo"
    },
    "swirlelectro": {
        "name": "Swirl - Electro",
        "type": "elemasteryadd",
        "multiplier": 0.6,
        "vision": "electro"
    },
    "swirlhydro": {
        "name": "Swirl - Hydro",
        "type": "elemasteryadd",
        "multiplier": 0.6,
        "vision": "hydro"
    },
    "swirlpyro": {
        "name": "Swirl - Pyro",
        "type": "elemasteryadd",
        "multiplier": 0.6,
        "vision": "pyro"
    },
    "superconduct": {
        "name": "Superconduct",
        "type": "elemasteryadd",
        "multiplier": 0.5,
        "vision": "cryo"
    },
    "electrocharged": {
        "name": "Electro-Charged",
        "type": "elemasteryadd",
        "multiplier": 1.2,
        "vision": "electro"
    },
    "overload": {
        "name": "Overload",
        "type": "elemasteryadd",
        "multiplier": 2,
        "vision": "pyro"
    },
    "shatter": {
        "name": "Shatter",
        "type": "elemasteryadd",
        "multiplier": 1.5,
        "vision": "physical"
    },
    "crystalize": {
        "name": "Crystalize",
        "type": "elemasterycrystalize",
        "multiplier": 1,
        "vision": "geo"
    },
    "rupture": {
        "name": "Rupture",
        "type": "elemasteryadd",
        "multiplier": 2,
        "vision": "dendro"
    },
    "burgeon": {
        "name": "Burgeon",
        "type": "elemasteryadd",
        "multiplier": 3,
        "vision": "dendro"
    },
    "hyperbloom": {
        "name": "Hyperbloom",
        "type": "elemasteryadd",
        "multiplier": 3,
        "vision": "dendro"
    },
    "burning": {
        "name": "Burning",
        "type": "elemasteryadd",
        "multiplier": 0.25,
        "vision": "pyro"
    },
    "aggravate": {
        "name": "Aggravate",
        "type": "elemasterybonus",
        "multiplier": 1.15,
        "vision": "electro",
        "combination": {
            "electro": "dendro"
        }
    },
    "spread": {
        "name": "Spread",
        "type": "elemasterybonus",
        "multiplier": 1.25,
        "vision": "dendro",
        "combination": {
            "dendro": "electro"
        }
    }
}

const bonusdmg_names = {
    "normal": "Normal Attack",
    "charged": "Charged Attack",
    "plunge": "Plunging Attack",
    "skill": "Elemental Skill",
    "burst": "Elemental Burst"
}

const attack_level_types = ["normal", "skill", "burst"]

function equip_stats_update_total_all() {
    equip_stats_update_reset_total_all();
    equip_stats_update_add_total_all();

    equip_stats_update_transformation_all("main");
    equip_stats_update_transformation_all("mult");
    equip_effects_update_stats_transform_other_all();
    equip_stats_update_add_all("effects_transform_other");
    equip_effects_update_stats_transform_personal_all();
    equip_stats_update_add_all("effects_transform_personal");
    equip_stats_update_transformation_all("mult_trans");
    equip_stats_update_transformation_all("merge");
    equip_stats_update_transformation_all("elemastery");

    for (var i = 0; i < party_size; i++) {
        output_party[i].stats.total["enemyred"] = equip_stats_calculate_enemyred(output_party[i].stats.total, i);
    }

}

function equip_stats_update_reset_total_all() {
    for (var i = 0; i < party_size; i++) {
        equip_stats_update_reset_total(i);
    }
}

function equip_stats_update_reset_total(party_id) {
    output_party[party_id].stats.total = structuredClone(default_stats);
}

function equip_stats_update_add_total_all() {

    for (var i = 0; i < output_party_stat_objects.length; i++) {
        equip_stats_update_add_all(output_party_stat_objects[i]);
    }

}

function equip_stats_update_add_all(stats_obj_name) {
    for (var i = 0; i < party_size; i++) {
        equip_stats_update_add(i, stats_obj_name);
    }
}

function equip_stats_update_add(party_id, stats_obj_name) {
    var stats_obj = output_party[party_id].stats[stats_obj_name]
    for (var i = 0; i < stats_obj.length; i++) {
        output_party[party_id].stats.total[stats_obj[i].id] += stats_obj[i].value;
    }
}

function equip_stats_update_transformation_all(transformation_name) {
    for (var i = 0; i < party_size; i++) {
        output_party[i].stats.total = equip_stats_calculate_tranformation(output_party[i].stats.total, transformation_name);
    }
}

function equip_stats_calculate_tranformation(stats_total, transformation_name) {
    var transform_list = data_stat_transformations[transformation_name];

    for (var i = 0; i < transform_list.length; i++) {
        mainid = transform_list[i].stat;
        mainvalue = stats_total[mainid];
        change = transform_list[i].change;

        switch (change) {
            case "mult":
                for (var j = 0; j < transform_list[i].mods.length; j++) {
                    modid = transform_list[i].mods[j];
                    modvalue = stats_total[modid] / 100 + 1;
                    mainvalue = mainvalue * modvalue;
                }
                break;
            case "mult_100":
                for (var j = 0; j < transform_list[i].mods.length; j++) {
                    modid = transform_list[i].mods[j];
                    modvalue = stats_total[modid] / 100;
                    mainvalue = mainvalue * modvalue;
                }
                break;
            case "mult_red":
                for (var j = 0; j < transform_list[i].mods.length; j++) {
                    modid = transform_list[i].mods[j];
                    modvalue = stats_total[modid];
                    mainvalue = 100 - (100 - mainvalue) * (100 - modvalue) / 100;
                }
                break;

            case "times":
                for (var j = 0; j < transform_list[i].mods.length; j++) {

                    if (isNaN(transform_list[i].mods[j])) {
                        modid = transform_list[i].mods[j];
                        modvalue = stats_total[modid] / 100;
                    } else {
                        modvalue = transform_list[i].mods[j];
                    }
                    mainvalue = mainvalue * modvalue;
                }
                break;

            case "divide":
                for (var j = 0; j < transform_list[i].mods.length; j++) {

                    if (isNaN(transform_list[i].mods[j])) {
                        modid = transform_list[i].mods[j];
                        modvalue = stats_total[modid];
                    } else {
                        modvalue = transform_list[i].mods[j];
                    }
                    mainvalue = mainvalue / modvalue;
                }
                break;

            case "add":
                for (var j = 0; j < transform_list[i].mods.length; j++) {
                    if (isNaN(transform_list[i].mods[j])) {
                        modid = transform_list[i].mods[j];
                        modvalue = stats_total[modid];
                    } else {
                        modvalue = transform_list[i].mods[j];
                    }
                    mainvalue = mainvalue + modvalue;
                }
                break;

            case "substract":
                for (var j = 0; j < transform_list[i].mods.length; j++) {
                    if (isNaN(transform_list[i].mods[j])) {
                        modid = transform_list[i].mods[j];
                        modvalue = stats_total[modid];
                    } else {
                        modvalue = transform_list[i].mods[j];
                    }
                    mainvalue = mainvalue - modvalue;
                }
                break;
            case "cap":
                var modvalue = 0;
                for (var j = 0; j < transform_list[i].mods.length; j++) {
                    if (isNaN(transform_list[i].mods[j])) {
                        modid = transform_list[i].mods[j];
                        modvalue += stats_total[modid];
                    } else {
                        modvalue += transform_list[i].mods[j];
                    }
                }
                if (mainvalue > modvalue) { mainvalue = modvalue }
                break;
            case "default":
                if (mainvalue == transform_list[i].mods[0]) {
                    mainvalue = transform_list[i].mods[1];
                }
                break;
            case "minimum":
                if (mainvalue < transform_list[i].value) { mainvalue = transform_list[i].value }
                break;
            case "elemastery":
                modvalue = stats_total["elemastery"];
                mainvalue += equip_stats_calculate_elemastery(transform_list[i].stat, modvalue);
                break;
            case "enemyres":
                if (mainvalue < 0) {
                    mainvalue = mainvalue / 2;
                } else if (mainvalue > 75) {
                    mainvalue = 100 - (100 / (4 * res + 100))
                }
                break;
        }

        stats_total[mainid] = mainvalue;
    }

    return stats_total;
}

function equip_stats_calculate_elemastery(type, value) {

    if (type == "elemasteryadd") {
        var result = value / (2000 + value);
        result = 144 / 9 * result;
    } else if (type == "elemasterymult") {
        var result = value / (1400 + value);
        result = 25 / 9 * result;
    } else if (type == "elemasterycrystalize") {
        var result = value / (1400 + value);
        result = 40 / 9 * result;
    } else if (type == "elemasterybonus") {
        var result = value / (1200 + value);
        result = 45 / 9 * result;
    }

    return result * 100;

}

function equip_stats_calculate_enemyred(stats_total, party_id) {

    return 100 * stats_total["enemydef"] / (stats_total["enemydef"] + (5 * level_list_values[user_objects.user_party[party_id].level]) + 500);

}

function equip_stats_display() {
    for (var i = 0; i < display_stats.length; i++) {
        var stat_id = display_stats[i];
        if (data_stats[stat_id].display.hasOwnProperty("col")) {
            var stat = document.getElementById("display_stats_" + stat_id);
            stat.innerHTML = utils_format_stat_value(data_stats[stat_id], output_party[user_objects.user_active_character].stats.total[stat_id]);
        }

        if (data_stats[stat_id].display.hasOwnProperty("unit")) {
            if (data_stats[stat_id].display.unit.startsWith("enemy")) {
                var stat = document.getElementById("display_stat_" + data_stats[stat_id].display.unit + "_" + stat_id);
                stat.innerHTML = utils_format_stat_value(data_stats[stat_id], output_party[user_objects.user_active_character].stats.total[stat_id]);
            } else if (data_stats[stat_id].display.unit.startsWith("party")) {
                for (var ii = 0; ii < party_size; ii++) {
                    var stat = document.getElementById("display_stat_" + data_stats[stat_id].display.unit + "_" + ii + "_" + stat_id);
                    stat.innerHTML = utils_format_stat_value(data_stats[stat_id], output_party[ii].stats.total[stat_id]);
                }
            }
            
        }
    }

    for (var ii = 0; ii < party_size; ii++) {
        var stat = document.getElementById("display_stat_vision_party_" + ii);
        var stat_id = equip_stats_return_vision_stat(ii);
        stat.innerHTML = utils_format_stat_value(data_stats[stat_id], output_party[ii].stats.total[stat_id]);
        var icon = document.getElementById("display_stat_vision_party_" + ii + "_img");
        icon.className = "img_icon svg svg-" + stat_id;
        var label = document.getElementById("display_stat_vision_party_" + ii + "_label");
        label.innerHTML = data_stats[stat_id].name;
    }

}

function equip_stats_return_vision_stat(party_id) {
    var highest_val = 0;
    var highest_stat = data_characters[user_objects.user_party[party_id].id].vision;
    for (let vision in visions_variables) {
        if (output_party[party_id].stats.total[vision] > highest_val) {
            highest_val = output_party[party_id].stats.total[vision];
            highest_stat = vision;
        }
    }
    return highest_stat;
}