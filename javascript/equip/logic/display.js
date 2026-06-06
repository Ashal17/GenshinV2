function equip_display_equipment_icon(icon_path, rarity, hover = null, level = null) {
    var icon = utils_create_obj("div", "equipment_icon img_stars_" + rarity);

    var icon_container = utils_create_obj("div", "equipment_img");
    icon.appendChild(icon_container);
    icon_container.appendChild(utils_create_img(null, null, icon_path));

    if (hover) {
        icon.className = icon.className + " tooltip_trigger";
        if (typeof hover === 'string' || hover instanceof String) {
            var hover_element = utils_create_obj("div", "tooltip_hover tooltip_bottom", null, hover);
            icon.onmouseover = function () { utils_update_frame_position_contain(this, hover_element, "top"); }
        } else {
            var hover_element = hover;
            icon.onmouseover = function () { utils_update_frame_position_contain(this, hover_element, "bottom"); }
        }   
        icon.appendChild(hover_element);
        
    }

    if (level !== null) {
        icon.append(utils_create_obj("div", "equipment_icon_level", null, level))
    }

    return icon
} 

function equip_display_party_icon(char_id, constel = null) {
    var char_img_container = utils_create_obj("div", "storage_party tooltip_trigger " + data_characters[char_id].vision);
    char_img_container.appendChild(utils_create_img("storage_party_img", null, "/images/icons/character/" + char_id + "/char.png"));

    var hover_element = utils_create_obj("div", "tooltip_hover tooltip_bottom", null, data_characters[char_id].name);
    char_img_container.appendChild(hover_element);
    char_img_container.onmouseover = function () { utils_update_frame_position_contain(this, hover_element, "top"); }

    if (constel !== null) {
        char_img_container.appendChild(utils_create_obj("div", "storage_party_level", null, constel));
    }
    return char_img_container;
}
