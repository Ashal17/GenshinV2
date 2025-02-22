const keep_frame_order = true;

function utils_loading_hide(sleep) {
    setTimeout(_ => {
        document.getElementById("loader_error").style.display = "none";
        document.getElementById("loader").style.display = "none";
        document.getElementById("loader_overlay").style.display = "none";
    }, sleep)
}

function utils_loading_show() {
    document.getElementById("loader").style.display = "initial";
    document.getElementById("loader_overlay").style.display = "initial";
}

function utils_loading_show_error(err, mess) {
    utils_loading_show();
    document.getElementById("loader_error").style.display = "block";
    if (mess) {
        document.getElementById("loader_error_text").innerHTML = mess;
    } else {
        document.getElementById("loader_error_text").innerHTML = "Error has occured.";
    }
    if (err) {
        utils_log_error(err)
    }
}

async function utils_loading(funct) {
    utils_loading_show();
    error_count = 0;
    setTimeout(_ => {
        if (funct) {
            try {
                funct();
            } catch (err) {
                error_count++
            }

        }
        if (error_count == 0) {
            utils_loading_hide();
        } else {
            utils_loading_show_error(err)
        }
    }, 100)
}

async function utils_message(text, class_name) {
    var container = document.getElementById("automatic");
    var message = document.createElement('p');
    message.className = "automatic_text fadeout " + class_name;
    message.innerHTML = text;
    container.appendChild(message);

    setTimeout(_ => {
        message.remove();
    }, 3000)
}

function utils_create_obj(type = "div", classes = null, id = null, content = null) {
    var newobj = document.createElement(type);
    if (classes) {
        newobj.className = classes;
    }
    if (content || content === 0) {
        newobj.innerHTML = content;
    }
    if (id) {
        newobj.id = id;
    }
    return newobj;
}

function utils_create_img(classes, id, img) {
    var newimg = utils_create_obj("img", classes, id);
    newimg.src = img;
    return newimg;
}

function utils_preferences_change_trigger() {
    utils_preferences_save();
}

function utils_preferences_save() {
    var preferences_json = JSON.stringify(user_preferences);
    localStorage.setItem("user_preferences", preferences_json);
}

function utils_create_frames(parent_id, frame_definitions) {
    parent = document.getElementById(parent_id);

    for (var i = 0; i < frame_definitions.length; i++) {
        parent.appendChild(utils_create_frame(frame_definitions, i));
    }
    utils_frame_reorder_display(frame_definitions);
}

function utils_create_frame(frame_definitions, index) {
    var frame_id = frame_definitions[index]["id"];

    var frame_obj = utils_create_obj("div", "frame_window", frame_id);

    var frame_header_obj = utils_create_obj("div", "frame_window_header");
    frame_obj.appendChild(frame_header_obj);

    frame_header_obj.appendChild(utils_create_obj("div", "frame_window_header_text", null, frame_definitions[index]["text"]));
    frame_header_obj.appendChild(utils_create_img_btn("chevron-up", function () { utils_frame_move(frame_definitions, index, -1); }, "Move Up"));
    frame_header_obj.appendChild(utils_create_img_btn("chevron-down", function () { utils_frame_move(frame_definitions, index, 1); }, "Move Down"));
    frame_header_obj.appendChild(utils_create_img_btn("dock-window", function () { utils_frame_hideshow(frame_definitions, index); }, "Dock"));

    var frame_content_obj = utils_create_obj("div", "frame_window_content", frame_id + "_content");
    frame_obj.appendChild(frame_content_obj);

    return frame_obj;
}

function utils_frame_move(frame_definitions, index, move_direction) {

    if (frame_definitions[index]["display"] || keep_frame_order) {
        var new_order = frame_definitions[index]["order"] + move_direction;

        var max_order = 0;
        for (var i = 0; i < frame_definitions.length; i++) {
            if (frame_definitions[i]["display"]) {
                max_order++;
            } 
        }

        if (new_order < 0 || new_order >= max_order) {
            return;
        }

        for (var i = 0; i < frame_definitions.length; i++) {
            if (i == index) {
                frame_definitions[i]["order"] += move_direction;
            } else if (frame_definitions[i]["order"] == new_order) {
                frame_definitions[i]["order"] += -move_direction;
            }
        }

        utils_preferences_change_trigger();
        utils_frame_reorder_display(frame_definitions);
    }

}

function utils_frame_hideshow(frame_definitions, index) {

    var previous_order = frame_definitions[index]["order"];

    if (frame_definitions[index]["display"]) {
        frame_definitions[index]["display"] = false;
        if (!keep_frame_order) {
            frame_definitions[index]["order"] = frame_definitions.length;
            for (var i = 0; i < frame_definitions.length; i++) {
                if (frame_definitions[i]["order"] >= previous_order) {
                    frame_definitions[i]["order"] += -1;
                }
            }
        }
             
    } else {
        if (!keep_frame_order) {
            var max_order = 0;
            for (var i = 0; i < frame_definitions.length; i++) {
                if (frame_definitions[i]["display"]) {
                    max_order++;
                } else {
                    if (frame_definitions[i]["order"] < previous_order) {
                        frame_definitions[i]["order"] += 1;
                    }
                }
            }
            frame_definitions[index]["order"] = max_order;
        }
        
        frame_definitions[index]["display"] = true;  
    }
    utils_preferences_change_trigger();
    utils_frame_reorder_display(frame_definitions);
}

function utils_frame_reorder_display(frame_definitions) {
    var parent = document.getElementById(frame_definitions[0]["id"]).parentElement;

    for (var i = 0; i < frame_definitions.length; i++) {
        for (var ii = 0; ii < frame_definitions.length; ii++) {
            if (frame_definitions[ii]["order"] == i) {
                var frame_obj = document.getElementById(frame_definitions[ii]["id"]);
                if (frame_definitions[ii]["display"]) {
                    frame_obj.className = "frame_window";
                } else {
                    frame_obj.className = "frame_window minimized";
                }
                parent.appendChild(frame_obj);
            }
        }
        
    }

}

function utils_format_stat_value(stat, value) {
    if (value == Infinity) {
        value = "&infin;";
    }

    if (stat.type == "percent") {
        if (typeof value == "number") {
            return (utils_number_format(Math.round(value * 10) / 10) + "%");
        } else {
            return value + "%";
        }
    } else if (stat.type == "flat") {
        if (typeof value == "number") {
            return utils_number_format(Math.round(value));
        } else {
            return value;
        }
    } else {
        if (typeof value == "number") {
            return utils_number_format(value);
        } else {
            return value;
        }
    }
}


function utils_delete_children(obj, limit) {
    while (obj.childNodes.length > limit) {
        obj.removeChild(obj.lastChild);
    }
}

function utils_create_bonus(bonus) {
    if (bonus.custom_name) {
        return utils_create_statline(bonus.custom_name, utils_format_stat_value(data_stats[bonus.stat], bonus.value));
    } else {
        return utils_create_stat(bonus.stat, bonus.value);       
    }
}

function utils_create_stat(stat_id, value) {
    if (stat_id) {
        var stat = data_stats[stat_id];
        return utils_create_statline(stat.name, utils_format_stat_value(stat, value));
    } else {
        return utils_create_statline(value.replace('{{', '<span class="effect_value">').replace('}}', '</span>'), null);
    }
}

function utils_create_statline(text, value, value_class) {
    var line = utils_create_obj("div", "statline");
    line.appendChild(utils_create_obj("p", null, null, text));
    if (value || value === 0) {
        line.appendChild(utils_create_obj("p", value_class, null, value));
    }
    return line;
}

function utils_create_img_btn(svg_name, func, hover_text, btn_id, container_class) {

    var btn = document.createElement("div");
    if (btn_id) {
        btn.id = btn_id;
    }
    btn.className = "img_button";

    var icon = document.createElement("div");
    icon.className = "img_icon svg svg-" + svg_name;
    if (func) {
        icon.onclick = function () { func(); };
    }    
    btn.appendChild(icon);

    if (hover_text) {
        var btn_hover = document.createElement("div");
        btn_hover.className = "img_button_hover";
        btn_hover.innerHTML = hover_text;
        btn.appendChild(btn_hover);
    }

    if (container_class) {
        var container = utils_create_obj("div", "img_button_container " + container_class);
        container.appendChild(btn);
        return container;
    } else {
        return btn;
    }    
}

function utils_create_img_svg(svg_name, btn_id, container_class) {
    var btn = document.createElement("div");
    if (btn_id) {
        btn.id = btn_id;
    }
    btn.className = "img_svg";

    var icon = document.createElement("div");
    icon.className = "img_icon svg svg-" + svg_name;
    btn.appendChild(icon);

    if (container_class) {
        var container = utils_create_obj("div", "img_button_container " + container_class);
        container.appendChild(btn);
        return container;
    } else {
        return btn;
    }
}

function utils_create_img_button_prompt_confirm(svg_name, hover_text, btn_id, text, func, input, container_class) {
    var container = utils_create_obj("div", "img_button_container " + container_class);

    var btn = utils_create_img_btn(svg_name, null, hover_text, btn_id, null);
    btn.onclick = function (event) { utils_create_prompt_confirm(text, btn_id, func, input, container); event.preventDefault(); };

    container.appendChild(btn);
    return container;
}

function utils_create_img_button_prompt_input(svg_name, hover_text, btn_id, text, func, input, current_value, container_class) {
    var container = utils_create_obj("div", "img_button_container " + container_class);

    var btn = utils_create_img_btn(svg_name, null, hover_text, btn_id, null);
    btn.onclick = function (event) { utils_create_prompt_input(text, btn_id, func, input, current_value, container); event.preventDefault(); };
    
    container.appendChild(btn);
    return container;
}

function utils_create_label_img(svg_name, hover_text, img_id, label_id) {
    var btn = document.createElement("div");

    btn.className = "label_img";

    var icon = document.createElement("div");
    icon.className = "img_icon svg svg-" + svg_name;
    if (img_id) {
        icon.id = img_id;
    }
    btn.appendChild(icon);

    var btn_hover = document.createElement("div");
    btn_hover.className = "label_img_hover";
    btn_hover.innerHTML = hover_text;
    if (label_id) {
        btn_hover.id = label_id;
    }
    btn.appendChild(btn_hover);

    return btn;
}

function utils_destroy(obj) {
    if (obj) {
        while (obj.childNodes.length > 0) {
            obj.removeChild(obj.lastChild);
        }
        if (obj.parentNode) {
            obj.parentNode.removeChild(obj);
        }
    }
}

function utils_destroy_current_prompt() {

    var current_prompt = document.getElementById("active_prompt");
    if (current_prompt) {
        utils_destroy(current_prompt);
    }
}

function utils_setup_prompt_destroyer() {
    document.addEventListener('click', event => {
        if (!event.defaultPrevented) {
            var current_prompt = document.getElementById("active_prompt");
            if (current_prompt && !current_prompt.contains(event.target)) utils_destroy_current_prompt();
        }  
    });
}

function utils_create_prompt(btn, class_name, parent = null) {
    var current_prompt = document.getElementById("active_prompt");

    if (current_prompt) {
        utils_destroy(current_prompt);
        if (current_prompt.name == String(btn)) {
            return null;
        }
    }

    if (parent && typeof parent == "string") {
        var parent_obj = document.getElementById(parent);
    } else if (parent) {
        var parent_obj = parent;
    } else if (typeof btn == "string") {
        var parent_obj = document.getElementById(btn).parentElement;
    } else {
        var parent_obj = btn.parentElement;
    }

    var prompt = utils_create_obj("div", "prompt " + class_name, "active_prompt")
    prompt.name = String(btn);
    parent_obj.appendChild(prompt);

    return prompt;
}

function utils_create_prompt_select(text, btn, objects, parent=null) {

    var prompt = utils_create_prompt(btn, "prompt_select", parent);
    if (!prompt) {
        return;
    }

    var headerline = utils_create_obj("div", "prompt_header");
    prompt.appendChild(headerline);

    var search = utils_create_obj("input", "prompt_select_search", "prompt_select_search");
    search.placeholder = "Search...";
    search.addEventListener("input", function () {
        utils_filter_prompt_select(objects, search.value);
    });
    headerline.appendChild(search);

    headerline.appendChild(utils_create_obj("div", "prompt_header_text", null, text));

    var decline = utils_create_obj("button", "prompt_button prompt_button_decline", null, "&#10006");
    decline.onclick = function () { utils_destroy_current_prompt(); };
    prompt.addEventListener("keyup", function (event) {
        if (event.code === "Escape") {
            event.preventDefault();
            utils_destroy_current_prompt();
        }
    });
    headerline.appendChild(decline);

    var options = document.createElement('div');
    options.className = "prompt_select_options";
    prompt.appendChild(options);

    for (var i = 0; i < objects.length; i++) {
        options.appendChild(objects[i]);
    }

    

    search.focus();
}

function utils_filter_prompt_select(objects, input) {
    var filter = [];

    if (input) {
        for (var i = 0; i < objects.length; i++) {
            if (utils_includes_alt_names(objects[i].name, objects[i].alt_names, input)) {
                filter.push(objects[i].id);
            }
        }
    }

    for (var i = 0; i < objects.length; i++) {
        if (filter.length == 0 || filter.includes(objects[i].id)) {
            document.getElementById(objects[i].id).style.display = "flex";
        } else {
            document.getElementById(objects[i].id).style.display = "none";
        }
    }

    if (input && filter.length == 0) {
        document.getElementById("prompt_select_search").style.color = "var(--red)";
    } else {
        document.getElementById("prompt_select_search").style.color = "var(--white)";
    }
}

function utils_create_prompt_values(btn, func, value_list, input, parent = null) {

    var prompt = utils_create_prompt(btn, "prompt_values", parent);
    if (!prompt) {
        return;
    }

    for (let i = 0; i < value_list.length; i++) {
        let id = null;
        let text = null;
        if (typeof value_list[i] === 'object') {
            text = value_list[i].text;
            id = value_list[i].id;
        } else {
            text = value_list[i];  
            id = i;
        }

        var value = utils_create_obj("div", "prompt_value", null, text);
        value.onclick = function () { func(id, input); utils_destroy_current_prompt(); };
        prompt.appendChild(value);
    }
}

function utils_create_prompt_confirm(text, btn, func, input, parent = null) {
    if (text) {
        var prompt = utils_create_prompt(btn, "prompt_input", parent);
    } else {
        var prompt = utils_create_prompt(btn, "prompt_input_simple", parent);
    }

    if (!prompt) {
        return;
    }

    if (text) {

        prompt.appendChild(utils_create_obj("div", "prompt_header_text", null, text));
    }
    var line = utils_create_obj("div", "container");
    prompt.appendChild(line);

    prompt.addEventListener("keyup", function (event) {
        if (event.code === "Enter") {
            event.preventDefault();
            func(input);
            utils_destroy_current_prompt();
        }
    });
    prompt.addEventListener("keyup", function (event) {
        if (event.code === "Escape") {
            event.preventDefault();
            utils_destroy_current_prompt();
        }
    });

    var accept = utils_create_obj("button", "prompt_button prompt_button_accept", null, "&#10003");
    accept.onclick = function () { func(input); utils_destroy_current_prompt(); };
    line.appendChild(accept);

    var decline = utils_create_obj("button", "prompt_button prompt_button_decline", null, "&#10006");
    decline.onclick = function () { utils_destroy_current_prompt(); };
    line.appendChild(decline);
}

function utils_create_prompt_input(text, btn, func, input, current_value, parent = null) {
    if (text) {
        var prompt = utils_create_prompt(btn, "prompt_input", parent);
    } else {
        var prompt = utils_create_prompt(btn, "prompt_input_simple", parent);
    }
    
    if (!prompt) {
        return;
    }

    if (text) {

        prompt.appendChild(utils_create_obj("div", "prompt_header_text", null, text));
    }

    var input_field = utils_create_obj("input", "prompt_input_field");
    input_field.type = "text";
    input_field.value = current_value;
    prompt.appendChild(input_field);

    var line = utils_create_obj("div", "container");
    prompt.appendChild(line);

    prompt.addEventListener("keyup", function (event) {
        if (event.code === "Enter") {
            event.preventDefault();
            func(input_field.value, input);
            utils_destroy_current_prompt();
        }
    });
    prompt.addEventListener("keyup", function (event) {
        if (event.code === "Escape") {
            event.preventDefault();
            utils_destroy_current_prompt();
        }
    });

    var accept = utils_create_obj("button", "prompt_button prompt_button_accept", null, "&#10003");
    accept.onclick = function () { func(input_field.value, input); utils_destroy_current_prompt(); };
    line.appendChild(accept);

    var decline = utils_create_obj("button", "prompt_button prompt_button_decline",null, "&#10006");
    decline.onclick = function () { utils_destroy_current_prompt(); };
    line.appendChild(decline);

    input_field.focus();
    input_field.select();
}


