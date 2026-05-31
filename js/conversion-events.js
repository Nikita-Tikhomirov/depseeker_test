(function() {
    function safeName(value) {
        return String(value || '').replace(/[^a-zA-Z0-9_:-]/g, '_').slice(0, 80) || 'generator_event';
    }

    function safeDetail(detail) {
        var input = detail && typeof detail === 'object' ? detail : {};
        var output = {};
        var keys = Object.keys(input);
        for (var i = 0; i < keys.length; i++) {
            var key = safeName(keys[i]);
            var value = input[keys[i]];
            if (value == null) continue;
            if (typeof value === 'number' || typeof value === 'boolean') {
                output[key] = value;
            } else {
                output[key] = String(value).slice(0, 200);
            }
        }
        return output;
    }

    window.trackGeneratorEvent = function(name, detail) {
        var eventName = safeName(name);
        var payload = safeDetail(detail);
        payload.event = eventName;
        payload.page_path = window.location.pathname;
        payload.page_search = window.location.search;

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(payload);

        try {
            window.dispatchEvent(new CustomEvent('generator:conversion', { detail: payload }));
        } catch (err) {
            // Older browsers can still use dataLayer/gtag without CustomEvent.
        }

        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, payload);
        }

        return payload;
    };
})();
