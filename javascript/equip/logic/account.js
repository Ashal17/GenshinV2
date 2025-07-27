
async function equip_account_setup() {
    user_account = {};
    user_account.status = false;  
    await equip_account_update_status();
}

async function equip_account_update_status() {
    var response = await utils_get("/endpoints/account/get_status.php");
    await equip_account_update_status_response(response);
}

async function equip_account_update_status_response(response) {
    try {
        if (response.status == 200) {
            try {
                var response_obj = await response.json();
                if (response_obj.message.status) {
                    utils_log_debug("User is logged in");
                    user_account.status = true;
                } else {
                    utils_log_debug("User is not logged in");
                    user_account.status = false;
                }
            } catch (e) {
                utils_log_error(e + ": " + response.responseText);
            }
        } else {
            try {
                var err = await response.json();
                utils_log_error(response.status + " - " + err.error + ": " + err.message);
            } catch (e) {
                utils_log_error(e + ": " + response.responseText);
            }
        }
    } catch (e) {
        utils_log_error(e + ": " + response);
    }
}

function equip_account_preferences_save(pref_json) {
    utils_ajax("POST", "endpoints/account/set_preferences.php", null, pref_json);
}

async function equip_account_return_preferences() {
    if (user_account.status) {
        var response_obj = await utils_handle_get_response(await utils_get("/endpoints/account/get_preferences.php"));
        if (response_obj) {
            return response_obj.message.user_preferences;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

function equip_account_storage_save(storage_json) {
    utils_ajax("POST", "endpoints/account/set_storage_objects.php", null, storage_json);
}

function equip_account_artifact_storage_save(artifact_storage_json) {
    utils_ajax("POST", "endpoints/account/set_artifact_storage_objects.php", null, artifact_storage_json);
}

function equip_account_character_storage_save(character_storage_json) {
    utils_ajax("POST", "endpoints/account/set_character_storage_objects.php", null, character_storage_json);
}

function equip_account_share_save(share_json) {
    utils_ajax("POST", "endpoints/account/set_new_share.php", equip_share_update_save_response, share_json);
}

function equip_account_share_delete(share_link) {
    utils_ajax("POST", "endpoints/account/delete_share.php", equip_share_update_delete_response, share_link);
}

async function equip_account_return_storage() {
    if (user_account && user_account.status) {
        var response_obj = await utils_handle_get_response(await utils_get("/endpoints/account/get_storage.php"));
        if (response_obj) {
            return response_obj.message;
        } else {
            return {
                "storage_objects": null,
                "character_storage_objects": null,
                "artifact_storage_objects": null
            };
        }
    } else {
        return {
            "storage_objects": null,
            "character_storage_objects": null,
            "artifact_storage_objects": null
        };
    }
}

async function equip_account_return_share() {
    if (user_account && user_account.status) {
        var response_obj = await utils_handle_get_response(await utils_get("/endpoints/account/get_user_shares.php"));
        if (response_obj) {
            return response_obj.message;
        } else {
            return {
                "share_link": null,
                "share_object": null
            };
        }
    } else {
        return {
            "share_link": null,
            "share_object": null
        };
    }
}