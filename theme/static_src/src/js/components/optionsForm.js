export default {
    loading: true,
    formData: [],
    inputKeydownHandler(event, type) {
        const pattern = type === "int" ? /^[e,.]$/ : /^[e]$/
        if (pattern.test(event.key)) event.preventDefault();
    }, 
    handleFileUpload(event, data, fieldName) {
        const file = event.target.files[0];
        if (!file || file.type !== 'application/json') {
            alert('Please upload a valid JSON file')
        } else {
            const reader = new FileReader();
            reader.onload = () => {
                let json;
                try {
                    json = JSON.parse(reader.result);
                } catch (e) {
                    console.error(e);
                    alert('Invalid JSON file');
                }
                this.formData[fieldName] = JSON.stringify(json);
                data.fileUploaded = true;
            };
            reader.readAsText(file);
        }
    },
    handleJSON(event, data, fieldName) {
        try {
            const json = JSON.parse(event.target.value);
            this.formData[fieldName] = JSON.stringify(json);
            data.isJSONValid = true;
        } catch (e) {
            data.isJSONValid = false;
        }
    },
    handleFocus(event) {
        const textarea = event.target;
        const key = event.key;
        const startedTyping = textarea.dataset.startedTyping === "true";

        if (key === 'Escape') {
            textarea.dataset.startedTyping = "false";
            textarea.blur();
            return;
        }
    
        if (!startedTyping && key !== 'Tab' && key !== 'Escape' && !(event.shiftKey && key === 'Tab')) {
            textarea.dataset.startedTyping = "true";
        }
    
        if ((key === 'Tab' || (event.shiftKey && key === 'Tab')) && !startedTyping) {
            return;
        }
    
        if (key === 'Tab' && startedTyping) {
            event.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newText = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
            textarea.value = newText;
            textarea.selectionStart = textarea.selectionEnd = start + 4;
        }
    },
    async sumbitForm() {
        const form = this.$el;
        const csrfToken = form.querySelector('input[name=csrfmiddlewaretoken]').value;
        const action = form.getAttribute('action') || "";
        const method = form.getAttribute('method') || "GET";
        const params = {};
        const formData = {};
        
        Object.keys(form.dataset).forEach(key => {
            if (key.startsWith('query')) {
                const queryKey = key.slice(5).toLowerCase();
                params[queryKey] = form.dataset[key];
            }
        });

        Object.keys(this.formData).forEach(key => {
            formData[key] = this.formData[key];
        });

        const requestURL = `${action}${params.length ? '?':''}${new URLSearchParams(params)}`

        const response = await fetch(requestURL, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) console.log("Internal Server Error!");
        const result = await response.json();
        console.log(result);
    },
}