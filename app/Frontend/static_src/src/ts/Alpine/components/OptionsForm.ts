import { FormComponent } from "../../@types/alpineComponents/OptionsForm";


const OptionsForm = () => {
    return {
        loading: true,
        formData: {} as Record<string, any>,
        handleFileUpload(event, data, fieldName) {
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
        handleJSON(event, data, fieldName) {
            const input = event.target as HTMLTextAreaElement;
            try {
                const json = JSON.parse(input.value);
                this.formData[fieldName] = JSON.stringify(json);
                data.isJSONValid = true;
            } catch (e) {
                data.isJSONValid = false;
            }
        },
        handleFocus(event) {
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
    } as FormComponent;
};

export default OptionsForm;