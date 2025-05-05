async function utils_load_json(url) {
    var response = await fetch(url);
    return await response.json();
}

async function utils_get(url) {
    var response = await fetch(url);
    return response;
}

function utils_ajax(req_type, url, func = null, json = null) {
    var xhttp = new XMLHttpRequest();
    if (func) {
        xhttp.onload = function () { func(this); };
    } else {
        xhttp.onload = function () { utils_handle_ajax_response(this); };
    }
    
    xhttp.open(req_type, url);
    if (req_type == "POST" && json) {
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp.send(json);
    } else {
        xhttp.send();
    }
}


function utils_request(req_type, url, json = null) {
    var xhttp = new XMLHttpRequest();
    xhttp.open(req_type, url, false);
    if (req_type == "POST" && json) {
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp.send(json);
    } else {
        xhttp.send();
    }
    return xhttp;
}

async function utils_handle_get_response(response) {
    var error_message = null;
    try {
        if (response.status == 200) {
            try {
                return await response.json();
            } catch (e) {
                error_message = e + ": " + response.responseText;
            }
        } else {
            try {
                var err = await response.json();
                error_message = response.status + " - " + err.error + ": " + err.message;
            } catch (e) {
                error_message = e + ": " + response.responseText;
            }
        }
    } catch (e) {
        error_message = e + ": " + response;
    }
    utils_log_error(error_message);
    utils_message(error_message, "automatic_warn");
    return null;
}

function utils_handle_ajax_response(response) {
    var error_message = null;
    try {
        if (response.status == 200) {
            try {
                return JSON.parse(response.responseText);
            } catch (e) {
                error_message = e + ": " + response.responseText;
            }
        } else {
            try {
                var err = JSON.parse(response.responseText);
                error_message = response.status + " - " + err.error + ": " + err.message;
            } catch (e) {
                error_message = e + ": " + response.responseText;
            }
        }
    } catch (e) {
        error_message = e + ": " + response;
    }
    utils_log_error(error_message);
    utils_message(error_message, "automatic_warn");
    return null;
}

function utils_local_storage_copy(item1, item2) {
    var value = localStorage.getItem(item1);
    value = utils_local_storage_check_null(value);
    localStorage.setItem(item2, value);
}

function utils_local_storage_swap(item1, item2) {
    var value1 = localStorage.getItem(item1);
    value1 = utils_local_storage_check_null(value1);
    var value2 = localStorage.getItem(item2);
    value2 = utils_local_storage_check_null(value2);
    localStorage.setItem(item2, value1);
    localStorage.setItem(item1, value2);
}

function utils_local_storage_check_null(value) {
    if (value == null || value == "null") { return "" } else { return value }
}

function utils_local_storage_size() {
    var _lsTotal = 0,
        _xLen, _x;
    for (_x in localStorage) {
        if (!localStorage.hasOwnProperty(_x)) {
            continue;
        }
        _xLen = ((localStorage[_x].length + _x.length) * 2);
        _lsTotal += _xLen;
        console.log(_x.substr(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB")
    };
    console.log("Total = " + (_lsTotal / 1024).toFixed(2) + " KB");
}

function utils_cookie_set(cname, cvalue, exminutes) {
    var d = new Date();
    d.setTime(d.getTime() + (exminutes * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;domain=ashal.eu;samesite=lax";
}

function utils_cookie_get(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
