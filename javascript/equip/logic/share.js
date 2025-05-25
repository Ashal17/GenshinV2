function equip_share_load_account(storage_account) {
    if (storage_account) {
        utils_log_debug("Found Shares at account.");
        equip_setup_share_objects(storage_account);
    }
}

async function equip_share_load_url() {
    var url = location.search;
    if (url == "" || url.length > 11) {
        return false;
    }
    utils_log_debug("Found Share in URL");
    var response_obj = await utils_handle_get_response(await utils_get("/endpoints/share" + url));
    if (response_obj && response_obj.message && response_obj.message.share_object) {
        utils_log_debug("Shared URL found in database.");
        utils_url_set("/equip");
        return response_obj.message.share_object;
    } else {
        utils_log_debug("Shared URL not found in database.");
        utils_message("Shared URL not found in database.", "automatic_warn");
        return false;
    }
}

function equip_share_change_trigger() {
    equip_share_display_all();
}

function equip_share_change_save() {
    if (share_objects.saved_shares.length < 100) {
        var share = {};
        share.share_object = user_objects;
        share.character_id = user_objects.user_party[user_objects.user_active_character].id;
        share.character_name = data_characters[user_objects.user_party[user_objects.user_active_character].id].name;
        share.vision = data_characters[user_objects.user_party[user_objects.user_active_character].id].vision;
        var share_json = JSON.stringify(share);
        utils_loading_show();
        equip_account_share_save(share_json);
    } else {       
        utils_message("Maximum of 100 Active Shares. Delete some before creating new one.", "automatic_warn");
    }
}

function equip_share_change_delete(index) {
    var share_delete_json = JSON.stringify({ "share_link": share_objects.saved_shares[index].share_link });
    utils_loading_show();
    equip_account_share_delete(share_delete_json);
}

function equip_share_change_copy_link(index) {
    var saved_share = share_objects.saved_shares[index];
    utils_copy_clipboard(location.protocol + "//" + location.hostname + "/equip?" + saved_share.share_link, "Copied Share " + saved_share.share_link, document.getElementById("active_prompt"));
}

function equip_share_update_new(response_obj) {
    var share = {};
    share.share_link = response_obj.share_link;
    share.share_object = structuredClone(user_objects);
    share_objects.saved_shares.push(share);
    utils_copy_clipboard(location.protocol + "//" + location.hostname + "/equip?" + share.share_link, "Copied Share " + share.share_link, document.getElementById("active_prompt"));
}

function equip_share_update_delete(response_obj) {
    var deleted_share_link = response_obj.deleted_share;
    var index = utils_array_lookup_parameter(share_objects.saved_shares, "share_link", deleted_share_link);
    share_objects.saved_shares.splice(index, 1);
}

function equip_share_update_load(response_obj) {
    if (response_obj) {
        equip_storage_load(response_obj.share_object);
    } else {
        utils_message("No Share for URL found.", "automatic_warn");
    }    
}

function equip_share_update_save_response(response) {
    try {
        if (response.status == 200) {
            try {
                if (response.response) {
                    var response_obj = JSON.parse(response.responseText);
                    equip_share_update_new(response_obj.message);
                    equip_share_change_trigger();
                    utils_loading_hide();
                } else {
                    utils_loading_show_error("Share response is empty", "Share response is empty")
                }
            } catch (e) {
                utils_loading_show_error(e, "Parsing Error occured:\n" + e)
            }
        } else {
            try {
                var err = JSON.parse(response.responseText);
                utils_loading_show_error(response.status + " - " + err.error + ": " + err.message, "Share Error occured:\n" + err.message)
            } catch (e) {
                utils_loading_show_error(e + ": " + response.responseText, "Unknown Share Error occured:\n" + e)
            }
        }
    } catch (e) {
        utils_loading_show_error(e + ": " + response, "Parsing Error occured:\n" + e);
    }
}

function equip_share_update_delete_response(response) {
    try {
        if (response.status == 200) {
            try {
                if (response.response) {
                    var response_obj = JSON.parse(response.responseText);
                    equip_share_update_delete(response_obj.message);
                    equip_share_change_trigger();
                    utils_loading_hide();
                } else {
                    utils_loading_show_error("Share response is empty", "Share response is empty")
                }
            } catch (e) {
                utils_loading_show_error(e, "Parsing Error occured:\n" + e)
            }
        } else {
            try {
                var err = JSON.parse(response.responseText);
                utils_loading_show_error(response.status + " - " + err.error + ": " + err.message, "Share Error occured:\n" + err.message);
            } catch (e) {
                utils_loading_show_error(e + ": " + response.responseText, "Unknown Share Error occured:\n" + e);
            }
        }
    } catch (e) {
        utils_loading_show_error(e + ": " + response, "Parsing Error occured:\n" + e);
    }
}

function equip_share_update_load_response(response) {
    try {
        if (response.status == 200) {
            try {
                if (response.response) {
                    var response_obj = JSON.parse(response.responseText);
                    equip_share_update_load(response_obj.message);
                } else {
                    utils_loading_show_error("Share response is empty", "Share response is empty")
                }
            } catch (e) {
                utils_loading_show_error(e, "Parsing Error occured:\n" + e)
            }
        } else {
            try {
                var err = JSON.parse(response.responseText);
                utils_loading_show_error(response.status + " - " + err.error + ": " + err.message, "Share Error occured:\n" + err.message);
            } catch (e) {
                utils_loading_show_error(e + ": " + response.responseText, "Unknown Share Error occured:\n" + e);
            }
        }
    } catch (e) {
        utils_loading_show_error(e + ": " + response, "Parsing Error occured:\n" + e);
    }
}

function equip_share_display_all() {
    equip_share_display_active();

    var parent = document.getElementById("share_column");
    utils_delete_children(parent, 0);      

    var share_display_objects = [];

    for (var i = 0; i < share_objects.saved_shares.length; i++) {
        share_display_objects.push(equip_share_display(i));
    }
    share_display_objects.reverse();

    for (var i = 0; i < share_display_objects.length; i++) {
        parent.appendChild(share_display_objects[i]);
    }
}

function equip_share_display_active() {
    var parent = document.getElementById("share_column_active");
    utils_delete_children(parent, 0);

    var obj = utils_create_obj("div", "share_storage_row", "share_row_active");
    obj.appendChild(equip_share_display_party(user_objects, null, null));
    parent.appendChild(obj);
}

function equip_share_display(index) {
    var saved_share = share_objects.saved_shares[index];
    var obj = utils_create_obj("div", "share_storage_row", "share_row_" + saved_share.share_link);
    obj.appendChild(equip_share_display_party(saved_share.share_object, saved_share.share_link, index));

    return obj;
}

function equip_share_display_party(share_object, share_link, index) {
    var party_container = utils_create_obj("div", "share_party_container");
    for (var i = 0; i < share_object.user_party.length; i++) {
        var character = data_characters[share_object.user_party[i].id];
        var vision = character.vision;
        var character_container = utils_create_obj("div", "share_party_character");
        var character_name = utils_create_obj("div", "share_party_character_name");
        character_name.appendChild(utils_create_img_svg(vision));
        character_name.appendChild(utils_create_obj("div", vision, null, utils_object_get_value(character, "short_name", character.name)));
        character_container.appendChild(character_name);
        if (share_object.user_active_character == i) {
            character_container.className += " share_active_character";
        }
        character_container.appendChild(equip_character_storage_display_equip(share_object.user_party[i]));
        party_container.appendChild(character_container);
    }
    var share_buttons = utils_create_obj("div", "share_party_buttons");
    party_container.appendChild(share_buttons);
    if (share_link) {
        var btn_share = utils_create_img_btn("content-copy", null, "Copy Share", "party_button_share_" + index, "share_party_btn");
        btn_share.onclick = function (event) { equip_share_change_copy_link(index); event.preventDefault(); };
        share_buttons.appendChild(btn_share);
        share_buttons.appendChild(utils_create_img_button_prompt_confirm("delete-forever", "Delete Share", "party_button_delete_" + index, "Delete this Share?", equip_share_change_delete, index, "share_party_btn", "active_prompt_share"));
        party_container.appendChild(utils_create_obj("p", "share_party_link", null, share_link));
    } else {
        share_buttons.appendChild(utils_create_img_button_prompt_confirm("share", "Create Share", "party_button_create", "Create new Share?", equip_share_change_save, null, "share_party_btn", "active_prompt_share"));
        party_container.appendChild(utils_create_obj("p", "share_party_link", null, null));
    }
    
    return party_container;
}
