function equip_display_equipment_icon(icon_path, rarity, hover = null, level = null) {
    var icon = utils_create_obj("div", "equipment_icon img_stars_" + rarity);

    var icon_container = utils_create_obj("div", "equipment_img");
    icon.appendChild(icon_container);
    icon_container.appendChild(utils_create_img(null, null, icon_path));

    if (hover) {
        icon.className = icon.className + " tooltip_trigger";
        if (typeof hover === 'string' || hover instanceof String) {
            var hover_element = utils_create_obj("div", "tooltip_hover tooltip_top", null, hover);
        } else {
            var hover_element = hover;            
        }   
        icon.appendChild(hover_element);
        icon.onmouseover = function () { utils_update_frame_position_contain(this, hover_element, "bottom"); }
    }
    return icon
} 
