const const_token_name = "analytics_token";
const const_session_name = "analytics_session";

function utils_analytics_send() {
    var request = {};
    request.data = utils_analytics_data_get();

    utils_ajax("POST", "/endpoints/analytics.php", utils_analytics_response, JSON.stringify(request))
}

function utils_analytics_response(response) {
    try {
        if (response.status == 200) {
            utils_log_debug("Analytics success");
        } else {
            try {
                var err = JSON.parse(response.responseText);
                utils_log_error(response.status + " - " + err.error + ": " + err.message)
            } catch (e) {
                utils_log_error(e + ": " + response.responseText)
            }
        }
    } catch (e) {
        utils_log_error(e + ": " + response.responseText);
    }
}

function utils_analytics_data_get() {
    var data = {};

    data.token = utils_analytics_token_get();
    data.new = utils_analytics_session_get();
    data.host = window.location.host;
    data.path = window.location.pathname;
    data.query = window.location.search;

    return data;
}

function utils_analytics_token_get() {
    var cookie = utils_cookie_get(const_token_name);
    if (cookie) {
        var token = cookie;
    } else {
        var token = utils_random_alphanumerical(64);
    }
    utils_cookie_set(const_token_name, token, 365 * 24 * 60);
    return token;
}

function utils_analytics_session_get() {
    var cookie = utils_cookie_get(const_session_name);
    utils_cookie_set(const_session_name, 1, 30);
    if (cookie) {
        return 0;
    } else {
        return 1;
    }
}
