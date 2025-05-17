interface FieldData {
    fileUploaded?: boolean;
    isJSONValid?: boolean;
}

interface FormComponent {
    $el?: HTMLElement;
    formData: Record<string, any>;
    inputKeydownHandler(event: KeyboardEvent, type: "int" | "float"): void;
    handleFileUpload(event: Event, data: FieldData, fieldName: string): void;
    handleJSON(event: Event, data: FieldData, fieldName: string): void;
    handleFocus(event: KeyboardEvent): void;
    submitForm(): Promise<void>;
}

const OptionsForm = () => (function() {
    return {
        loading: true,
        formData: {} as Record<string, any>,
    
        inputKeydownHandler(event: KeyboardEvent, type: "int" | "float") {
        const pattern = type === "int" ? /^[e,.]$/ : /^[e]$/;
        if (pattern.test(event.key)) event.preventDefault();
        },
    
        handleFileUpload(event: Event, data: FieldData, fieldName: string) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file || file.type !== 'application/json') {
            alert('Please upload a valid JSON file');
            return;
        }
    
        const reader = new FileReader();
        reader.onload = () => {
            try {
            const json = JSON.parse(reader.result as string);
            this.formData[fieldName] = JSON.stringify(json);
            data.fileUploaded = true;
            } catch (e) {
            console.error(e);
            alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
        },
    
        handleJSON(event: Event, data: FieldData, fieldName: string) {
        const input = event.target as HTMLTextAreaElement;
        try {
            const json = JSON.parse(input.value);
            this.formData[fieldName] = JSON.stringify(json);
            data.isJSONValid = true;
        } catch (e) {
            data.isJSONValid = false;
        }
        },
    
        handleFocus(event: KeyboardEvent) {
        const textarea = event.target as HTMLTextAreaElement;
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
            const start = textarea.selectionStart ?? 0;
            const end = textarea.selectionEnd ?? 0;
            const newText = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
            textarea.value = newText;
            textarea.selectionStart = textarea.selectionEnd = start + 4;
        }
        },
    
        async submitForm() {
        const form = this.$el as HTMLFormElement;
        const csrfInput = form.querySelector('input[name=csrfmiddlewaretoken]') as HTMLInputElement;
        const csrfToken = csrfInput?.value || "";
        const action = form.getAttribute('action') || "";
        const method = form.getAttribute('method') || "GET";
    
        const params: Record<string, string> = {};
        const formData: Record<string, any> = {};
    
        Object.keys(form.dataset).forEach(key => {
            if (key.startsWith('query')) {
            const queryKey = key.slice(5).toLowerCase();
            params[queryKey] = form.dataset[key]!;
            }
        });
    
        Object.keys(this.formData).forEach(key => {
            formData[key] = this.formData[key];
        });
    
        const queryString = new URLSearchParams(params).toString();
        const requestURL = `${action}${queryString ? '?' + queryString : ''}`;
    
        const response = await fetch(requestURL, {
            method,
            headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(formData),
        });
    
        if (!response.ok) {
            console.error("Internal Server Error!");
            return;
        }
    
        const result = await response.json();
        console.log(result);
        },
    } as FormComponent
});

export default OptionsForm