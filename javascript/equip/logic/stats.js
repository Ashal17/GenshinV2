const output_party_stat_objects = ["basic", "weapon", "artifacts", "effects"];
const stats_visions = ["physical", "anemo", "cryo", "dendro", "geo", "electro", "hydro", "pyro", "healing"];

function equip_stats_update_total_all() {
    for (var i = 0; i < party_size; i++) {
        equip_stats_update_total(i);
    }
}

function equip_stats_update_total(party_id) {
    
    var stats_total = { ...default_stats };

    for (var i = 0; i < output_party_stat_objects.length; i++) {
        var stats_obj = output_party[party_id].stats[output_party_stat_objects[i]];
        for (var ii = 0; ii < stats_obj.length; ii++) {
            stats_total[stats_obj[ii].id] += stats_obj[ii].value;
        }
    }

    output_party[party_id].stats.total = equip_stats_update_transformations(party_id, stats_total);
}

function equip_stats_update_transformations(party_id, stats_total) {
    stats_total = equip_stats_calculate_tranformation(stats_total, "main");
    stats_total = equip_stats_calculate_tranformation(stats_total, "mult_hp");
    stats_total = equip_stats_calculate_tranformation(stats_total, "mult_atkdef");
    stats_total = equip_stats_calculate_tranformation(stats_total, "merge");
    stats_total = equip_stats_calculate_tranformation(stats_total, "elemastery");

    stats_total["enemyred"] = equip_stats_calculate_enemyred(stats_total, party_id);

    return stats_total;
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
    for (var i = 0; i < stats_visions.length; i++) {
        if (output_party[party_id].stats.total[stats_visions[i]] > highest_val) {
            highest_val = output_party[party_id].stats.total[stats_visions[i]];
            highest_stat = stats_visions[i];
        }
    }

    return highest_stat;
}