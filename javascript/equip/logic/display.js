function equip_display_equipment_icon(icon_path, rarity, hover_text = null, level = null) {
    var icon = utils_create_obj("div", "equipment_icon img_stars_" + rarity);

    var icon_container = utils_create_obj("div", "equipment_img");
    icon.appendChild(icon_container);
    icon_container.appendChild(utils_create_img(null, null, icon_path));

    if (hover_text) {
        icon.className = icon.className + " tooltip_trigger";
        icon.appendChild(utils_create_obj("div", "tooltip_hover tooltip_top", null, hover_text));
    }

    return icon
}